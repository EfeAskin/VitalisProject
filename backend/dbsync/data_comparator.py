from backend.dbsync.logger import logger


class DataComparator:
    """
    Local ve Neon verilerini karşılaştırır.

    Bu sınıf hiçbir SQL çalıştırmaz.

    Sadece INSERT / UPDATE işlem listesi üretir.

    DELETE işlemleri ilk sürümde bilinçli olarak desteklenmez.
    """

    def __init__(self, source_data: dict, target_data: dict):

        self.source = source_data
        self.target = target_data

        self.changes = []

    # ==========================================================
    # MAIN
    # ==========================================================

    def compare(self):

        common_tables = set(self.source.keys()) & set(self.target.keys())

        for table in sorted(common_tables):

            self.compare_table(table)

        return self.changes

    # ==========================================================
    # TABLE
    # ==========================================================

    def compare_table(self, table):

        source_table = self.source[table]
        target_table = self.target[table]

        pk = source_table["primary_key"]

        if pk is None:

            logger.warning(
                f"{table} tablosunda Primary Key bulunamadı."
            )

            return

        source_rows = {

            row[pk]: row

            for row in source_table["rows"]

        }

        target_rows = {

            row[pk]: row

            for row in target_table["rows"]

        }

        source_ids = set(source_rows.keys())
        target_ids = set(target_rows.keys())

        # ======================================================
        # INSERT
        # ======================================================

        for row_id in sorted(source_ids - target_ids):

            logger.info(
                f"[INSERT] {table} -> {row_id}"
            )

            self.changes.append({

                "action": "insert",

                "table": table,

                "primary_key": pk,

                "row": source_rows[row_id]

            })

        # ======================================================
        # UPDATE
        # ======================================================

        for row_id in sorted(source_ids & target_ids):

            self.compare_row(

                table,

                pk,

                source_rows[row_id],

                target_rows[row_id]

            )

    # ==========================================================
    # ROW
    # ==========================================================

    def compare_row(

        self,

        table,

        primary_key,

        source_row,

        target_row

    ):

        differences = {}

        for column in source_row.keys():

            if source_row[column] != target_row.get(column):

                print("\n-------------------------")
                print(table, column)
                print("SOURCE:", repr(source_row[column]), type(source_row[column]))
                print("TARGET:", repr(target_row.get(column)), type(target_row.get(column)))

                differences[column] = {

                    "source": source_row[column],

                    "target": target_row.get(column)

                }

        if not differences:

            return

        logger.info(

            f"[UPDATE] {table} -> "

            f"{source_row[primary_key]}"

        )

        self.changes.append({

            "action": "update",

            "table": table,

            "primary_key": primary_key,

            "row": source_row,

            "differences": differences

        })

    # ==========================================================
    # SUMMARY
    # ==========================================================

    def summary(self):

        inserts = 0
        updates = 0

        for change in self.changes:

            if change["action"] == "insert":

                inserts += 1

            elif change["action"] == "update":

                updates += 1

        return {

            "insert": inserts,

            "update": updates,

            "total": len(self.changes)

        }