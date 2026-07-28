import os

from dotenv import load_dotenv

import psycopg2
from psycopg2.extras import RealDictCursor

from backend.dbsync.logger import (
    info,
    warning,
    error,
    success,
)

load_dotenv()

LOCAL_DATABASE_URL = os.getenv("LOCAL_DATABASE_URL")
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
DATABASE_MODE = os.getenv("DATABASE_MODE", "auto").lower()


class DatabaseConnectionManager:

    def __init__(self):
        self.local_conn = None
        self.neon_conn = None

    # ==========================================================
    # LOCAL
    # ==========================================================

    def connect_local(self):
        """Local PostgreSQL'e bağlanmayı dener."""

        try:

            self.local_conn = psycopg2.connect(
                LOCAL_DATABASE_URL,
                cursor_factory=RealDictCursor,
                connect_timeout=3
            )

            with self.local_conn.cursor() as cur:
                cur.execute("SELECT version();")

            success("Local PostgreSQL bağlantısı başarılı.")

            return True

        except Exception as e:

            self.local_conn = None

            error(f"Local PostgreSQL bağlantısı başarısız.\n{e}")

            return False

    # ==========================================================
    # NEON
    # ==========================================================

    def connect_neon(self):
        """Neon PostgreSQL'e bağlanmayı dener."""

        try:

            self.neon_conn = psycopg2.connect(
                NEON_DATABASE_URL,
                cursor_factory=RealDictCursor,
                connect_timeout=5
            )

            with self.neon_conn.cursor() as cur:
                cur.execute("SELECT version();")

            success("Neon PostgreSQL bağlantısı başarılı.")

            return True

        except Exception as e:

            self.neon_conn = None

            error(f"Neon PostgreSQL bağlantısı başarısız.\n{e}")

            return False

    # ==========================================================
    # CONNECT
    # ==========================================================

    def connect(self):

        """
        DATABASE_MODE

        auto
        local
        neon
        """

        mode = DATABASE_MODE

        info(f"Database Mode : {mode}")

        if mode == "local":

            if self.connect_local():
                info("Sadece Local PostgreSQL kullanılacak.")

            else:
                raise Exception("Local PostgreSQL'e bağlanılamadı.")

        elif mode == "neon":

            if self.connect_neon():
                info("Sadece Neon PostgreSQL kullanılacak.")

            else:
                raise Exception("Neon PostgreSQL'e bağlanılamadı.")

        elif mode == "auto":

            local_ok = self.connect_local()

            neon_ok = self.connect_neon()

            if local_ok and neon_ok:

                success("Her iki veritabanı da erişilebilir.")

            elif local_ok:

                warning("Neon erişilemiyor. Local PostgreSQL kullanılacak.")

            elif neon_ok:

                warning("Local erişilemiyor. Neon PostgreSQL kullanılacak.")

            else:

                error("Hiçbir veritabanına bağlanılamadı.")

                raise Exception("Hiçbir veritabanına bağlanılamadı.")

        else:

            error(f"Geçersiz DATABASE_MODE: {mode}")

            raise Exception(f"Geçersiz DATABASE_MODE: {mode}")

    # ==========================================================
    # CLOSE
    # ==========================================================

    def close(self):

        if self.local_conn:

            self.local_conn.close()

            info("Local PostgreSQL bağlantısı kapatıldı.")

        if self.neon_conn:

            self.neon_conn.close()

            info("Neon PostgreSQL bağlantısı kapatıldı.")