from datetime import datetime, timezone
from decimal import Decimal
from backend.dbsync.logger import logger


class DataComparator:
    """
    Local ve Neon verilerini karşılaştırır.

    Bu sınıf hiçbir SQL çalıştırmaz.

    Sadece INSERT / UPDATE işlem listesi üretir.

    DELETE işlemleri ilk sürümde bilinçli olarak desteklenmez.
    """

    def __init__(
        self,
        source_data: dict,
        target_data: dict,
        table_order=None
    ):

        self.source = source_data
        self.target = target_data

        self.table_order = table_order or []

        self.changes = []

    # ==========================================================
    # VALUE NORMALIZATION
    # ==========================================================

    def normalize_datetime(
        self,
        value
    ):
        """
        timezone-aware datetime değerlerini UTC'ye normalize eder.

        Örnek:

            10:00 +03:00
            07:00 UTC

        aynı anı gösteriyorsa eşit kabul edilir.

        timezone bilgisi olmayan datetime değerleri değiştirilmez.
        """

        if not isinstance(
            value,
            datetime
        ):
            return value

        if value.tzinfo is None:

            return value

        return value.astimezone(
            timezone.utc
        )

    # ==========================================================
    # RECURSIVE VALUE NORMALIZATION
    # ==========================================================

    def normalize_value(
        self,
        value
    ):
        """
        Karşılaştırmadan önce veri tiplerini normalize eder.

        Desteklenen özel durumlar:

        - datetime -> UTC
        - dict -> recursive normalization
        - list -> recursive normalization
        - tuple -> recursive normalization
        - set -> recursive normalization

        Diğer değerler olduğu gibi bırakılır.
        """

        # ------------------------------------------------------
        # DATETIME
        # ------------------------------------------------------

        if isinstance(
            value,
            datetime
        ):

            return self.normalize_datetime(
                value
            )

        # ------------------------------------------------------
        # DICT
        # ------------------------------------------------------

        if isinstance(
            value,
            dict
        ):

            return {
                key: self.normalize_value(
                    item
                )
                for key, item in value.items()
            }

        # ------------------------------------------------------
        # LIST
        # ------------------------------------------------------

        if isinstance(
            value,
            list
        ):

            return [
                self.normalize_value(
                    item
                )
                for item in value
            ]

        # ------------------------------------------------------
        # TUPLE
        # ------------------------------------------------------

        if isinstance(
            value,
            tuple
        ):

            return tuple(
                self.normalize_value(
                    item
                )
                for item in value
            )

        # ------------------------------------------------------
        # SET
        # ------------------------------------------------------

        if isinstance(
            value,
            set
        ):

            return {
                self.normalize_value(
                    item
                )
                for item in value
            }

        # ------------------------------------------------------
        # DECIMAL
        # ------------------------------------------------------

        if isinstance(
            value,
            Decimal
        ):

            return value

        return value

    # ==========================================================
    # VALUE COMPARISON
    # ==========================================================

    def values_equal(
        self,
        source_value,
        target_value
    ):
        """
        İki değeri normalize ederek karşılaştırır.

        Özellikle timezone-aware datetime değerlerinde
        aynı fiziksel zamanı farklı timezone ile gösteren
        değerleri eşit kabul eder.
        """

        normalized_source = (
            self.normalize_value(
                source_value
            )
        )

        normalized_target = (
            self.normalize_value(
                target_value
            )
        )

        return (
            normalized_source
            == normalized_target
        )

    # ==========================================================
    # MAIN
    # ==========================================================

    def compare(self):

        common_tables = (
            set(self.source.keys())
            & set(self.target.keys())
        )

        # ------------------------------------------------------
        # Dependency sırasına göre tablo sıralaması
        # ------------------------------------------------------

        order_index = {
            table: index
            for index, table in enumerate(
                self.table_order
            )
        }

        ordered_tables = sorted(
            common_tables,
            key=lambda table: (
                order_index.get(
                    table,
                    len(order_index)
                ),
                table
            )
        )

        logger.info(
            "Karşılaştırma tablo sırası:"
        )

        for index, table in enumerate(
            ordered_tables,
            start=1
        ):

            logger.info(
                f"  {index}. {table}"
            )

        for table in ordered_tables:

            self.compare_table(
                table
            )

        return self.changes

    # ==========================================================
    # TABLE
    # ==========================================================

    def compare_table(
        self,
        table
    ):

        source_table = self.source[table]

        target_table = self.target[table]

        pk = source_table[
            "primary_key"
        ]

        if pk is None:

            logger.warning(
                f"{table} tablosunda "
                "Primary Key bulunamadı."
            )

            return

        source_rows = {

            row[pk]: row

            for row in source_table[
                "rows"
            ]

        }

        target_rows = {

            row[pk]: row

            for row in target_table[
                "rows"
            ]

        }

        source_ids = set(
            source_rows.keys()
        )

        target_ids = set(
            target_rows.keys()
        )

        # ======================================================
        # INSERT
        # ======================================================

        for row_id in sorted(
            source_ids - target_ids
        ):

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

        for row_id in sorted(
            source_ids & target_ids
        ):

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

            source_value = (
                source_row[column]
            )

            target_value = (
                target_row.get(column)
            )

            # --------------------------------------------------
            # NORMALIZED COMPARISON
            # --------------------------------------------------

            if not self.values_equal(
                source_value,
                target_value
            ):

                print(
                    "\n-------------------------"
                )

                print(
                    table,
                    column
                )

                print(
                    "SOURCE:",
                    repr(source_value),
                    type(source_value)
                )

                print(
                    "TARGET:",
                    repr(target_value),
                    type(target_value)
                )

                # --------------------------------------------------
                # Normalize edilmiş değerleri de debug amacıyla
                # gösteriyoruz.
                # --------------------------------------------------

                normalized_source = (
                    self.normalize_value(
                        source_value
                    )
                )

                normalized_target = (
                    self.normalize_value(
                        target_value
                    )
                )

                if (
                    normalized_source
                    != source_value
                    or
                    normalized_target
                    != target_value
                ):

                    print(
                        "NORMALIZED SOURCE:",
                        repr(
                            normalized_source
                        )
                    )

                    print(
                        "NORMALIZED TARGET:",
                        repr(
                            normalized_target
                        )
                    )

                differences[column] = {

                    "source": source_value,

                    "target": target_value

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

            if change[
                "action"
            ] == "insert":

                inserts += 1

            elif change[
                "action"
            ] == "update":

                updates += 1

        return {

            "insert": inserts,

            "update": updates,

            "total": len(
                self.changes
            )

        }