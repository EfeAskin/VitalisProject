import os
import psycopg2

from psycopg2 import pool, OperationalError, InterfaceError
from psycopg2.extras import RealDictCursor
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

# =========================================================================
# CONNECTION POOL
# =========================================================================

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

    print(f"🚨 Havuz oluşturulamadı. Doğrudan bağlantı aktif. {e}")

# =========================================================================
# CONNECTION GENERATOR
# =========================================================================

def get_db_connection():

    conn = None

    # -------------------------------------------------------------
    # Pool kullan
    # -------------------------------------------------------------

    if connection_pool is not None:

        try:

            conn = connection_pool.getconn()

            if conn.closed != 0:
                raise OperationalError("Pool içindeki bağlantı kapalı.")

            with conn.cursor() as cur:
                cur.execute("SELECT 1;")

            yield conn

        except (OperationalError, InterfaceError) as db_err:

            print(f"⚠️ Pool bağlantısı bozuldu. Yenileniyor... {db_err}")

            if conn:

                try:
                    connection_pool.putconn(conn, close=True)
                except Exception:
                    pass

            conn = psycopg2.connect(
                DATABASE_URL,
                cursor_factory=RealDictCursor
            )

            try:
                yield conn
            finally:
                conn.close()

        finally:

            if (
                conn
                and connection_pool is not None
                and not conn.closed
            ):

                try:
                    connection_pool.putconn(conn)
                except Exception:

                    if not conn.closed:
                        conn.close()

    # -------------------------------------------------------------
    # Pool yok
    # -------------------------------------------------------------

    else:

        try:

            conn = psycopg2.connect(
                DATABASE_URL,
                cursor_factory=RealDictCursor
            )

            yield conn

        except Exception as e:

            print(f"🚨 Veritabanı bağlantı hatası : {e}")
            raise

        finally:

            if conn:
                conn.close()