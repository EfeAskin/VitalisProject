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

            logger.info(f"Veriler okunuyor -> {table}")

            database[table] = self.get_table(table)

        logger.info("Veri okuma tamamlandı.")

        return database