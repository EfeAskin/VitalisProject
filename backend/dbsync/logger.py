from pathlib import Path
import logging
from logging.handlers import RotatingFileHandler

# ------------------------------------------------------------
# LOG KLASÖRÜ
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

LOG_DIR = BASE_DIR / "logs"

LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "dbsync.log"

# ------------------------------------------------------------
# LOGGER
# ------------------------------------------------------------

logger = logging.getLogger("VitalisSync")

logger.setLevel(logging.INFO)

logger.propagate = False

# Aynı handler'ın tekrar eklenmesini önle
if not logger.handlers:

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] %(message)s",
        "%Y-%m-%d %H:%M:%S"
    )

    # Terminal
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # Dosya
    file_handler = RotatingFileHandler(
        LOG_FILE,
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8"
    )

    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

# ------------------------------------------------------------
# KULLANIM FONKSİYONLARI
# ------------------------------------------------------------

def info(message):
    logger.info(message)


def warning(message):
    logger.warning(message)


def error(message):
    logger.error(message)


def success(message):
    logger.info(f"✅ {message}")


def schema(message):
    logger.info(f"[SCHEMA] {message}")


def data(message):
    logger.info(f"[DATA] {message}")


def sync(message):
    logger.info(f"[SYNC] {message}")