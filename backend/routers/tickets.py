import random
import string
from datetime import datetime
from contextlib import contextmanager
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor

# =========================================================================
# IMPORT YÖNETİMİ (FALLBACK SİSTEMİ)
# =========================================================================

try:
    from backend.database import get_db_connection
except ModuleNotFoundError:
    from database import get_db_connection

try:
    from backend.routers.auth import get_current_user
except ModuleNotFoundError:
    from routers.auth import get_current_user


# =========================================================================
# VERİTABANI BAĞLANTISI (CONTEXT MANAGER)
# =========================================================================

@contextmanager
def db_connection():
    """
    get_db_connection() generator döndürdüğü için veritabanı bağlantısının 
    yaşam döngüsünü güvenli bir şekilde yönetir.
    """
    db_generator = get_db_connection()
    try:
        conn = next(db_generator)
        if conn is None:
            raise HTTPException(
                status_code=500,
                detail="Veritabanı bağlantısı kurulamadı."
            )
        yield conn
    except StopIteration:
        raise HTTPException(
            status_code=500,
            detail="Veritabanı bağlantısı alınamadı."
        )
    finally:
        try:
            db_generator.close()
        except Exception:
            pass


# =========================================================================
# SCHEMAS & ROUTER
# =========================================================================

router = APIRouter(prefix="/api/v1/tickets", tags=["Tickets"])

class TicketCreate(BaseModel):
    subject: str
    category: str = "Teknik Destek"
    priority: str = "Normal"
    message: str

class MessageCreate(BaseModel):
    message_text: str

def generate_ticket_code() -> str:
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"VTS-{random_str}"


# =========================================================================
# ENDPOINTS
# =========================================================================

@router.get("", response_model=List[dict])
def get_user_tickets(current_user: dict = Depends(get_current_user)):
    """
    Kullanıcıya ait biletleri listeler.
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    with db_connection() as conn:
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, ticket_code, user_id, subject, category, priority, status, created_at, updated_at
                    FROM tickets
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_id,))
                tickets = cur.fetchall()
                return tickets
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Biletler çekilirken hata oluştu: {str(e)}"
            )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_data: TicketCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Yeni bilet ve ilk bilet mesajını oluşturur.
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    ticket_code = generate_ticket_code()
    now = datetime.now()

    with db_connection() as conn:
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # 1. Bilet ekleme
                cur.execute("""
                    INSERT INTO tickets (ticket_code, user_id, subject, category, priority, status, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, 'İşlemde', %s, %s)
                    RETURNING id, ticket_code, user_id, subject, category, priority, status, created_at, updated_at
                """, (ticket_code, user_id, ticket_data.subject, ticket_data.category, ticket_data.priority, now, now))
                
                new_ticket = cur.fetchone()
                ticket_id = new_ticket["id"]

                # 2. İlk detay mesajını ekleme
                cur.execute("""
                    INSERT INTO ticket_messages (ticket_id, sender_id, message_text, sent_at)
                    VALUES (%s, %s, %s, %s)
                """, (ticket_id, user_id, ticket_data.message, now))

                conn.commit()
                return new_ticket
        except Exception as e:
            conn.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Bilet oluşturulurken hata oluştu: {str(e)}"
            )


@router.get("/{ticket_id}/messages", response_model=List[dict])
def get_ticket_messages(
    ticket_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Bilete ait mesaj geçmişini çeker.
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    with db_connection() as conn:
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT user_id FROM tickets WHERE id = %s", (ticket_id,))
                ticket = cur.fetchone()
                if not ticket:
                    raise HTTPException(status_code=404, detail="Bilet bulunamadı.")
                
                is_admin = current_user.get("role") in ["admin", "superadmin"]
                if ticket["user_id"] != user_id and not is_admin:
                    raise HTTPException(status_code=403, detail="Bu bilete erişim yetkiniz bulunmuyor.")

                cur.execute("""
                    SELECT id, ticket_id, sender_id, message_text, sent_at
                    FROM ticket_messages
                    WHERE ticket_id = %s
                    ORDER BY sent_at ASC
                """, (ticket_id,))
                messages = cur.fetchall()
                return messages
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Mesajlar çekilirken hata oluştu: {str(e)}"
            )


@router.post("/{ticket_id}/messages", status_code=status.HTTP_201_CREATED)
def send_ticket_message(
    ticket_id: int,
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Bilete yanıt gönderir.
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    now = datetime.now()

    with db_connection() as conn:
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT id, user_id, status FROM tickets WHERE id = %s", (ticket_id,))
                ticket = cur.fetchone()
                if not ticket:
                    raise HTTPException(status_code=404, detail="Bilet bulunamadı.")

                if ticket["status"] == "Çözüldü":
                    raise HTTPException(status_code=400, detail="Çözülmüş bir bilete tekrar mesaj gönderilemez.")

                cur.execute("""
                    INSERT INTO ticket_messages (ticket_id, sender_id, message_text, sent_at)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, ticket_id, sender_id, message_text, sent_at
                """, (ticket_id, user_id, message_data.message_text, now))
                
                inserted_message = cur.fetchone()

                # Biletin güncellenme tarihini güncelle
                cur.execute("UPDATE tickets SET updated_at = %s WHERE id = %s", (now, ticket_id))

                conn.commit()
                return inserted_message
        except HTTPException:
            raise
        except Exception as e:
            conn.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Mesaj gönderilirken hata oluştu: {str(e)}"
            )