from backend.dbsync.logger import logger


class SchemaComparator:
    """
    Local ve Neon veritabanı şemalarını karşılaştırır.

    Hiçbir SQL çalıştırmaz.
    Sadece MigrationEngine'in kullanacağı Change List üretir.

    SchemaComparator'a verilen ilk schema "source" kabul edilir.

    Örneğin:

        SchemaComparator(local_schema, neon_schema)

    sonucunda:
        source = "local"

    ve:

        SchemaComparator(neon_schema, local_schema)

    sonucunda:
        source = "local"

    ifadesi yine comparator'ın ilk parametresini temsil eder.
    """

    def __init__(self, local_schema: dict, neon_schema: dict):

        self.local = local_schema
        self.neon = neon_schema

        self.changes = []

    # ==========================================================
    # MAIN
    # ==========================================================

    def compare(self):

        self.compare_tables()

        self.compare_columns()

        return self.changes

    # ==========================================================
    # TABLE COMPARISON
    # ==========================================================

    def compare_tables(self):

        local_tables = set(
            self.local.keys()
        )

        neon_tables = set(
            self.neon.keys()
        )

        # ------------------------------------------------------
        # İlk schema'da var, ikinci schema'da yok
        #
        # İlk schema kaynak olarak kabul edilir.
        # ------------------------------------------------------

        for table in sorted(
            local_tables - neon_tables
        ):

            logger.info(
                f"[CREATE TABLE] Neon'da eksik : {table}"
            )

            self.changes.append({

                "action": "create_table",

                "table": table,

                "source": "local"

            })

        # ------------------------------------------------------
        # İkinci schema'da var, ilk schema'da yok
        #
        # Bu kayıtlar ikinci yönde oluşturulacaktır.
        # ------------------------------------------------------

        for table in sorted(
            neon_tables - local_tables
        ):

            logger.info(
                f"[CREATE TABLE] Local'da eksik : {table}"
            )

            self.changes.append({

                "action": "create_table",

                "table": table,

                "source": "neon"

            })

    # ==========================================================
    # COLUMN COMPARISON
    # ==========================================================

    def compare_columns(self):

        common_tables = (
            set(self.local.keys())
            & set(self.neon.keys())
        )

        for table in sorted(
            common_tables
        ):

            local_columns = (
                self.local[table]["columns"]
            )

            neon_columns = (
                self.neon[table]["columns"]
            )

            local_names = set(
                local_columns.keys()
            )

            neon_names = set(
                neon_columns.keys()
            )

            # --------------------------------------------------
            # Local -> Neon
            # --------------------------------------------------

            for column in sorted(
                local_names - neon_names
            ):

                logger.info(
                    f"[ADD COLUMN] Neon : "
                    f"{table}.{column}"
                )

                self.changes.append({

                    "action": "add_column",

                    "table": table,

                    "column": column,

                    "definition": local_columns[column],

                    "source": "local"

                })

            # --------------------------------------------------
            # Neon -> Local
            # --------------------------------------------------

            for column in sorted(
                neon_names - local_names
            ):

                logger.info(
                    f"[ADD COLUMN] Local : "
                    f"{table}.{column}"
                )

                self.changes.append({

                    "action": "add_column",

                    "table": table,

                    "column": column,

                    "definition": neon_columns[column],

                    "source": "neon"

                })

            # --------------------------------------------------
            # Ortak kolonlar
            # --------------------------------------------------

            for column in sorted(
                local_names & neon_names
            ):

                self.compare_column_definition(

                    table,

                    column,

                    local_columns[column],

                    neon_columns[column]

                )

    # ==========================================================
    # COLUMN DETAIL COMPARISON
    # ==========================================================

    def compare_column_definition(

        self,

        table,

        column,

        local,

        neon

    ):

        # ------------------------------------------------------
        # DATATYPE
        # ------------------------------------------------------

        if local["data_type"] != neon["data_type"]:

            logger.info(
                f"[MODIFY COLUMN] Type : "
                f"{table}.{column}"
            )

            self.changes.append({

                "action": "modify_column",

                "table": table,

                "column": column,

                "local": local,

                "neon": neon,

                "source": "local"

            })

            return

        # ------------------------------------------------------
        # NULLABLE
        # ------------------------------------------------------

        if local["nullable"] != neon["nullable"]:

            logger.info(
                f"[MODIFY COLUMN] Nullable : "
                f"{table}.{column}"
            )

            self.changes.append({

                "action": "modify_column",

                "table": table,

                "column": column,

                "local": local,

                "neon": neon,

                "source": "local"

            })

            return

        # ------------------------------------------------------
        # DEFAULT
        # ------------------------------------------------------

        if local["default"] != neon["default"]:

            logger.info(
                f"[MODIFY COLUMN] Default : "
                f"{table}.{column}"
            )

            self.changes.append({

                "action": "modify_column",

                "table": table,

                "column": column,

                "local": local,

                "neon": neon,

                "source": "local"

            })

            return