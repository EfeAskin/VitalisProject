import os
import psycopg2
from psycopg2 import pool, OperationalError, InterfaceError
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Ana dizindeki .env dosyasını güvenli bir şekilde yükle
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("KRİTİK GÜVENLİK HATASI: DATABASE_URL çevre değişkeni bulunamadı! .env dosyasını kontrol edin.")

# =========================================================================
# Neon DB için Gelişmiş Thread-Safe Bağlantı Havuzu (Connection Pool)
# =========================================================================
try:
    connection_pool = pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=15,  # Neon ücretsiz katman limitlerine uygun, optimize edilmiş sınır
        dsn=DATABASE_URL,
        cursor_factory=RealDictCursor
    )
    print("🛡️ Vitalis-OS Sızdırmaz Neon DB Bağlantı Havuzu başarıyla başlatıldı.")
except Exception as e:
    connection_pool = None
    print(f"🚨 KRİTİK UYARI: Bağlantı havuzu başlatılamadı, doğrudan bağlantı modu aktif. Hata: {e}")


def get_db_connection():
    """
    Siber güvenli, SSL kopmalarına ve zaman aşımlarına (Neon DB spin-down) karşı
    dirençli, otomatik kendini onaran (Self-Healing) veritabanı bağlantı üreteci.
    """
    conn = None
    
    # 1. YOL: Bağlantı Havuzu Aktifse (Üretim/Production Ortamı)
    if connection_pool is not None:
        try:
            conn = connection_pool.getconn()
            
            # 🔥 SİBER SAĞLIK CHECK'İ (Zaman aşımına uğramış SSL hatlarını engeller)
            # Bağlantı fiziksel olarak kapandıysa veya havuzda bayatladıysa doğrula
            if conn.closed != 0:
                raise OperationalError("Havuzdaki veritabanı bağlantısı bayatlamış/ölmüş.")
            
            # Hafif bir ping sorgusu atarak hattın gerçekten canlı olup olmadığını doğrula
            with conn.cursor() as ping_cur:
                ping_cur.execute("SELECT 1;")
            
            yield conn
            
        except (OperationalError, InterfaceError) as db_err:
            print(f"⚠️ Kopuk SSL/Bağlantı algılandı, hat otomatik yenileniyor... Detay: {db_err}")
            
            # Havuzdaki bozuk bağlantıyı sistemden güvenli bir şekilde temizle
            if conn:
                try:
                    connection_pool.putconn(conn, close=True)
                except Exception:
                    pass
            
            # Yedek taze bağlantı aç ve işi bitince kapat (Sistem kesintiye uğramaz)
            conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
            try:
                yield conn
            finally:
                conn.close()
                
        finally:
            # Her şey yolunda gittiyse, bağlantıyı kapatmadan havuza güvenle geri teslim et
            if conn and connection_pool is not None and not conn.closed:
                try:
                    connection_pool.putconn(conn)
                except Exception:
                    # Havuza iade ederken beklenmedik bir hata oluşursa sızıntıyı önlemek için fiziksel kapat
                    if not conn.closed:
                        conn.close()
                        
    # 2. YOL: Havuz Oluşturulamadıysa (Local Fallback Ortamı)
    else:
        try:
            conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
            yield conn
        except Exception as e:
            print(f"🚨 Doğrudan DB bağlantı hatası: {e}")
            raise
        finally:
            if conn:
                conn.close()