from psycopg2.extras import RealDictCursor

from backend.dbsync.logger import info


class SchemaExtractor:
    """
    PostgreSQL şema objelerinin DDL bilgisini üretir.

    Şimdilik:
        - CREATE TABLE
        - CREATE INDEX

    Daha sonra:
        - FK
        - UNIQUE
        - CHECK
        - TRIGGER
        - FUNCTION
        - VIEW
        - EXTENSION
    """

    def __init__(self, connection):

        self.conn = connection

    # ==========================================================
    # CREATE TABLE SQL
    # ==========================================================

    def get_table_definition(self, table):

        """
        Şimdilik tablo kolonlarını okuyup CREATE TABLE SQL'i üretir.
        """

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

            rows = cur.fetchall()

        ddl = []

        ddl.append(f'CREATE TABLE "{table}" (')

        columns = []

        for row in rows:

            col = f'"{row["column_name"]}" {row["data_type"]}'

            if row["column_default"]:

                col += f' DEFAULT {row["column_default"]}'

            if row["is_nullable"] == "NO":

                col += " NOT NULL"

            columns.append(col)

        ddl.append(",\n".join(columns))

        ddl.append(");")

        return "\n".join(ddl)

    # ==========================================================
    # INDEXLER
    # ==========================================================

    def get_indexes(self, table):

        query = """
        SELECT
            indexdef
        FROM pg_indexes
        WHERE schemaname='public'
          AND tablename=%s
        ORDER BY indexname;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query, (table,))

            return [row["indexdef"] for row in cur.fetchall()]

    # ==========================================================
    # TÜM ŞEMA
    # ==========================================================

    def extract(self):

        query = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        ORDER BY table_name;
        """

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(query)

            tables = [r["table_name"] for r in cur.fetchall()]

        result = {}

        for table in tables:

            info(f"DDL hazırlanıyor : {table}")

            result[table] = {

                "create_table": self.get_table_definition(table),

                "indexes": self.get_indexes(table)

            }

        return result