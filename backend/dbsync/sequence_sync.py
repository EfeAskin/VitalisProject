"""
===========================================================================
sequence_sync.py
===========================================================================

Database sequence senkronizasyonu.

Amaç
-----

INSERT sırasında oluşabilecek

duplicate key value violates unique constraint

hatasını tamamen engellemektir.

Schema senkronizasyonundan sonra,
Data senkronizasyonundan sonra,
Sequence değerleri de senkronize edilir.

Her iki yönde çalışır.

Local  -> Neon
Neon   -> Local

===========================================================================

"""

from psycopg2 import sql

from backend.dbsync.logger import (
    info,
    success,
    warning,
    error,
)


class SequenceSync:

    def __init__(self, local_conn, neon_conn):

        self.local_conn = local_conn
        self.neon_conn = neon_conn

    # ==========================================================
    # PUBLIC
    # ==========================================================

    def sync(self):

        """
        Sequence senkronizasyonunun giriş noktası.
        """

        info("=" * 70)
        info("SEQUENCE SYNC BAŞLADI")
        info("=" * 70)

        self.sync_local_to_neon()

        self.sync_neon_to_local()

        info("=" * 70)
        success("SEQUENCE SYNC TAMAMLANDI")
        info("=" * 70)

    # ==========================================================
    # GET TABLES
    # ==========================================================

    def get_tables(self, conn):

        """
        Public schema içerisindeki tabloları döndürür.
        """

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT tablename
                FROM pg_tables
                WHERE schemaname='public'
                ORDER BY tablename;
                """
            )

            rows = cur.fetchall()

        # psycopg2 varsayılan olarak tuple döner
        return [r[0] for r in rows]

    # ==========================================================
    # GET PRIMARY KEY
    # ==========================================================

    def get_primary_key(self, conn, table):

        """
        Tablonun primary key kolonunu döndürür.

        Örnek

        users -> id
        """

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    kcu.column_name
                FROM
                    information_schema.table_constraints tc
                JOIN
                    information_schema.key_column_usage kcu
                ON
                    tc.constraint_name=kcu.constraint_name
                WHERE
                    tc.table_schema='public'
                AND
                    tc.table_name=%s
                AND
                    tc.constraint_type='PRIMARY KEY';
                """,
                (table,)
            )

            row = cur.fetchone()

        if row and row[0]:

            return row[0]

        return None

    # ==========================================================
    # GET SEQUENCE
    # ==========================================================

    def get_sequence_name(self, conn, table, pk):

        """
        Primary key'nin kullandığı sequence ismini döndürür.
        """

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT pg_get_serial_sequence(%s,%s) AS seq;
                """,
                (
                    f"public.{table}",
                    pk,
                ),
            )

            row = cur.fetchone()

        if row and row[0]:

            return row[0]

        return None

    # ==========================================================
    # MAX ID
    # ==========================================================

    def get_max_id(self, conn, table, pk):

        """
        Tablodaki en büyük ID.
        """

        with conn.cursor() as cur:

            cur.execute(

                sql.SQL(
                    """
                    SELECT
                        COALESCE(MAX({}),0) AS max_id
                    FROM {};
                    """
                ).format(
                    sql.Identifier(pk),
                    sql.Identifier(table),
                )

            )

            row = cur.fetchone()

        return int(row[0]) if row and row[0] is not None else 0

    # ==========================================================
    # CURRENT SEQUENCE
    # ==========================================================

    def get_sequence_value(self, conn, sequence_name):

        """
        Sequence'in son değerini döndürür.
        """

        if sequence_name is None:

            return None

        with conn.cursor() as cur:

            cur.execute(

                sql.SQL(
                    """
                    SELECT last_value
                    FROM {};
                    """
                ).format(
                    sql.SQL(sequence_name)
                )

            )

            row = cur.fetchone()

        return int(row[0]) if row and row[0] is not None else 0

    # ==========================================================
    # SET SEQUENCE
    # ==========================================================

    def set_sequence_value(self, conn, sequence_name, value):

        """
        Sequence'i güvenli şekilde günceller.

        setval(sequence,max(id),true)

        Böylece sonraki INSERT max(id)+1 olur.
        """

        if sequence_name is None:
            return

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT setval(%s,%s,true);
                """,
                (
                    sequence_name,
                    value,
                ),
            )

        conn.commit()

    # ==========================================================
    # SYNC ONE DIRECTION
    # ==========================================================

    def sync_direction(
        self,
        source_conn,
        target_conn,
        direction,
    ):

        """
        Tek yönlü sequence senkronizasyonu.

        source'daki max(id) ve target'daki max(id) kontrol edilerek
        hedef sequence güvenli değere yükseltilir.
        """

        info("-" * 70)
        info(direction)
        info("-" * 70)

        tables = self.get_tables(source_conn)

        updated = 0

        for table in tables:

            pk = self.get_primary_key(
                source_conn,
                table,
            )

            if pk is None:
                continue

            sequence = self.get_sequence_name(
                target_conn,
                table,
                pk,
            )

            if sequence is None:
                continue

            source_max = self.get_max_id(
                source_conn,
                table,
                pk,
            )

            target_max = self.get_max_id(
                target_conn,
                table,
                pk,
            )

            target_sequence = self.get_sequence_value(
                target_conn,
                sequence,
            )

            if target_sequence is None:
                continue

            # Hedef sequence'in, kaynağın VE hedefin max id'sinden geride kalmamasını sağlarız.
            desired = max(
                source_max,
                target_max,
                target_sequence,
            )

            if desired > target_sequence:

                info(
                    f"{table} : "
                    f"{target_sequence} -> {desired}"
                )

                self.set_sequence_value(
                    target_conn,
                    sequence,
                    desired,
                )

                updated += 1

        if updated == 0:

            success("Sequence güncel.")

        else:

            success(
                f"{updated} sequence güncellendi."
            )

    # ==========================================================
    # LOCAL -> NEON
    # ==========================================================

    def sync_local_to_neon(self):

        """
        Local'deki sequence durumuna göre
        Neon güncellenir.
        """

        self.sync_direction(
            self.local_conn,
            self.neon_conn,
            "LOCAL -> NEON",
        )

    # ==========================================================
    # NEON -> LOCAL
    # ==========================================================

    def sync_neon_to_local(self):

        """
        Neon'daki sequence durumuna göre
        Local güncellenir.
        """

        self.sync_direction(
            self.neon_conn,
            self.local_conn,
            "NEON -> LOCAL",
        )

    # ==========================================================
    # VERIFY
    # ==========================================================

    def verify(self):

        """
        Tüm tablolar için

            sequence >= max(id)

        kontrolünü yapar.
        """

        info("=" * 70)
        info("SEQUENCE VERIFY")
        info("=" * 70)

        self.verify_database(
            self.local_conn,
            "LOCAL"
        )

        self.verify_database(
            self.neon_conn,
            "NEON"
        )

        success("Sequence doğrulaması tamamlandı.")

    # ==========================================================
    # VERIFY DATABASE
    # ==========================================================

    def verify_database(
        self,
        conn,
        database_name,
    ):

        info(f"{database_name} doğrulanıyor...")

        tables = self.get_tables(conn)

        problem_count = 0

        for table in tables:

            pk = self.get_primary_key(
                conn,
                table,
            )

            if pk is None:
                continue

            sequence = self.get_sequence_name(
                conn,
                table,
                pk,
            )

            if sequence is None:
                continue

            max_id = self.get_max_id(
                conn,
                table,
                pk,
            )

            seq_value = self.get_sequence_value(
                conn,
                sequence,
            )

            if seq_value is None:
                continue

            if seq_value < max_id:

                warning(
                    f"{database_name} -> "
                    f"{table} : "
                    f"Sequence={seq_value} "
                    f"MaxID={max_id}"
                )

                problem_count += 1

        if problem_count == 0:

            success(
                f"{database_name} sequence değerleri doğru."
            )

        else:

            warning(
                f"{database_name} üzerinde "
                f"{problem_count} problem bulundu."
            )

    # ==========================================================
    # RUN
    # ==========================================================

    def run(self):

        """
        Sequence Sync giriş noktası.

        Kullanımı

            SequenceSync(...).run()
        """

        try:

            self.sync()

            self.verify()

        except Exception as e:

            error(
                f"Sequence Sync başarısız.\n{e}"
            )

            raise

    # ==========================================================
    # REPORT
    # ==========================================================

    def report(self):

        """
        Sequence raporu oluşturur.
        """

        info("=" * 70)
        info("SEQUENCE REPORT")
        info("=" * 70)

        self.report_database(
            self.local_conn,
            "LOCAL"
        )

        self.report_database(
            self.neon_conn,
            "NEON"
        )

    # ==========================================================
    # REPORT DATABASE
    # ==========================================================

    def report_database(
        self,
        conn,
        database_name,
    ):

        info(f"{database_name}")

        tables = self.get_tables(conn)

        for table in tables:

            pk = self.get_primary_key(
                conn,
                table,
            )

            if pk is None:
                continue

            sequence = self.get_sequence_name(
                conn,
                table,
                pk,
            )

            if sequence is None:
                continue

            max_id = self.get_max_id(
                conn,
                table,
                pk,
            )

            seq_value = self.get_sequence_value(
                conn,
                sequence,
            )

            info(
                f"{table:<35}"
                f" max(id)={max_id:<8}"
                f" sequence={seq_value}"
            )