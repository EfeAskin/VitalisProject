from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from backend.dbsync.logger import logger
from backend.dbsync.transaction_manager import TransactionManager


class MigrationEngine:
    """
    =========================================================

                VITALIS DATABASE MIGRATION ENGINE

    Local  --->  Neon

    Neon   --->  Local

    ChangeSet
          │
          ▼
    SQL Generator
          │
          ▼
    Executor

    =========================================================
    """

    def __init__(
        self,
        source_connection,
        target_connection,
        changes,
        source_schema
    ):

        self.source_conn = source_connection
        self.target_conn = target_connection

        self.changes = changes
        self.source_schema = source_schema

    # =====================================================
    # MAIN
    # =====================================================

    def execute(self):

        if not self.changes:

            logger.info("Schema zaten senkron.")
            return

        logger.info("=" * 70)
        logger.info("Migration Başladı")
        logger.info("=" * 70)

        with TransactionManager(self.target_conn) as cursor:

            for change in self.changes:

                logger.info(
                    f"Migration Action -> {change['action']}"
                )

                self.execute_change(
                    cursor,
                    change
                )

        logger.info("=" * 70)
        logger.info("Migration Tamamlandı")
        logger.info("=" * 70)

    # =====================================================
    # DISPATCHER
    # =====================================================

    def execute_change(
        self,
        cursor,
        change
    ):

        action = change["action"]

        if action == "create_table":

            self.create_table(
                cursor,
                change
            )

        elif action == "drop_table":

            self.drop_table(
                cursor,
                change
            )

        elif action == "add_column":

            self.add_column(
                cursor,
                change
            )

        elif action == "drop_column":

            self.drop_column(
                cursor,
                change
            )

        elif action == "modify_column":

            self.modify_column(
                cursor,
                change
            )

        elif action == "create_index":

            self.create_index(
                cursor,
                change
            )

        elif action == "drop_index":

            self.drop_index(
                cursor,
                change
            )

        else:

            logger.warning(
                f"Desteklenmeyen migration : {action}"
            )

    # =====================================================
    # CREATE TABLE
    # =====================================================

    def create_table(
        self,
        cursor,
        change
    ):

        table = change["table"]

        if table not in self.source_schema:

            logger.error(
                f"{table} source schema içinde bulunamadı."
            )
            return

        ddl = self.source_schema[table]["create_table"]

        logger.info(
            f"CREATE TABLE -> {table}"
        )

        self.run_sql(ddl)

        for index_sql in self.source_schema[
            table
        ].get(
            "indexes",
            []
        ):

            self.run_sql(index_sql)

    # =====================================================
    # DROP TABLE
    # =====================================================

    def drop_table(
        self,
        cursor,
        change
    ):

        table = change["table"]

        logger.warning(
            f"DROP TABLE -> {table}"
        )

        query = sql.SQL(
            "DROP TABLE IF EXISTS {} CASCADE;"
        ).format(

            sql.Identifier(table)

        )

        self.run_sql(query)

    # =====================================================
    # ADD COLUMN
    # =====================================================

    def add_column(
        self,
        cursor,
        change
    ):

        table = change["table"]

        column = change["column"]

        definition = change["definition"]

        logger.info(
            f"ADD COLUMN -> {table}.{column}"
        )

        # -------------------------------------------------
        # Önce kolonu NULL olarak ekle
        # -------------------------------------------------

        sql_parts = [

            definition["data_type"]

        ]

        if definition["default"] is not None:

            sql_parts.append(
                f"DEFAULT {definition['default']}"
            )

        column_definition = " ".join(sql_parts)

        query = sql.SQL(
            """
            ALTER TABLE {}
            ADD COLUMN {} {};
            """
        ).format(

            sql.Identifier(table),

            sql.Identifier(column),

            sql.SQL(column_definition)

        )

        self.run_sql(query)

        # -------------------------------------------------
        # Eğer DEFAULT varsa mevcut NULL kayıtları doldur
        # -------------------------------------------------

        if definition["default"] is not None:

            query = sql.SQL(
                """
                UPDATE {}
                SET {} = {}
                WHERE {} IS NULL;
                """
            ).format(

                sql.Identifier(table),

                sql.Identifier(column),

                sql.SQL(str(definition["default"])),

                sql.Identifier(column)

            )

            self.run_sql(query)

        # -------------------------------------------------
        # En son NOT NULL uygula
        # -------------------------------------------------

        if not definition["nullable"]:

            query = sql.SQL(
                """
                ALTER TABLE {}
                ALTER COLUMN {}
                SET NOT NULL;
                """
            ).format(

                sql.Identifier(table),

                sql.Identifier(column)

            )

            try:

                self.run_sql(query)

            except Exception:

                logger.warning(
                    f"{table}.{column} için NOT NULL uygulanamadı. "
                    "Mevcut satırlarda NULL değerler bulundu."
                )

                raise

    # =====================================================
    # DROP COLUMN
    # =====================================================

    def drop_column(
        self,
        cursor,
        change
    ):

        table = change["table"]

        column = change["column"]

        logger.warning(
            f"DROP COLUMN -> {table}.{column}"
        )

        query = sql.SQL(
            """
            ALTER TABLE {}
            DROP COLUMN IF EXISTS {};
            """
        ).format(

            sql.Identifier(table),

            sql.Identifier(column)

        )

        self.run_sql(query)

    # =====================================================
    # CREATE INDEX
    # =====================================================

    def create_index(
        self,
        cursor,
        change
    ):

        index_sql = change["sql"]

        logger.info("CREATE INDEX")

        if isinstance(index_sql, str):

            index_sql = index_sql.replace(
                "CREATE INDEX",
                "CREATE INDEX IF NOT EXISTS"
            )

            index_sql = index_sql.replace(
                "CREATE UNIQUE INDEX",
                "CREATE UNIQUE INDEX IF NOT EXISTS"
            )

        self.run_sql(index_sql)

    # =====================================================
    # DROP INDEX
    # =====================================================

    def drop_index(
        self,
        cursor,
        change
    ):

        index = change["index"]

        logger.warning(
            f"DROP INDEX -> {index}"
        )

        query = sql.SQL(
            """
            DROP INDEX IF EXISTS {};
            """
        ).format(

            sql.Identifier(index)

        )

        self.run_sql(query)

    # =====================================================
    # RUN SQL
    # =====================================================

    def run_sql(self, query):

        cursor = None

        try:

            cursor = self.target_conn.cursor(
                cursor_factory=RealDictCursor
            )

            if isinstance(query, str):

                logger.info(query)

                cursor.execute(query)

            else:

                logger.info(
                    query.as_string(self.target_conn)
                )

                cursor.execute(query)

            logger.info("SQL çalıştırıldı.")

            return True

        except Exception as e:

            error = str(e).lower()

            if (
                "already exists" in error
                or "duplicate column" in error
                or "duplicate object" in error
                or "duplicate_table" in error
                or "duplicatecolumn" in error
            ):

                logger.warning(
                    f"SQL atlandı (zaten mevcut): {e}"
                )

                # transaction temizlenmeli
                self.target_conn.rollback()

                return False

            logger.error(
                f"Migration başarısız : {e}"
            )

            raise

        finally:

            if cursor:

                cursor.close()

    # =====================================================
    # TRANSACTION HELPERS
    # =====================================================

    def begin(self):

        self.target_conn.autocommit = False

        logger.info("Transaction başlatıldı.")

    def commit(self):

        self.target_conn.commit()

        logger.info("Transaction Commit.")

    def rollback(self):

        self.target_conn.rollback()

        logger.warning("Transaction Rollback.")

    # =====================================================
    # CONNECTION
    # =====================================================

    def close(self):

        try:

            if self.target_conn:

                self.target_conn.close()

                logger.info("Migration connection kapatıldı.")

        except Exception as e:

            logger.error(
                f"Connection kapatılamadı : {e}"
            )

    # =====================================================
    # DEBUG
    # =====================================================

    def print_changes(self):

        logger.info("=" * 70)
        logger.info("CHANGE LIST")
        logger.info("=" * 70)

        if not self.changes:

            logger.info("Değişiklik bulunamadı.")
            return

        for i, change in enumerate(self.changes, start=1):

            logger.info(f"{i}. {change}")

    # =====================================================
    # MAGIC METHODS
    # =====================================================

    def __len__(self):

        return len(self.changes)

    def __bool__(self):

        return len(self.changes) > 0

    def __repr__(self):

        return (
            f"<MigrationEngine "
            f"changes={len(self.changes)}>"
        )