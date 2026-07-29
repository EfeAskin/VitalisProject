import hashlib
import json

from backend.dbsync.logger import logger


class Checksum:
    """
    Database verileri için checksum üretir.

    Bu sınıf:

    - SQL çalıştırmaz.
    - Database bağlantısı kurmaz.
    - Sadece verilen verilerden hash üretir.

    Kullanım amacı:

    Local ve Neon tablolarının
    hızlı şekilde aynı olup olmadığını
    anlamaktır.
    """

    # Karşılaştırmada dikkate alınmayacak kolonlar
    IGNORED_COLUMNS = {
        "updated_at"
    }

    def __init__(self):
        pass

    # ==========================================================
    # PUBLIC
    # ==========================================================

    def row_checksum(self, row: dict) -> str:
        """
        Tek satır checksum üretir.
        """

        normalized = self.normalize_row(row)

        checksum = hashlib.md5(
            normalized.encode("utf-8")
        ).hexdigest()

        return checksum

    # ==========================================================

    def table_checksum(self, rows: list[dict]) -> str:
        """
        Tablo checksum üretir.

        Satırların sırası önemli değildir.
        """

        row_checksums = []

        for row in rows:

            row_checksums.append(

                self.row_checksum(row)

            )

        row_checksums.sort()

        checksum_source = json.dumps(

            row_checksums,

            ensure_ascii=False

        )

        checksum = hashlib.md5(

            checksum_source.encode("utf-8")

        ).hexdigest()

        return checksum

    # ==========================================================

    def database_checksums(self, database_data: dict) -> dict:
        """
        Bütün tabloların checksum'unu üretir.

        Döndürür:

        {

            "users": "...",

            "meal_logs": "...",

            ...

        }
        """

        checksums = {}

        for table_name in sorted(database_data.keys()):

            rows = database_data[table_name]["rows"]

            checksums[table_name] = self.table_checksum(rows)

        return checksums

    # ==========================================================

    def compare(self, source_data: dict, target_data: dict):
        """
        Source ve Target checksumlarını karşılaştırır.

        Döndürür:

        {

            "same":[...],

            "different":[...]

        }
        """

        logger.info("Checksum karşılaştırması başlatıldı.")

        source = self.database_checksums(source_data)

        target = self.database_checksums(target_data)

        same = []
        different = []

        common_tables = set(source.keys()) & set(target.keys())

        for table in sorted(common_tables):

            if source[table] == target[table]:

                logger.info(
                    f"[CHECKSUM SAME] {table}"
                )

                same.append(table)

            else:

                logger.info(
                    f"[CHECKSUM DIFFERENT] {table}"
                )

                different.append(table)

        logger.info("Checksum karşılaştırması tamamlandı.")

        return {

            "same": same,

            "different": different

        }

    # ==========================================================
    # PRIVATE
    # ==========================================================

    def normalize_row(self, row: dict) -> str:
        """
        Hash üretmeden önce satırı normalize eder.

        updated_at gibi kolonlar
        checksum hesabına katılmaz.
        """

        filtered = {}

        for key, value in row.items():

            if key in self.IGNORED_COLUMNS:

                continue

            filtered[key] = value

        return json.dumps(

            filtered,

            sort_keys=True,

            default=str,

            ensure_ascii=False

        )

    # ==========================================================
    # LOG
    # ==========================================================

    def print_table_checksums(self, database_data: dict):
        """
        Tabloların checksumlarını loglar.
        """

        checksums = self.database_checksums(database_data)

        logger.info("=" * 70)
        logger.info("TABLE CHECKSUMS")
        logger.info("=" * 70)

        for table in sorted(checksums.keys()):

            logger.info(

                f"{table:<35} {checksums[table]}"

            )

        logger.info("=" * 70)

        return checksums