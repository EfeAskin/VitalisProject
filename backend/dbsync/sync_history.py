from datetime import datetime
from backend.dbsync.logger import logger


class SyncHistory:
    """
    DBSync geçmişini tutar.

    İleride PostgreSQL tablosuna
    veya JSON dosyasına kolayca
    kaydedilebilecek yapıdadır.
    """

    def __init__(self):

        self.start_time = None
        self.end_time = None

        self.insert_count = 0
        self.update_count = 0

        self.success = False
        self.error = None

    # ==========================================================
    # START
    # ==========================================================

    def start(self):

        self.start_time = datetime.now()

        logger.info("SYNC HISTORY başlatıldı.")

    # ==========================================================
    # FINISH
    # ==========================================================

    def finish(

        self,

        insert_count=0,

        update_count=0,

        success=True

    ):

        self.end_time = datetime.now()

        self.insert_count = insert_count
        self.update_count = update_count

        self.success = success

        logger.info("SYNC HISTORY tamamlandı.")

    # ==========================================================
    # ERROR
    # ==========================================================

    def fail(self, error):

        self.end_time = datetime.now()

        self.success = False

        self.error = str(error)

        logger.error(f"SYNC FAILED -> {error}")

    # ==========================================================
    # DURATION
    # ==========================================================

    @property
    def duration(self):

        if self.start_time is None:

            return 0

        end = self.end_time or datetime.now()

        return round(

            (end - self.start_time).total_seconds(),

            3

        )

    # ==========================================================
    # EXPORT
    # ==========================================================

    def to_dict(self):

        return {

            "start_time": self.start_time,

            "end_time": self.end_time,

            "duration": self.duration,

            "insert_count": self.insert_count,

            "update_count": self.update_count,

            "success": self.success,

            "error": self.error

        }

    # ==========================================================
    # RESET
    # ==========================================================

    def reset(self):

        self.__init__()