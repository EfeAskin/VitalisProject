from backend.dbsync.logger import logger

from backend.dbsync.data_extractor import DataExtractor
from backend.dbsync.data_comparator import DataComparator
from backend.dbsync.data_migrator import DataMigrator


class DataSync:

    """
    Local <-------> Neon

    Veri senkronizasyonu yapar.

    Schema ile ilgilenmez.

    INSERT
    UPDATE

    işlemlerini gerçekleştirir.

    DELETE işlemi güvenlik nedeniyle yapılmaz.
    """

    def __init__(self, local_connection, neon_connection):

        self.local_conn = local_connection
        self.neon_conn = neon_connection

    # ==========================================================
    # MAIN
    # ==========================================================

    def synchronize(self):

        logger.info("=" * 70)
        logger.info("DATA SYNC BAŞLADI")
        logger.info("=" * 70)

        self.sync_local_to_neon()

        self.sync_neon_to_local()

        logger.info("=" * 70)
        logger.info("DATA SYNC TAMAMLANDI")
        logger.info("=" * 70)

    # ==========================================================
    # LOCAL -> NEON
    # ==========================================================

    def sync_local_to_neon(self):

        logger.info("LOCAL -> NEON")

        source_data = DataExtractor(self.local_conn).extract()

        target_data = DataExtractor(self.neon_conn).extract()

        changes = DataComparator(
            source_data,
            target_data
        ).compare()

        if not changes:

            logger.info("Neon tarafında veri güncel.")

            return

        logger.info(f"{len(changes)} değişiklik bulundu.")

        DataMigrator(

            target_connection=self.neon_conn,

            changes=changes

        ).execute()

    # ==========================================================
    # NEON -> LOCAL
    # ==========================================================

    def sync_neon_to_local(self):

        logger.info("NEON -> LOCAL")

        source_data = DataExtractor(self.neon_conn).extract()

        target_data = DataExtractor(self.local_conn).extract()

        changes = DataComparator(
            source_data,
            target_data
        ).compare()

        if not changes:

            logger.info("Local tarafında veri güncel.")

            return

        logger.info(f"{len(changes)} değişiklik bulundu.")

        DataMigrator(

            target_connection=self.local_conn,

            changes=changes

        ).execute()