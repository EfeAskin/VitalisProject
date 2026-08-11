from backend.dbsync.logger import logger

from backend.dbsync.data_extractor import DataExtractor
from backend.dbsync.data_comparator import DataComparator
from backend.dbsync.data_migrator import DataMigrator
from backend.dbsync.checksum import Checksum
from backend.dbsync.sync_lock import SyncLock
from backend.dbsync.sync_history import SyncHistory


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

        self.checksum = Checksum()
        self.history = SyncHistory()

    # ==========================================================
    # MAIN
    # ==========================================================

    def synchronize(self):

        with SyncLock():

            self.history.reset()
            self.history.start()

            try:

                logger.info("=" * 70)
                logger.info("DATA SYNC BAŞLADI")
                logger.info("=" * 70)

                self.sync_local_to_neon()

                self.sync_neon_to_local()

                self.history.finish(

                    insert_count=self.history.insert_count,

                    update_count=self.history.update_count,

                    success=True

                )

                logger.info("=" * 70)
                logger.info("DATA SYNC TAMAMLANDI")
                logger.info("=" * 70)

                logger.info(
                    f"INSERT={self.history.insert_count} | "
                    f"UPDATE={self.history.update_count} | "
                    f"SÜRE={self.history.duration} sn"
                )

            except Exception as e:

                self.history.fail(e)

                raise

    # ==========================================================
    # LOCAL -> NEON
    # ==========================================================

    def sync_local_to_neon(self):

        logger.info("LOCAL -> NEON")

        source_data = DataExtractor(self.local_conn).extract()

        target_data = DataExtractor(self.neon_conn).extract()

        checksum_result = self.checksum.compare(
            source_data,
            target_data
        )

        if not checksum_result["different"]:

            logger.info("Neon tarafındaki tüm tablolar güncel.")

            return

        source_data = {

            table: source_data[table]

            for table in checksum_result["different"]

        }

        target_data = {

            table: target_data[table]

            for table in checksum_result["different"]

        }

        comparator = DataComparator(

            source_data,

            target_data

        )

        changes = comparator.compare()

        if not changes:

            logger.info("Neon tarafında veri güncel.")

            return

        summary = comparator.summary()

        self.history.add_summary(summary)

        logger.info(f"{summary['total']} değişiklik bulundu.")

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

        checksum_result = self.checksum.compare(
            source_data,
            target_data
        )

        if not checksum_result["different"]:

            logger.info("Local tarafındaki tüm tablolar güncel.")

            return

        source_data = {

            table: source_data[table]

            for table in checksum_result["different"]

        }

        target_data = {

            table: target_data[table]

            for table in checksum_result["different"]

        }

        comparator = DataComparator(

            source_data,

            target_data

        )

        changes = comparator.compare()

        if not changes:

            logger.info("Local tarafında veri güncel.")

            return

        summary = comparator.summary()

        self.history.add_summary(summary)

        logger.info(f"{summary['total']} değişiklik bulundu.")

        DataMigrator(

            target_connection=self.local_conn,

            changes=changes

        ).execute()