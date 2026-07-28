from contextlib import ContextDecorator

from psycopg2 import Error

from backend.dbsync.logger import logger


class TransactionManager(ContextDecorator):
    """
    PostgreSQL Transaction Manager

    Kullanım:

    with TransactionManager(connection):

        cursor.execute(...)
        cursor.execute(...)

    Başarılıysa COMMIT

    Hata olursa otomatik ROLLBACK
    """

    def __init__(self, connection):

        self.connection = connection

        self.cursor = None

    # ==========================================================
    # ENTER
    # ==========================================================

    def __enter__(self):

        self.cursor = self.connection.cursor()

        logger.info("Transaction başladı.")

        return self.cursor

    # ==========================================================
    # EXIT
    # ==========================================================

    def __exit__(self, exc_type, exc_value, traceback):

        try:

            if exc_type is None:

                self.connection.commit()

                logger.info("Transaction COMMIT edildi.")

            else:

                self.connection.rollback()

                logger.error(
                    f"Transaction ROLLBACK edildi : {exc_value}"
                )

        except Error as e:

            logger.error(f"Transaction hatası : {e}")

            raise

        finally:

            if self.cursor:

                self.cursor.close()

        return False