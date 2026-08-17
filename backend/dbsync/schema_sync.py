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
        # İLK SCHEMA OKUMA
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

        logger.info(
            "LOCAL -> NEON karşılaştırılıyor..."
        )

        local_to_neon_all_changes = SchemaComparator(
            local_schema,
            neon_schema
        ).compare()

        local_to_neon_changes = [
            change
            for change in local_to_neon_all_changes
            if change.get("source") == "local"
        ]

        if local_to_neon_changes:

            logger.info(
                f"LOCAL -> NEON için "
                f"{len(local_to_neon_changes)} "
                f"değişiklik bulundu."
            )

            MigrationEngine(

                source_connection=self.local_conn,

                target_connection=self.neon_conn,

                changes=local_to_neon_changes,

                source_schema=local_ddl

            ).execute()

        else:

            logger.info(
                "Neon güncel."
            )

        # ======================================================
        # MIGRATION SONRASI TEKRAR OKU
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

        logger.info(
            "NEON -> LOCAL karşılaştırılıyor..."
        )

        neon_to_local_all_changes = SchemaComparator(
            neon_schema,
            local_schema
        ).compare()

        neon_to_local_changes = [
            change
            for change in neon_to_local_all_changes
            if change.get("source") == "local"
        ]

        if neon_to_local_changes:

            logger.info(
                f"NEON -> LOCAL için "
                f"{len(neon_to_local_changes)} "
                f"değişiklik bulundu."
            )

            MigrationEngine(

                source_connection=self.neon_conn,

                target_connection=self.local_conn,

                changes=neon_to_local_changes,

                source_schema=neon_ddl

            ).execute()

        else:

            logger.info(
                "Local güncel."
            )

        # ======================================================
        # SON KONTROL
        # ======================================================

        logger.info(
            "Son doğrulama yapılıyor..."
        )

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

                logger.warning(
                    str(item)
                )

        else:

            logger.info(
                "Schema tamamen senkron."
            )

        logger.info("=" * 70)
        logger.info("SCHEMA SYNC TAMAMLANDI")
        logger.info("=" * 70)

        return len(remaining) == 0