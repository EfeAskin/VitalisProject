from backend.dbsync.logger import logger


class SchemaComparator:
    """
    Local ve Neon veritabanı şemalarını karşılaştırır.

    Hiçbir SQL çalıştırmaz.
    Sadece MigrationEngine'in kullanacağı Change List üretir.
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

        local_tables = set(self.local.keys())
        neon_tables = set(self.neon.keys())

        # Local -> Neon

        for table in sorted(local_tables - neon_tables):

            logger.info(f"[CREATE TABLE] Neon'da eksik : {table}")

            self.changes.append({

                "action": "create_table",

                "table": table,

                "source": "local"

            })

        # Neon -> Local

        for table in sorted(neon_tables - local_tables):

            logger.info(f"[CREATE TABLE] Local'da eksik : {table}")

            self.changes.append({

                "action": "create_table",

                "table": table,

                "source": "neon"

            })

    # ==========================================================
    # COLUMN COMPARISON
    # ==========================================================

    def compare_columns(self):

        common_tables = set(self.local.keys()) & set(self.neon.keys())

        for table in sorted(common_tables):

            local_columns = self.local[table]["columns"]
            neon_columns = self.neon[table]["columns"]

            local_names = set(local_columns.keys())
            neon_names = set(neon_columns.keys())

            # --------------------------------------------------
            # Local -> Neon
            # --------------------------------------------------

            for column in sorted(local_names - neon_names):

                logger.info(f"[ADD COLUMN] Neon : {table}.{column}")

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

            for column in sorted(neon_names - local_names):

                logger.info(f"[ADD COLUMN] Local : {table}.{column}")

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

            for column in sorted(local_names & neon_names):

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

        # datatype

        if local["data_type"] != neon["data_type"]:

            logger.info(f"[MODIFY COLUMN] Type : {table}.{column}")

            self.changes.append({

                "action": "modify_column",

                "table": table,

                "column": column,

                "local": local,

                "neon": neon,

                "source": "local"

            })

            return

        # nullable

        if local["nullable"] != neon["nullable"]:

            logger.info(f"[MODIFY COLUMN] Nullable : {table}.{column}")

            self.changes.append({

                "action": "modify_column",

                "table": table,

                "column": column,

                "local": local,

                "neon": neon,

                "source": "local"

            })

            return

        # default

        if local["default"] != neon["default"]:

            logger.info(f"[MODIFY COLUMN] Default : {table}.{column}")

            self.changes.append({

                "action": "modify_column",

                "table": table,

                "column": column,

                "local": local,

                "neon": neon,

                "source": "local"

            })