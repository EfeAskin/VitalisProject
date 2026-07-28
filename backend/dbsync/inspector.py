import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql


class DatabaseInspector:

    def __init__(self, connection):
        self.conn = connection

    # ---------------------------------------------------------
    # TÜM TABLOLAR
    # ---------------------------------------------------------

    def get_tables(self):

        sql = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        ORDER BY table_name;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql)

            return [row["table_name"] for row in cur.fetchall()]

    # ---------------------------------------------------------
    # TABLO SÜTUNLARI
    # ---------------------------------------------------------

    def get_columns(self, table):

        query = """
        SELECT
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema='public'
        AND table_name=%s
        ORDER BY ordinal_position;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query, (table,))

            columns = {}

            for row in cur.fetchall():

                columns[row["column_name"]] = {

                    "data_type": row["data_type"],

                    "nullable": row["is_nullable"] == "YES",

                    "default": row["column_default"]

                }

            return columns

    # ---------------------------------------------------------
    # PRIMARY KEY
    # ---------------------------------------------------------

    def get_primary_keys(self, table):

        sql = """
        SELECT
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE
            tc.table_schema='public'
            AND tc.table_name=%s
            AND tc.constraint_type='PRIMARY KEY';
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(sql, (table,))

            return [row["column_name"] for row in cur.fetchall()]

    # ---------------------------------------------------------
    # FOREIGN KEY
    # ---------------------------------------------------------

    def get_foreign_keys(self, table):

        sql = """
        SELECT

            kcu.column_name,

            ccu.table_name AS foreign_table,

            ccu.column_name AS foreign_column

        FROM information_schema.table_constraints tc

        JOIN information_schema.key_column_usage kcu

        ON tc.constraint_name = kcu.constraint_name

        JOIN information_schema.constraint_column_usage ccu

        ON tc.constraint_name = ccu.constraint_name

        WHERE

            tc.constraint_type='FOREIGN KEY'

            AND tc.table_schema='public'

            AND tc.table_name=%s;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(sql, (table,))

            return cur.fetchall()

    # ---------------------------------------------------------
    # INDEXLER
    # ---------------------------------------------------------

    def get_indexes(self, table):

        sql = """

        SELECT

            indexname,

            indexdef

        FROM pg_indexes

        WHERE schemaname='public'

        AND tablename=%s;

        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(sql, (table,))

            return cur.fetchall()

    # ---------------------------------------------------------
    # SATIR SAYISI
    # ---------------------------------------------------------
    def get_row_count(self, table):

        query = sql.SQL("SELECT COUNT(*) AS row_count FROM {}").format(
            sql.Identifier(table)
        )

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query)

            return cur.fetchone()["row_count"]

    # ---------------------------------------------------------
    # TÜM DATABASE ÖZETİ
    # ---------------------------------------------------------

    def inspect(self):

        db = {}

        tables = self.get_tables()

        for table in tables:

            db[table] = {

                "columns": self.get_columns(table),

                "primary_keys": self.get_primary_keys(table),

                "foreign_keys": self.get_foreign_keys(table),

                "indexes": self.get_indexes(table),

                "rows": self.get_row_count(table)

            }

        return db