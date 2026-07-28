from backend.dbsync.logger import logger
from backend.dbsync.inspector import DatabaseInspector
from backend.dbsync.schema_extractor import SchemaExtractor
from backend.dbsync.schema_comparator import SchemaComparator
from backend.dbsync.migration_engine import MigrationEngine


class SchemaSync:
    """
    Local <-------> Neon

    İki veritabanının şemasını senkronize eder.

    Veri taşımaz.

    Sadece schema eşitlemesi yapar.
    """

    def __init__(self, local_connection, neon_connection):

        self.local_conn = local_connection
        self.neon_conn = neon_connection

    # ==========================================================
    # MAIN
    # ==========================================================

    def synchronize(self):

        logger.info("=" * 70)
        logger.info("SCHEMA SYNC BAŞLATILDI")
        logger.info("=" * 70)

        # ======================================================
        # İlk Schema Okuma
        # ======================================================

        local_schema = DatabaseInspector(
            self.local_conn
        ).inspect()

        neon_schema = DatabaseInspector(
            self.neon_conn
        ).inspect()

        local_ddl = SchemaExtractor(
            self.local_conn
        ).extract()

        neon_ddl = SchemaExtractor(
            self.neon_conn
        ).extract()

        # ======================================================
        # LOCAL -> NEON
        # ======================================================

        logger.info("LOCAL -> NEON karşılaştırılıyor...")

        changes = SchemaComparator(
            local_schema,
            neon_schema
        ).compare()

        if changes:

            logger.info(
                f"{len(changes)} değişiklik bulundu."
            )

            MigrationEngine(

                source_connection=self.local_conn,

                target_connection=self.neon_conn,

                changes=changes,

                source_schema=local_ddl

            ).execute()

        else:

            logger.info("Neon güncel.")

        # ======================================================
        # Migration sonrası tekrar oku
        # ======================================================

        local_schema = DatabaseInspector(
            self.local_conn
        ).inspect()

        neon_schema = DatabaseInspector(
            self.neon_conn
        ).inspect()

        local_ddl = SchemaExtractor(
            self.local_conn
        ).extract()

        neon_ddl = SchemaExtractor(
            self.neon_conn
        ).extract()

        # ======================================================
        # NEON -> LOCAL
        # ======================================================

        logger.info("NEON -> LOCAL karşılaştırılıyor...")

        changes = SchemaComparator(
            neon_schema,
            local_schema
        ).compare()

        if changes:

            logger.info(
                f"{len(changes)} değişiklik bulundu."
            )

            MigrationEngine(

                source_connection=self.neon_conn,

                target_connection=self.local_conn,

                changes=changes,

                source_schema=neon_ddl

            ).execute()

        else:

            logger.info("Local güncel.")

        # ======================================================
        # Son Kontrol
        # ======================================================

        logger.info("Son doğrulama yapılıyor...")

        final_local = DatabaseInspector(
            self.local_conn
        ).inspect()

        final_neon = DatabaseInspector(
            self.neon_conn
        ).inspect()

        remaining = SchemaComparator(
            final_local,
            final_neon
        ).compare()

        if remaining:

            logger.warning(
                f"{len(remaining)} schema farkı kaldı."
            )

            for item in remaining:

                logger.warning(str(item))

        else:

            logger.info(
                "Schema tamamen senkron."
            )

        logger.info("=" * 70)
        logger.info("SCHEMA SYNC TAMAMLANDI")
        logger.info("=" * 70)

        return len(remaining) == 0                          