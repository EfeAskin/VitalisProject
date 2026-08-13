from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from backend.dbsync.logger import logger


class DataExtractor:
    """
    Database Data Extractor

    Veritabanındaki gerçek kayıtları (rows) okur.

    Bu sınıf hiçbir INSERT / UPDATE / DELETE işlemi yapmaz.

    Sadece DataComparator ve DataMigrator için veri sağlar.
    """

    def __init__(self, connection):

        self.conn = connection

    # ==========================================================
    # TABLES
    # ==========================================================

    def get_tables(self):

        query = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        ORDER BY table_name;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query)

            return [row["table_name"] for row in cur.fetchall()]

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    def get_primary_key(self, table):

        query = """
        SELECT
            kcu.column_name
        FROM information_schema.table_constraints tc

        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema

        WHERE
            tc.table_schema='public'
            AND tc.table_name=%s
            AND tc.constraint_type='PRIMARY KEY'

        ORDER BY kcu.ordinal_position

        LIMIT 1;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query, (table,))

            row = cur.fetchone()

            if row:

                return row["column_name"]

            return None

    # ==========================================================
    # FOREIGN KEY DEPENDENCIES
    # ==========================================================

    def get_foreign_keys(self):

        """
        Veritabanındaki Foreign Key ilişkilerini okur.

        child_table  -> FK'yi taşıyan tablo
        parent_table -> referans verilen tablo

        Örneğin:

        workout_template_exercises.template_id
                    ->
        workout_templates.id
        """

        query = """
        SELECT
            tc.table_name AS child_table,
            kcu.column_name AS child_column,
            ccu.table_name AS parent_table,
            ccu.column_name AS parent_column
        FROM information_schema.table_constraints AS tc

        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema

        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema

        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public';
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query)

            return cur.fetchall()

    # ==========================================================
    # DEPENDENCY ORDER
    # ==========================================================

    def get_dependency_order(self):

        """
        Tabloları Foreign Key bağımlılıklarına göre sıralar.

        Parent tablolar child tablolardan önce gelir.

        Örnek:

        workout_templates
                ↓
        workout_template_exercises
        """

        tables = self.get_tables()

        foreign_keys = self.get_foreign_keys()

        # ------------------------------------------------------
        # Graph oluştur
        #
        # parent -> child
        # ------------------------------------------------------

        graph = {
            table: set()
            for table in tables
        }

        indegree = {
            table: 0
            for table in tables
        }

        for fk in foreign_keys:

            child = fk["child_table"]
            parent = fk["parent_table"]

            # Kendi kendine FK varsa dependency sırasını bozmasın
            if child == parent:
                continue

            if child not in graph:
                graph[child] = set()

            if parent not in graph:
                graph[parent] = set()

            # Aynı parent-child ilişkisi composite FK nedeniyle
            # birden fazla kez gelebilir.
            if child not in graph[parent]:

                graph[parent].add(child)

                indegree[child] += 1

        # ------------------------------------------------------
        # Topological Sort
        # ------------------------------------------------------

        ready = sorted(
            table
            for table in graph
            if indegree[table] == 0
        )

        ordered_tables = []

        while ready:

            current = ready.pop(0)

            ordered_tables.append(current)

            for child in sorted(graph[current]):

                indegree[child] -= 1

                if indegree[child] == 0:

                    ready.append(child)

            ready.sort()

        # ------------------------------------------------------
        # Cycle kontrolü
        # ------------------------------------------------------

        remaining = sorted(
            table
            for table in graph
            if table not in ordered_tables
        )

        if remaining:

            logger.warning(
                "Foreign Key cycle tespit edildi. "
                f"Fallback sıra kullanılacak: {remaining}"
            )

            ordered_tables.extend(remaining)

        logger.info(
            "Data dependency sırası oluşturuldu:"
        )

        for index, table in enumerate(
            ordered_tables,
            start=1
        ):

            logger.info(
                f"  {index}. {table}"
            )

        return ordered_tables

    # ==========================================================
    # GET ROW COUNT
    # ==========================================================

    def get_row_count(self, table):

        query = sql.SQL(
            "SELECT COUNT(*) AS count FROM {}"
        ).format(

            sql.Identifier(table)

        )

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query)

            return cur.fetchone()["count"]

    # ==========================================================
    # GET ALL ROWS
    # ==========================================================

    def get_rows(self, table):

        primary_key = self.get_primary_key(table)

        if primary_key:

            query = sql.SQL(
                "SELECT * FROM {} ORDER BY {}"
            ).format(

                sql.Identifier(table),

                sql.Identifier(primary_key)

            )

        else:

            query = sql.SQL(
                "SELECT * FROM {}"
            ).format(

                sql.Identifier(table)

            )

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query)

            return cur.fetchall()

    # ==========================================================
    # GET SINGLE ROW
    # ==========================================================

    def get_row(self, table, value):

        primary_key = self.get_primary_key(table)

        if primary_key is None:

            return None

        query = sql.SQL(
            """
            SELECT *
            FROM {}
            WHERE {}=%s
            """
        ).format(

            sql.Identifier(table),

            sql.Identifier(primary_key)

        )

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query, (value,))

            return cur.fetchone()

    # ==========================================================
    # GET TABLE DATA
    # ==========================================================

    def get_table(self, table):

        return {

            "primary_key": self.get_primary_key(table),

            "row_count": self.get_row_count(table),

            "rows": self.get_rows(table)

        }

    # ==========================================================
    # GET DATABASE
    # ==========================================================

    def extract(self):

        logger.info("Database verileri okunuyor...")

        database = {}

        tables = self.get_tables()

        for table in tables:

            logger.info(
                f"Veriler okunuyor -> {table}"
            )

            database[table] = self.get_table(table)

        logger.info(
            "Veri okuma tamamlandı."
        )

        return database