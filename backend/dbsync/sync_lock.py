import threading

from backend.dbsync.logger import logger


class SyncLock:
    """
    DBSync işlemleri için global kilit mekanizması.

    Aynı anda yalnızca bir senkronizasyon
    çalışmasına izin verir.

    Scheduler veya manuel başlatılan
    senkronizasyonların çakışmasını önler.
    """

    _lock = threading.Lock()

    # ==========================================================
    # LOCK
    # ==========================================================

    @classmethod
    def acquire(cls) -> bool:
        """
        Kilidi almaya çalışır.

        True  -> kilit alındı

        False -> başka bir sync çalışıyor
        """

        acquired = cls._lock.acquire(blocking=False)

        if acquired:

            logger.info("SYNC LOCK alındı.")

        else:

            logger.warning(
                "Başka bir senkronizasyon zaten çalışıyor."
            )

        return acquired

    # ==========================================================
    # RELEASE
    # ==========================================================

    @classmethod
    def release(cls):
        """
        Kilidi bırakır.
        """

        if cls._lock.locked():

            cls._lock.release()

            logger.info("SYNC LOCK bırakıldı.")

    # ==========================================================
    # STATUS
    # ==========================================================

    @classmethod
    def locked(cls) -> bool:
        """
        Kilit durumunu döndürür.
        """

        return cls._lock.locked()

    # ==========================================================
    # CONTEXT MANAGER
    # ==========================================================

    def __enter__(self):

        if not self.acquire():

            raise RuntimeError(
                "Başka bir senkronizasyon çalışıyor."
            )

        return self

    def __exit__(

        self,

        exc_type,

        exc_val,

        exc_tb

    ):

        self.release()