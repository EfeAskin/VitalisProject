from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from backend.dbsync.logger import logger
from backend.dbsync.transaction_manager import TransactionManager


class MigrationEngine:
    """
    =========================================================

                VITALIS DATABASE MIGRATION ENGINE

    Local   --->  Neon

    Neon    --->  Local

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

    # ==========================================================
    # MAIN
    # ==========================================================

    def execute(self):

        if not self.changes:

            logger.info(
                "Schema zaten senkron."
            )

            return

        logger.info("=" * 70)
        logger.info("Migration Başladı")
        logger.info("=" * 70)

        ordered_changes = (
            self.order_changes_by_dependencies()
        )

        with TransactionManager(
            self.target_conn
        ) as cursor:

            for change in ordered_changes:

                logger.info(
                    f"Migration Action -> "
                    f"{change['action']}"
                )

                self.execute_change(
                    cursor,
                    change
                )

        logger.info("=" * 70)
        logger.info("Migration Tamamlandı")
        logger.info("=" * 70)

    # ==========================================================
    # CHANGE ORDER
    # ==========================================================

    def order_changes_by_dependencies(self):

        """
        CREATE TABLE işlemlerini Foreign Key bağımlılıklarına
        göre parent -> child sırasına koyar.

        Örnek:

            chat_rooms
                ↓
            chat_messages

        veya:

            tickets
                ↓
            ticket_messages
        """

        create_changes = [
            change
            for change in self.changes
            if change.get("action") == "create_table"
        ]

        other_changes = [
            change
            for change in self.changes
            if change.get("action") != "create_table"
        ]

        if len(create_changes) <= 1:

            return (
                create_changes
                + other_changes
            )

        create_table_names = {
            change["table"]
            for change in create_changes
        }

        dependencies = {
            table: set()
            for table in create_table_names
        }

        try:

            query = """
            SELECT
                tc.table_name AS child_table,
                ccu.table_name AS parent_table
            FROM information_schema.table_constraints tc

            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
                AND tc.table_schema = ccu.table_schema

            WHERE
                tc.table_schema='public'
                AND tc.constraint_type='FOREIGN KEY';
            """

            cursor = None

            try:

                cursor = self.source_conn.cursor(
                    cursor_factory=RealDictCursor
                )

                cursor.execute(query)

                rows = cursor.fetchall()

            finally:

                if cursor:

                    cursor.close()

            for row in rows:

                child = row[
                    "child_table"
                ]

                parent = row[
                    "parent_table"
                ]

                if (
                    child in create_table_names
                    and parent in create_table_names
                    and child != parent
                ):

                    dependencies[
                        child
                    ].add(
                        parent
                    )

        except Exception as e:

            logger.warning(
                "CREATE TABLE dependency bilgileri "
                f"okunamadı: {e}"
            )

        ordered_create_tables = []

        remaining = set(
            create_table_names
        )

        while remaining:

            ready = sorted(
                table
                for table in remaining
                if dependencies[
                    table
                ].isdisjoint(
                    remaining
                )
            )

            if not ready:

                logger.warning(
                    "CREATE TABLE dependency cycle "
                    "veya çözülemeyen bağımlılık tespit edildi. "
                    "Alfabetik fallback sıra kullanılacak."
                )

                ready = sorted(
                    remaining
                )

            for table in ready:

                ordered_create_tables.append(
                    table
                )

                remaining.remove(
                    table
                )

        create_change_by_table = {
            change["table"]: change
            for change in create_changes
        }

        ordered_create_changes = [
            create_change_by_table[table]
            for table in ordered_create_tables
        ]

        logger.info(
            "CREATE TABLE migration sırası:"
        )

        for index, change in enumerate(
            ordered_create_changes,
            start=1
        ):

            logger.info(
                f"  {index}. "
                f"{change['table']}"
            )

        return (
            ordered_create_changes
            + other_changes
        )

    # ==========================================================
    # DISPATCHER
    # ==========================================================

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
                f"Desteklenmeyen migration : "
                f"{action}"
            )

    # ==========================================================
    # CREATE TABLE
    # ==========================================================

    def create_table(
        self,
        cursor,
        change
    ):

        table = change["table"]

        if table not in self.source_schema:

            logger.error(
                f"{table} source schema içinde "
                "bulunamadı."
            )

            return

        table_schema = (
            self.source_schema[
                table
            ]
        )

        # ------------------------------------------------------
        # SEQUENCE
        # ------------------------------------------------------

        for sequence_sql in table_schema.get(
            "sequences",
            []
        ):

            logger.info(
                f"CREATE SEQUENCE -> "
                f"{table}"
            )

            self.run_sql(
                sequence_sql
            )

        # ------------------------------------------------------
        # CREATE TABLE
        # ------------------------------------------------------

        ddl = table_schema[
            "create_table"
        ]

        logger.info(
            f"CREATE TABLE -> {table}"
        )

        self.run_sql(
            ddl
        )

        # ------------------------------------------------------
        # PRIMARY KEY
        # ------------------------------------------------------

        primary_key_sql = table_schema.get(
            "primary_key"
        )

        if primary_key_sql:

            logger.info(
                f"PRIMARY KEY -> {table}"
            )

            self.run_sql(
                primary_key_sql
            )

        # ------------------------------------------------------
        # FOREIGN KEYS
        #
        # Parent tabloların create işlemi dependency ordering
        # ile daha önce yapılıyor.
        # ------------------------------------------------------

        for foreign_key_sql in table_schema.get(
            "foreign_keys",
            []
        ):

            logger.info(
                f"FOREIGN KEY -> {table}"
            )

            self.run_sql(
                foreign_key_sql
            )

        # ------------------------------------------------------
        # INDEXES
        # ------------------------------------------------------

        for index_sql in table_schema.get(
            "indexes",
            []
        ):

            self.run_sql(
                index_sql
            )

    # ==========================================================
    # DROP TABLE
    # ==========================================================

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
            """
            DROP TABLE IF EXISTS {} CASCADE;
            """
        ).format(
            sql.Identifier(table)
        )

        self.run_sql(
            query
        )

    # ==========================================================
    # ADD COLUMN
    # ==========================================================

    def add_column(
        self,
        cursor,
        change
    ):

        table = change["table"]
        column = change["column"]
        definition = change["definition"]

        logger.info(
            f"ADD COLUMN -> "
            f"{table}.{column}"
        )

        # ------------------------------------------------------
        # Önce kolonu NULL olarak ekle
        # ------------------------------------------------------

        sql_parts = [
            definition["data_type"]
        ]

        if definition["default"] is not None:

            sql_parts.append(
                f"DEFAULT {definition['default']}"
            )

        column_definition = " ".join(
            sql_parts
        )

        query = sql.SQL(
            """
            ALTER TABLE {}
            ADD COLUMN {} {};
            """
        ).format(
            sql.Identifier(table),
            sql.Identifier(column),
            sql.SQL(
                column_definition
            )
        )

        self.run_sql(
            query
        )

        # ------------------------------------------------------
        # DEFAULT varsa mevcut NULL kayıtları doldur
        # ------------------------------------------------------

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
                sql.SQL(
                    str(
                        definition["default"]
                    )
                ),
                sql.Identifier(column)
            )

            self.run_sql(
                query
            )

        # ------------------------------------------------------
        # NOT NULL
        # ------------------------------------------------------

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

                self.run_sql(
                    query
                )

            except Exception:

                logger.warning(
                    f"{table}.{column} için "
                    "NOT NULL uygulanamadı. "
                    "Mevcut satırlarda NULL "
                    "değerler bulundu."
                )

                raise

    # ==========================================================
    # DROP COLUMN
    # ==========================================================

    def drop_column(
        self,
        cursor,
        change
    ):

        table = change["table"]
        column = change["column"]

        logger.warning(
            f"DROP COLUMN -> "
            f"{table}.{column}"
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

        self.run_sql(
            query
        )

    # ==========================================================
    # MODIFY COLUMN
    # ==========================================================

    def modify_column(
        self,
        cursor,
        change
    ):

        table = change["table"]
        column = change["column"]

        definition = change.get(
            "local"
        )

        if not definition:

            logger.error(
                f"{table}.{column} için "
                "column definition bulunamadı."
            )

            return

        data_type = definition.get(
            "data_type"
        )

        nullable = definition.get(
            "nullable"
        )

        default = definition.get(
            "default"
        )

        if not data_type:

            raise ValueError(
                f"{table}.{column} için "
                "data_type bulunamadı."
            )

        logger.info(
            f"MODIFY COLUMN -> "
            f"{table}.{column}"
        )

        # ------------------------------------------------------
        # TYPE
        # ------------------------------------------------------

        query = sql.SQL(
            """
            ALTER TABLE {}
            ALTER COLUMN {}
            TYPE {};
            """
        ).format(
            sql.Identifier(table),
            sql.Identifier(column),
            sql.SQL(
                data_type
            )
        )

        self.run_sql(
            query
        )

        # ------------------------------------------------------
        # DEFAULT
        # ------------------------------------------------------

        if default is None:

            query = sql.SQL(
                """
                ALTER TABLE {}
                ALTER COLUMN {}
                DROP DEFAULT;
                """
            ).format(
                sql.Identifier(table),
                sql.Identifier(column)
            )

        else:

            query = sql.SQL(
                """
                ALTER TABLE {}
                ALTER COLUMN {}
                SET DEFAULT {};
                """
            ).format(
                sql.Identifier(table),
                sql.Identifier(column),
                sql.SQL(
                    str(default)
                )
            )

        self.run_sql(
            query
        )

        # ------------------------------------------------------
        # NULLABLE
        # ------------------------------------------------------

        if nullable:

            query = sql.SQL(
                """
                ALTER TABLE {}
                ALTER COLUMN {}
                DROP NOT NULL;
                """
            ).format(
                sql.Identifier(table),
                sql.Identifier(column)
            )

        else:

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

        self.run_sql(
            query
        )

        logger.info(
            f"MODIFY COLUMN tamamlandı -> "
            f"{table}.{column}"
        )

    # ==========================================================
    # CREATE INDEX
    # ==========================================================

    def create_index(
        self,
        cursor,
        change
    ):

        index_sql = change["sql"]

        logger.info(
            "CREATE INDEX"
        )

        if isinstance(
            index_sql,
            str
        ):

            index_sql = index_sql.replace(
                "CREATE UNIQUE INDEX",
                "CREATE UNIQUE INDEX IF NOT EXISTS"
            )

            index_sql = index_sql.replace(
                "CREATE INDEX",
                "CREATE INDEX IF NOT EXISTS"
            )

        self.run_sql(
            index_sql
        )

    # ==========================================================
    # DROP INDEX
    # ==========================================================

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

        self.run_sql(
            query
        )

    # ==========================================================
    # RUN SQL
    # ==========================================================

    def run_sql(
        self,
        query
    ):

        cursor = None
        savepoint_name = "migration_sql_savepoint"

        try:

            cursor = self.target_conn.cursor(
                cursor_factory=RealDictCursor
            )

            # ------------------------------------------------------
            # Her SQL komutunu SAVEPOINT ile koru.
            #
            # Böylece bir komut duplicate/benign hata verirse
            # bütün migration transaction'ı bozulmaz.
            # ------------------------------------------------------

            cursor.execute(
                f"SAVEPOINT {savepoint_name};"
            )

            if isinstance(
                query,
                str
            ):

                logger.info(
                    query
                )

                cursor.execute(
                    query
                )

            else:

                logger.info(
                    query.as_string(
                        self.target_conn
                    )
                )

                cursor.execute(
                    query
                )

            cursor.execute(
                f"RELEASE SAVEPOINT {savepoint_name};"
            )

            logger.info(
                "SQL çalıştırıldı."
            )

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
                    f"SQL atlandı "
                    f"(zaten mevcut): {e}"
                )

                try:

                    cursor.execute(
                        f"ROLLBACK TO SAVEPOINT "
                        f"{savepoint_name};"
                    )

                    cursor.execute(
                        f"RELEASE SAVEPOINT "
                        f"{savepoint_name};"
                    )

                except Exception as savepoint_error:

                    logger.error(
                        "SAVEPOINT geri alma başarısız: "
                        f"{savepoint_error}"
                    )

                    raise

                return False

            # ------------------------------------------------------
            # Gerçek hata
            # ------------------------------------------------------

            try:

                cursor.execute(
                    f"ROLLBACK TO SAVEPOINT "
                    f"{savepoint_name};"
                )

            except Exception:

                pass

            logger.error(
                f"Migration başarısız : {e}"
            )

            raise

        finally:

            if cursor:

                cursor.close()

    # ==========================================================
    # TRANSACTION HELPERS
    # ==========================================================

    def begin(self):

        self.target_conn.autocommit = False

        logger.info(
            "Transaction başlatıldı."
        )

    def commit(self):

        self.target_conn.commit()

        logger.info(
            "Transaction Commit."
        )

    def rollback(self):

        self.target_conn.rollback()

        logger.warning(
            "Transaction Rollback."
        )

    # ==========================================================
    # CONNECTION
    # ==========================================================

    def close(self):

        try:

            if self.target_conn:

                self.target_conn.close()

                logger.info(
                    "Migration connection kapatıldı."
                )

        except Exception as e:

            logger.error(
                f"Connection kapatılamadı : {e}"
            )

    # ==========================================================
    # DEBUG
    # ==========================================================

    def print_changes(self):

        logger.info("=" * 70)
        logger.info("CHANGE LIST")
        logger.info("=" * 70)

        if not self.changes:

            logger.info(
                "Değişiklik bulunamadı."
            )

            return

        for i, change in enumerate(
            self.changes,
            start=1
        ):

            logger.info(
                f"{i}. {change}"
            )

    # ==========================================================
    # MAGIC METHODS
    # ==========================================================

    def __len__(self):

        return len(
            self.changes
        )

    def __bool__(self):

        return len(
            self.changes
        ) > 0

    def __repr__(self):

        return (
            f"<MigrationEngine "
            f"changes={len(self.changes)}>"
        )