import os
import psycopg2

from psycopg2 import pool, OperationalError, InterfaceError
from psycopg2.extras import RealDictCursor
from psycopg2.pool import PoolError
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# DATABASE URLS
# ============================================================

LOCAL_DATABASE_URL = os.getenv("LOCAL_DATABASE_URL")
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
DATABASE_MODE = os.getenv("DATABASE_MODE", "auto").lower()


# ============================================================
# CONNECTION TESTS
# ============================================================

def can_connect_neon():

    if not NEON_DATABASE_URL:
        return False

    try:

        conn = psycopg2.connect(
            NEON_DATABASE_URL,
            cursor_factory=RealDictCursor,
            connect_timeout=5
        )

        with conn.cursor() as cur:
            cur.execute("SELECT 1;")

        conn.close()

        return True

    except Exception:

        return False


def can_connect_local():

    if not LOCAL_DATABASE_URL:
        return False

    try:

        conn = psycopg2.connect(
            LOCAL_DATABASE_URL,
            cursor_factory=RealDictCursor,
            connect_timeout=3
        )

        with conn.cursor() as cur:
            cur.execute("SELECT 1;")

        conn.close()

        return True

    except Exception:

        return False


# ============================================================
# DATABASE SELECTION
# ============================================================

if DATABASE_MODE == "local":

    DATABASE_URL = LOCAL_DATABASE_URL

    print("🖥️ DATABASE MODE : LOCAL")

elif DATABASE_MODE == "neon":

    DATABASE_URL = NEON_DATABASE_URL

    print("☁️ DATABASE MODE : NEON")

else:

    if can_connect_neon():

        DATABASE_URL = NEON_DATABASE_URL

        print("☁️ Neon PostgreSQL bulundu. Neon kullanılacak.")

    elif can_connect_local():

        DATABASE_URL = LOCAL_DATABASE_URL

        print("🖥️ Neon erişilemiyor. Local PostgreSQL kullanılacak.")

    else:

        raise RuntimeError(
            "Neon ve Local PostgreSQL veritabanlarına bağlanılamadı."
        )


if not DATABASE_URL:

    raise RuntimeError(
        "DATABASE_URL bulunamadı. .env dosyanı kontrol et."
    )


# ============================================================
# CONNECTION POOL
# ============================================================

try:

    connection_pool = pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=15,
        dsn=DATABASE_URL,
        cursor_factory=RealDictCursor,
    )

    print("🛡️ Vitalis-OS Bağlantı Havuzu başarıyla başlatıldı.")

except Exception as e:

    connection_pool = None

    print(
        f"🚨 Havuz oluşturulamadı. "
        f"Doğrudan bağlantı aktif. {e}"
    )


# ============================================================
# CONNECTION GENERATOR
# ============================================================

def get_db_connection():

    conn = None
    pooled_connection = False

    # ========================================================
    # POOL KULLAN
    # ========================================================

    if connection_pool is not None:

        try:

            # ------------------------------------------------
            # Pool'dan bağlantı al
            # ------------------------------------------------

            conn = connection_pool.getconn()
            pooled_connection = True

            # ------------------------------------------------
            # Bağlantı kapalıysa havuza geri koyma.
            # Tamamen discard et.
            # ------------------------------------------------

            if conn.closed != 0:

                try:
                    connection_pool.putconn(
                        conn,
                        close=True
                    )
                except Exception:
                    pass

                conn = None

                raise OperationalError(
                    "Pool içindeki bağlantı kapalı."
                )

            # ------------------------------------------------
            # Bağlantıyı test et
            # ------------------------------------------------

            with conn.cursor() as cur:
                cur.execute("SELECT 1;")

            # ------------------------------------------------
            # Endpoint'e bağlantıyı ver
            # ------------------------------------------------

            yield conn

        except PoolError as pool_error:

            print(
                f"🚨 Database connection pool exhausted: "
                f"{pool_error}"
            )

            raise

        except (OperationalError, InterfaceError) as db_error:

            print(
                f"⚠️ Pool bağlantısı bozuldu. "
                f"Yeni bağlantı açılıyor... {db_error}"
            )

            # ------------------------------------------------
            # Bozuk pool bağlantısını discard et
            # ------------------------------------------------

            if conn is not None and pooled_connection:

                try:
                    connection_pool.putconn(
                        conn,
                        close=True
                    )
                except Exception:
                    pass

                conn = None

            # ------------------------------------------------
            # Pool yerine geçici bağlantı oluştur
            # ------------------------------------------------

            fallback_conn = None

            try:

                fallback_conn = psycopg2.connect(
                    DATABASE_URL,
                    cursor_factory=RealDictCursor
                )

                yield fallback_conn

            finally:

                if fallback_conn is not None:

                    try:
                        fallback_conn.close()
                    except Exception:
                        pass

        finally:

            # =================================================
            # POOL'DAN ALINAN BAĞLANTIYI MUTLAKA GERİ VER
            # =================================================

            if conn is not None and pooled_connection:

                try:

                    # Bağlantı endpoint tarafından kapatılmışsa
                    # pool'a kapalı olarak geri gönder.
                    if conn.closed != 0:

                        connection_pool.putconn(
                            conn,
                            close=True
                        )

                    else:

                        connection_pool.putconn(
                            conn
                        )

                except Exception as return_error:

                    print(
                        f"⚠️ Database bağlantısı pool'a "
                        f"geri verilemedi: {return_error}"
                    )

                    try:
                        if not conn.closed:
                            conn.close()
                    except Exception:
                        pass


    # ========================================================
    # POOL YOKSA
    # ========================================================

    else:

        direct_conn = None

        try:

            direct_conn = psycopg2.connect(
                DATABASE_URL,
                cursor_factory=RealDictCursor
            )

            yield direct_conn

        except Exception as e:

            print(
                f"🚨 Veritabanı bağlantı hatası: {e}"
            )

            raise

        finally:

            if direct_conn is not None:

                try:
                    direct_conn.close()
                except Exception:
                    pass