import threading
import time

from backend.dbsync.logger import logger


class Scheduler:
    """
    DBSync Scheduler

    - Belirlenen aralıklarla çalışır.
    - Önce Neon bağlantısını test eder.
    - Bağlantı yoksa Sync başlatılmaz.
    - Bağlantı varsa DataSync çalıştırılır.
    - Admin panelinden manuel synchronize()
      çağrılmasıyla tamamen uyumludur.
    """

    def __init__(

        self,

        sync,

        interval=1200  # 20 dakika

    ):

        self.sync = sync

        self.interval = interval

        self._running = False

        self._thread = None

    # ==========================================================
    # CONNECTION CHECK
    # ==========================================================

    def _check_connection(self):

        try:

            cursor = self.sync.neon_conn.cursor()

            cursor.execute("SELECT 1")

            cursor.fetchone()

            cursor.close()

            return True

        except Exception:

            return False

    # ==========================================================
    # LOOP
    # ==========================================================

    def _run(self):

        logger.info(
            f"Scheduler başlatıldı. "
            f"Interval = {self.interval} saniye."
        )

        while self._running:

            try:

                if not self._check_connection():

                    logger.info(
                        "Neon veritabanına ulaşılamadı. "
                        "Bir sonraki deneme zamanında tekrar denenecek."
                    )

                else:

                    logger.info(
                        "Neon bağlantısı başarılı. "
                        "DBSync başlatılıyor."
                    )

                    self.sync.synchronize()

            except Exception as e:

                logger.exception(
                    f"Scheduler hatası: {e}"
                )

            time.sleep(self.interval)

        logger.info("Scheduler durduruldu.")

    # ==========================================================
    # START
    # ==========================================================

    def start(self):

        if self._running:

            logger.warning(
                "Scheduler zaten çalışıyor."
            )

            return

        self._running = True

        self._thread = threading.Thread(

            target=self._run,

            daemon=True,

            name="DBSyncScheduler"

        )

        self._thread.start()

    # ==========================================================
    # STOP
    # ==========================================================

    def stop(self):

        if not self._running:

            return

        self._running = False

        if self._thread:

            self._thread.join()

    # ==========================================================
    # MANUAL SYNC
    # ==========================================================

    def run_now(self):

        """
        Admin panelindeki
        'Sync Now' butonu
        doğrudan bunu çağırabilir.
        """

        logger.info("Manuel DBSync başlatıldı.")

        self.sync.synchronize()

    # ==========================================================
    # STATUS
    # ==========================================================

    @property
    def running(self):

        return self._running