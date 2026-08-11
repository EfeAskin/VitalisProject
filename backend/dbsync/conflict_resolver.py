"""
===========================================================================
conflict_resolver.py
===========================================================================

LAST_MODIFIED_WINS Conflict Resolver

Bu modül;

- Local
- Neon

verileri arasında oluşabilecek conflictleri çözer.

Kurallar

1)

Record sadece bir tarafta varsa

    -> olduğu gibi kopyalanır.

2)

Record iki tarafta da varsa

    updated_at karşılaştırılır.

3)

updated_at büyük olan

    -> kazanır.

4)

Eşitse

    -> işlem yapılmaz.

===========================================================================

"""

from datetime import datetime

from psycopg2 import sql

from backend.dbsync.logger import (
    info,
    success,
    warning,
    error,
)


class ConflictResolver:

    """
    Conflict çözümleyici.

    Varsayılan strateji

        LAST_MODIFIED_WINS
    """

    STRATEGY_LAST_MODIFIED = "LAST_MODIFIED"

    def __init__(
        self,
        local_conn,
        neon_conn,
        strategy=STRATEGY_LAST_MODIFIED,
    ):

        self.local_conn = local_conn
        self.neon_conn = neon_conn

        self.strategy = strategy

    # ==========================================================
    # PUBLIC
    # ==========================================================

    def run(self):

        info("=" * 70)
        info("CONFLICT RESOLVER BAŞLADI")
        info("=" * 70)

        self.sync_local_to_neon()

        self.sync_neon_to_local()

        self.verify()

        info("=" * 70)
        success("CONFLICT RESOLVER TAMAMLANDI")
        info("=" * 70)

    # ==========================================================
    # GET TABLES
    # ==========================================================

    def get_tables(self, conn):

        with conn.cursor() as cur:

            cur.execute("""
                SELECT tablename
                FROM pg_tables
                WHERE schemaname='public'
                ORDER BY tablename;
            """)

            rows = cur.fetchall()

        # psycopg2 tuple döndüğü için index ile erişiyoruz
        return [r[0] for r in rows]

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    def get_primary_key(
        self,
        conn,
        table,
    ):

        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    kcu.column_name
                FROM
                    information_schema.table_constraints tc
                JOIN
                    information_schema.key_column_usage kcu
                ON
                    tc.constraint_name=kcu.constraint_name
                WHERE
                    tc.constraint_type='PRIMARY KEY'
                AND
                    tc.table_schema='public'
                AND
                    tc.table_name=%s;
            """, (table,))

            row = cur.fetchone()

        if row:
            return row[0]

        return None

    # ==========================================================
    # COLUMN LIST
    # ==========================================================

    def get_columns(
        self,
        conn,
        table,
    ):

        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    column_name
                FROM
                    information_schema.columns
                WHERE
                    table_schema='public'
                AND
                    table_name=%s
                ORDER BY
                    ordinal_position;
            """, (table,))

            rows = cur.fetchall()

        return [r[0] for r in rows]

    # ==========================================================
    # GET ROWS
    # ==========================================================

    def get_rows(
        self,
        conn,
        table,
        pk,
    ):

        """
        Tablodaki bütün kayıtları

        primary key -> row (dict)

        formatında döndürür.
        """

        with conn.cursor() as cur:

            cur.execute(

                sql.SQL("""
                    SELECT *
                    FROM {};
                """).format(
                    sql.Identifier(table)
                )

            )

            rows = cur.fetchall()
            
            # Tuple yapılarını dinamik olarak sözlüğe çeviriyoruz
            col_names = [desc[0] for desc in cur.description]

        return {
            dict_row[pk]: dict_row
            for row in rows
            if (dict_row := dict(zip(col_names, row)))
        }

    # ==========================================================
    # UPDATED_AT
    # ==========================================================

    def get_updated_at(
        self,
        row,
    ):

        """
        updated_at olmayan eski tablolar için
        minimum datetime döndürür.
        """

        if row is None:
            return datetime.min

        value = row.get("updated_at")

        if value is None:
            return datetime.min
            
        # Naive vs Aware datetime crash'lerini engellemek için tzinfo sıfırlaması
        if hasattr(value, 'tzinfo') and value.tzinfo is not None:
            return value.replace(tzinfo=None)

        return value

    # ==========================================================
    # WINNER
    # ==========================================================

    def get_winner(
        self,
        local_row,
        neon_row,
    ):

        """
        LAST_MODIFIED_WINS
        """

        local_time = self.get_updated_at(local_row)
        neon_time = self.get_updated_at(neon_row)

        if local_time > neon_time:
            return "LOCAL"

        elif neon_time > local_time:
            return "NEON"

        return "EQUAL"

    # ==========================================================
    # UPSERT
    # ==========================================================

    def upsert_row(
        self,
        conn,
        table,
        row,
        pk,
    ):

        """
        INSERT

        veya

        UPDATE
        """

        columns = list(row.keys())

        insert_columns = sql.SQL(", ").join(
            sql.Identifier(c)
            for c in columns
        )

        insert_values = sql.SQL(", ").join(
            sql.Placeholder()
            for _ in columns
        )
        
        # Güncellenebilecek kolonları seç
        update_cols = [c for c in columns if c != pk]

        # Eğer tabloda PK dışında bir kolon yoksa (örn: mapping tabloları), DO UPDATE hata verir.
        if not update_cols:
            query = sql.SQL("""

                INSERT INTO {}

                ({})

                VALUES

                ({})

                ON CONFLICT ({})
                DO NOTHING;

            """).format(

                sql.Identifier(table),
                insert_columns,
                insert_values,
                sql.Identifier(pk),

            )
        else:
            update_columns = sql.SQL(", ").join(

                sql.SQL("{} = EXCLUDED.{}").format(
                    sql.Identifier(c),
                    sql.Identifier(c)
                )

                for c in update_cols
            )

            query = sql.SQL("""
    
                INSERT INTO {}
    
                ({})
    
                VALUES
    
                ({})
    
                ON CONFLICT ({})
                DO UPDATE SET
    
                {};
    
            """).format(
    
                sql.Identifier(table),
                insert_columns,
                insert_values,
                sql.Identifier(pk),
                update_columns,
    
            )

        with conn.cursor() as cur:

            cur.execute(
                query,
                list(row.values())
            )

        conn.commit()

    # ==========================================================
    # COPY RECORD
    # ==========================================================

    def copy_record(
        self,
        source_row,
        target_conn,
        table,
        pk,
    ):

        self.upsert_row(
            target_conn,
            table,
            source_row,
            pk,
        )

    # ==========================================================
    # RESOLVE CONFLICT
    # ==========================================================

    def resolve_conflict(
        self,
        local_row,
        neon_row,
        table,
        pk,
    ):

        """
        Conflict çöz.

        LAST_MODIFIED_WINS
        """

        winner = self.get_winner(
            local_row,
            neon_row,
        )

        if winner == "LOCAL":

            info(
                f"{table} -> "
                f"LOCAL kazandı."
            )

            self.copy_record(
                local_row,
                self.neon_conn,
                table,
                pk,
            )

            return

        if winner == "NEON":

            info(
                f"{table} -> "
                f"NEON kazandı."
            )

            self.copy_record(
                neon_row,
                self.local_conn,
                table,
                pk,
            )

            return

        info(
            f"{table} -> "
            f"Conflict yok."
        )

    # ==========================================================
    # SYNC DIRECTION
    # ==========================================================

    def sync_direction(
        self,
        source_conn,
        target_conn,
        source_name,
        target_name,
    ):

        """
        Belirtilen yönde conflict çözümü yapar.

        Örnek:

            LOCAL -> NEON

            veya

            NEON -> LOCAL
        """

        info("-" * 70)
        info(
            f"{source_name} -> {target_name}"
        )
        info("-" * 70)


        tables = self.get_tables(
            source_conn
        )


        conflict_count = 0

        copied_count = 0


        for table in tables:


            pk = self.get_primary_key(
                source_conn,
                table,
            )


            if pk is None:

                continue



            source_rows = self.get_rows(
                source_conn,
                table,
                pk,
            )


            target_rows = self.get_rows(
                target_conn,
                table,
                pk,
            )


            for row_id, source_row in source_rows.items():


                target_row = target_rows.get(
                    row_id
                )


                # --------------------------------------------------
                # Target tarafında yoksa direkt ekle
                # --------------------------------------------------

                if target_row is None:


                    self.copy_record(
                        source_row,
                        target_conn,
                        table,
                        pk,
                    )


                    copied_count += 1


                    continue



                # --------------------------------------------------
                # İki tarafta da varsa karşılaştır
                # --------------------------------------------------
                
                # Dinamik olarak rollerini belirliyoruz ki winner fonksiyonuna doğru parametre geçilsin
                if source_name == "LOCAL":
                    local_row = source_row
                    neon_row = target_row
                else:
                    local_row = target_row
                    neon_row = source_row

                winner = self.get_winner(
                    local_row,
                    neon_row,
                )


                # Sadece bu döngünün kaynağı kazanırsa hedefe yazma işlemi yapılır.
                # (Diğer yön zaten karşıt döngüde halledilir.)
                if winner == source_name:


                    self.copy_record(
                        source_row,
                        target_conn,
                        table,
                        pk,
                    )


                    conflict_count += 1


        success(
            f"{source_name}->{target_name} tamamlandı."
        )


        info(
            f"Kopyalanan kayıt : {copied_count}"
        )


        info(
            f"Çözülen conflict : {conflict_count}"
        )



    # ==========================================================
    # LOCAL -> NEON
    # ==========================================================

    def sync_local_to_neon(self):

        """
        Local tarafındaki yeni/değişmiş
        kayıtları Neon'a aktarır.
        """

        self.sync_direction(
            self.local_conn,
            self.neon_conn,
            "LOCAL",
            "NEON",
        )


    # ==========================================================
    # NEON -> LOCAL
    # ==========================================================

    def sync_neon_to_local(self):

        """
        Neon tarafındaki yeni/değişmiş
        kayıtları Local'e aktarır.
        """

        self.sync_direction(
            self.neon_conn,
            self.local_conn,
            "NEON",
            "LOCAL",
        )



    # ==========================================================
    # VERIFY
    # ==========================================================

    def verify(self):

        """
        Conflict sonrası iki tarafın
        aynı durumda olup olmadığını kontrol eder.
        """

        info("=" * 70)
        info("CONFLICT VERIFY")
        info("=" * 70)


        local_tables = self.get_tables(
            self.local_conn
        )


        mismatch = 0


        for table in local_tables:


            pk = self.get_primary_key(
                self.local_conn,
                table,
            )


            if pk is None:

                continue



            local_rows = self.get_rows(
                self.local_conn,
                table,
                pk,
            )


            neon_rows = self.get_rows(
                self.neon_conn,
                table,
                pk,
            )



            if local_rows.keys() != neon_rows.keys():


                warning(
                    f"{table} kayıt sayısı farklı."
                )


                mismatch += 1



        if mismatch == 0:

            success(
                "Conflict sonrası veri yapısı eşit."
            )

        else:

            warning(
                f"{mismatch} tablo kontrolünde fark bulundu."
            )



    # ==========================================================
    # REPORT
    # ==========================================================

    def report(self):

        """
        Conflict raporu.
        """

        info("=" * 70)
        info("CONFLICT REPORT")
        info("=" * 70)


        tables = self.get_tables(
            self.local_conn
        )


        for table in tables:


            pk = self.get_primary_key(
                self.local_conn,
                table,
            )


            if pk is None:

                continue


            local_count = len(
                self.get_rows(
                    self.local_conn,
                    table,
                    pk,
                )
            )


            neon_count = len(
                self.get_rows(
                    self.neon_conn,
                    table,
                    pk,
                )
            )


            info(
                f"{table:<35}"
                f"LOCAL={local_count:<8}"
                f"NEON={neon_count}"
            )