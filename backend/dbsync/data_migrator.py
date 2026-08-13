from psycopg2 import sql
from psycopg2.extras import RealDictCursor, Json

from backend.dbsync.logger import logger


class DataMigrator:
    """
    Data Migration Engine

    DataComparator tarafından üretilen Change List'i
    hedef veritabanına uygular.

    Desteklenen işlemler

    - INSERT
    - UPDATE (UPSERT)
    """

    def __init__(self, target_connection, changes):

        self.conn = target_connection
        self.changes = changes

    # ==========================================================
    # MAIN
    # ==========================================================

    def execute(self):

        if not self.changes:

            logger.info("Aktarılacak veri bulunamadı.")

            return

        logger.info("=" * 70)
        logger.info("DATA MIGRATION BAŞLADI")
        logger.info("=" * 70)

        for change in self.changes:

            action = change["action"]

            if action == "insert":

                self.insert(change)

            elif action == "update":

                self.update(change)

            else:

                logger.warning(
                    f"Desteklenmeyen işlem : {action}"
                )

        logger.info("=" * 70)
        logger.info("DATA MIGRATION TAMAMLANDI")
        logger.info("=" * 70)

    # ==========================================================
    # INSERT
    # ==========================================================

    def insert(self, change):

        table = change["table"]
        row = change["row"]
        primary_key = change["primary_key"]

        self.upsert(

            table,

            row,

            primary_key

        )

    # ==========================================================
    # UPDATE
    # ==========================================================

    def update(self, change):

        table = change["table"]
        row = change["row"]
        primary_key = change["primary_key"]

        self.upsert(

            table,

            row,

            primary_key

        )

    # ==========================================================
    # UPSERT
    # ==========================================================

    def upsert(

        self,

        table,

        row,

        primary_key

    ):

        columns = list(row.keys())

        values = [
            row[column]
            for column in columns
        ]

        insert_columns = sql.SQL(", ").join(

            sql.Identifier(column)

            for column in columns

        )

        placeholders = sql.SQL(", ").join(

            sql.Placeholder()

            for _ in columns

        )

        update_columns = [

            sql.SQL("{} = EXCLUDED.{}").format(

                sql.Identifier(column),

                sql.Identifier(column)

            )

            for column in columns

            if column != primary_key

        ]

        query = sql.SQL("""

            INSERT INTO {table}
            ({columns})

            VALUES
            ({values})

            ON CONFLICT ({pk})

            DO UPDATE SET

            {updates}

        """).format(

            table=sql.Identifier(table),

            columns=insert_columns,

            values=placeholders,

            pk=sql.Identifier(primary_key),

            updates=sql.SQL(", ").join(
                update_columns
            )

        )

        self.execute_sql(

            query,

            values,

            table,

            row[primary_key]

        )

    # ==========================================================
    # SQL EXECUTOR
    # ==========================================================

    def execute_sql(

        self,

        query,

        values,

        table,

        row_id

    ):

        cursor = None

        try:

            cursor = self.conn.cursor(

                cursor_factory=RealDictCursor

            )

            # --------------------------------------------------
            # JSON / JSONB DEĞERLERİ
            # --------------------------------------------------
            #
            # PostgreSQL'den gelen JSON/JSONB alanları
            # psycopg2 tarafından Python dict/list olarak
            # dönebilir.
            #
            # Örneğin:
            #
            # {
            #     "assigned_days": ["Pzt", "Sal"],
            #     "template_name": "Göğüs & Arka Kol"
            # }
            #
            # psycopg2 doğrudan dict/list değerlerini SQL
            # parametresi olarak adapte edemez.
            #
            # Bu nedenle dict ve list değerlerini Json()
            # adapter'ı ile PostgreSQL JSON/JSONB formatına
            # uygun şekilde bağlıyoruz.
            # --------------------------------------------------

            adapted_values = [

                Json(value)
                if isinstance(value, (dict, list))
                else value

                for value in values

            ]

            cursor.execute(

                query,

                adapted_values

            )

            self.conn.commit()

            logger.info(

                f"{table} -> {row_id} senkronize edildi."

            )

        except Exception as e:

            self.conn.rollback()

            logger.error(

                f"{table} -> {row_id}"

            )

            logger.error(str(e))

            raise

        finally:

            if cursor:

                cursor.close()