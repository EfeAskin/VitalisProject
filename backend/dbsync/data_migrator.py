import json

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

        # ------------------------------------------------------
        # Hedef veritabanındaki tablo kolon tiplerini cache'lemek
        # için kullanılır.
        # ------------------------------------------------------

        self.column_type_cache = {}

    # ==========================================================
    # COLUMN TYPES
    # ==========================================================

    def get_column_types(self, table):

        """
        Hedef PostgreSQL veritabanında verilen tablonun
        kolon tiplerini information_schema üzerinden okur.

        Örnek sonuç:

        {
            "id": "integer",
            "program_details": "jsonb",
            "program_names": "ARRAY",
            "name": "text"
        }
        """

        if table in self.column_type_cache:

            return self.column_type_cache[table]

        query = """
            SELECT
                column_name,
                data_type,
                udt_name
            FROM information_schema.columns
            WHERE
                table_schema = 'public'
                AND table_name = %s
            ORDER BY ordinal_position;
        """

        cursor = None

        try:

            cursor = self.conn.cursor(
                cursor_factory=RealDictCursor
            )

            cursor.execute(
                query,
                (table,)
            )

            rows = cursor.fetchall()

            column_types = {}

            for row in rows:

                column_name = row["column_name"]

                data_type = row["data_type"]

                udt_name = row["udt_name"]

                column_types[column_name] = {
                    "data_type": data_type,
                    "udt_name": udt_name
                }

            self.column_type_cache[table] = column_types

            return column_types

        except Exception as e:

            logger.error(
                f"Kolon tipleri okunamadı -> {table}"
            )

            logger.error(str(e))

            raise

        finally:

            if cursor:

                cursor.close()

    # ==========================================================
    # VALUE ADAPTER
    # ==========================================================

    def adapt_value(
        self,
        value,
        column_type
    ):

        """
        Python değerlerini hedef PostgreSQL kolon tipine
        uygun hale getirir.

        Desteklenen özel durumlar:

        - json
        - jsonb
        - PostgreSQL ARRAY
        - JSON string -> ARRAY dönüşümü
        - dict/list -> JSON
        """

        if value is None:

            return None

        if not column_type:

            # --------------------------------------------------
            # Kolon tipi bulunamadıysa mevcut JSON davranışını
            # koruyoruz.
            # --------------------------------------------------

            if isinstance(value, dict):

                return Json(value)

            return value

        data_type = column_type.get(
            "data_type"
        )

        # ======================================================
        # JSON / JSONB
        # ======================================================

        if data_type in ("json", "jsonb"):

            # Python dict/list ise doğrudan Json adapter
            if isinstance(
                value,
                (dict, list)
            ):

                return Json(value)

            # JSON olarak gelen string'i de JSON olarak gönder.
            if isinstance(value, str):

                try:

                    parsed_value = json.loads(value)

                    return Json(parsed_value)

                except (
                    json.JSONDecodeError,
                    TypeError,
                    ValueError
                ):

                    # JSON parse edilemeyen string'i
                    # mevcut haliyle Json string olarak aktar.
                    return Json(value)

            return value

        # ======================================================
        # POSTGRESQL ARRAY
        # ======================================================

        if data_type == "ARRAY":

            # --------------------------------------------------
            # Zaten Python list ise psycopg2 bunu PostgreSQL
            # ARRAY'e adapte edebilir.
            # --------------------------------------------------

            if isinstance(value, list):

                return value

            # --------------------------------------------------
            # Tuple da PostgreSQL array olarak gönderilebilir.
            # --------------------------------------------------

            if isinstance(value, tuple):

                return value

            # --------------------------------------------------
            # Local taraftan JSON biçiminde string geldiyse:
            #
            # '["A", "B", "C"]'
            #
            # bunu Python listesine çeviriyoruz.
            # --------------------------------------------------

            if isinstance(value, str):

                stripped_value = value.strip()

                if (
                    stripped_value.startswith("[")
                    and stripped_value.endswith("]")
                ):

                    try:

                        parsed_value = json.loads(
                            stripped_value
                        )

                        if isinstance(
                            parsed_value,
                            list
                        ):

                            return parsed_value

                    except (
                        json.JSONDecodeError,
                        TypeError,
                        ValueError
                    ):

                        pass

                # --------------------------------------------------
                # Zaten PostgreSQL array literal formatıysa:
                #
                # {"A","B","C"}
                #
                # olduğu gibi bırakılır.
                # --------------------------------------------------

                return value

            return value

        # ======================================================
        # NON JSON / NON ARRAY
        # ======================================================

        # ------------------------------------------------------
        # dict burada normalde olmamalı.
        #
        # Ancak hedef kolon tipi metadata'da beklenmedik bir
        # şekilde geldiyse mevcut dict desteğini kaybetmemek
        # için güvenli fallback uyguluyoruz.
        # ------------------------------------------------------

        if isinstance(value, dict):

            return Json(value)

        return value

    # ==========================================================
    # ADAPT VALUES
    # ==========================================================

    def adapt_values(
        self,
        table,
        columns,
        values
    ):

        """
        Bir tablonun bütün değerlerini hedef kolon tiplerine göre
        normalize eder.
        """

        column_types = self.get_column_types(
            table
        )

        adapted_values = []

        for column, value in zip(
            columns,
            values
        ):

            column_type = column_types.get(
                column
            )

            adapted_values.append(
                self.adapt_value(
                    value,
                    column_type
                )
            )

        return adapted_values

    # ==========================================================
    # MAIN
    # ==========================================================

    def execute(self):

        if not self.changes:

            logger.info(
                "Aktarılacak veri bulunamadı."
            )

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
        logger.info(
            "DATA MIGRATION TAMAMLANDI"
        )
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

        columns = list(
            row.keys()
        )

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

        adapted_values = self.adapt_values(
            table,
            columns,
            values
        )

        self.execute_sql(
            query,
            adapted_values,
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
            # Hedef kolon tiplerine göre değerleri adapte et.
            # --------------------------------------------------

            # Query'deki kolon sırasını burada tekrar
            # row'dan alamıyoruz. Bu nedenle execute_sql'e
            # upsert tarafından kolon bilgisi ayrıca gönderiliyor.
            #
            # Aşağıdaki bölüm mevcut yapıyla geriye dönük
            # uyumluluğu korumak için query üzerinde ayrıca
            # çalışmaz.
            #
            # Bu nedenle values burada zaten normalize edilmiş
            # olmalıdır.

            cursor.execute(

                query,

                values

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

            logger.error(
                str(e)
            )

            raise

        finally:

            if cursor:

                cursor.close()