import os
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status, Body
from psycopg2.extras import RealDictCursor
import database as db

router = APIRouter(prefix="/api/v1/tickets", tags=["Support Tickets"])

# -------------------------------------------------------------------------
# 1. YENİ DESTEK BİLETİ OLUŞTURMA
# -------------------------------------------------------------------------
@router.post("/create")
async def create_ticket(request: Request, payload: dict = Body(...)):
    subject = payload.get("subject", "").strip()
    message = payload.get("message", "").strip()
    ticket_type = payload.get("ticket_type", "Others").strip().capitalize()

    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="Oturum kapalı.")

    user_id = current_user.get("id")

    if not subject:
        raise HTTPException(status_code=400, detail="Bilet konusu boş olamaz.")
    if not message:
        raise HTTPException(status_code=400, detail="Mesaj içeriği boş olamaz.")

    valid_types = ['Support', 'Bugs', 'Complaints', 'Desire', 'Others']
    if ticket_type not in valid_types:
        ticket_type = 'Others'

    conn = db.get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            INSERT INTO tickets (sender_id, subject, ticket_type, ticket_status, created_at, updated_at)
            VALUES (%s, %s, %s, 'Waiting', NOW(), NOW())
            RETURNING id
        """, (user_id, subject[:100], ticket_type))

        ticket_id = cursor.fetchone()['id']

        cursor.execute("""
            INSERT INTO ticket_messages (ticket_id, sender_id, message_text, sent_at)
            VALUES (%s, %s, %s, NOW())
        """, (ticket_id, user_id, message))

        conn.commit()
        return {"status": "success", "ticket_id": ticket_id, "message": "Destek talebiniz başarıyla oluşturuldu."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Bilet oluşturulurken hata: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# -------------------------------------------------------------------------
# 2. BİLETLERİ LİSTELEME (Role-Based Access Control)
# -------------------------------------------------------------------------
@router.get("/list")
async def get_tickets_list(request: Request):
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="Yetkisiz erişim.")

    user_id = current_user.get("id")
    user_role = (current_user.get("role") or "client").lower()
    is_admin = (user_role == "admin")

    conn = db.get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if is_admin:
            # Admin tüm destek taleplerini görebilir
            cursor.execute("""
                SELECT t.id, t.subject, t.ticket_type, t.ticket_status, t.created_at, t.updated_at,
                       u.first_name, u.last_name, u.role as user_role, u.profile_image
                FROM tickets t
                JOIN users u ON t.sender_id = u.id
                ORDER BY t.updated_at DESC
            """)
        else:
            # Client, Trainer ve Dietitian sadece KENDİ açtığı talepleri görür
            cursor.execute("""
                SELECT t.id, t.subject, t.ticket_type, t.ticket_status, t.created_at, t.updated_at,
                       u.first_name, u.last_name, u.profile_image
                FROM tickets t
                JOIN users u ON t.sender_id = u.id
                WHERE t.sender_id = %s
                ORDER BY t.updated_at DESC
            """, (user_id,))

        tickets = cursor.fetchall()
        
        # Datetime formatlarını ISO string'e dönüştür
        for t in tickets:
            t["created_at"] = t["created_at"].isoformat() if t["created_at"] else None
            t["updated_at"] = t["updated_at"].isoformat() if t["updated_at"] else None

        return {"status": "success", "is_admin": is_admin, "tickets": tickets}

    finally:
        cursor.close()
        conn.close()

# -------------------------------------------------------------------------
# 3. DETAY VE MESAJ GEÇMİŞİ
# -------------------------------------------------------------------------
@router.get("/{ticket_id}")
async def get_ticket_details(ticket_id: int, request: Request):
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="Yetkisiz erişim.")

    user_id = current_user.get("id")
    user_role = (current_user.get("role") or "client").lower()
    is_admin = (user_role == "admin")

    conn = db.get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
        ticket = cursor.fetchone()

        if not ticket:
            raise HTTPException(status_code=404, detail="Destek talebi bulunamadı.")

        if not is_admin and ticket["sender_id"] != user_id:
            raise HTTPException(status_code=403, detail="Bu bilet detayını görme yetkiniz yok.")

        cursor.execute("""
            SELECT tm.id, tm.sender_id, tm.message_text, tm.sent_at,
                   u.first_name, u.last_name, u.role, u.profile_image
            FROM ticket_messages tm
            JOIN users u ON tm.sender_id = u.id
            WHERE tm.ticket_id = %s
            ORDER BY tm.sent_at ASC
        """, (ticket_id,))
        messages_raw = cursor.fetchall()

        messages = []
        for msg in messages_raw:
            msg_role = (msg['role'] or 'client').lower()
            messages.append({
                "id": msg["id"],
                "sender_id": msg["sender_id"],
                "sender_name": f"{msg['first_name']} {msg['last_name']}",
                "sender_role": msg_role,
                "is_staff_reply": msg_role == 'admin',
                "message": msg['message_text'],
                "sent_at": msg['sent_at'].strftime("%H:%M - %d.%m.%Y") if msg['sent_at'] else ""
            })

        return {
            "status": "success",
            "ticket": {
                "id": ticket["id"],
                "subject": ticket["subject"],
                "ticket_type": ticket["ticket_type"],
                "ticket_status": ticket["ticket_status"],
                "created_at": ticket["created_at"].isoformat() if ticket["created_at"] else None
            },
            "messages": messages
        }

    finally:
        cursor.close()
        conn.close()

# -------------------------------------------------------------------------
# 4. BİLETE YANIT EKLEME
# -------------------------------------------------------------------------
@router.post("/{ticket_id}/reply")
async def reply_ticket(ticket_id: int, request: Request, payload: dict = Body(...)):
    message_text = payload.get("message", "").strip()
    if not message_text:
        raise HTTPException(status_code=400, detail="Mesaj boş olamaz.")

    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="Oturum kapalı.")

    user_id = current_user.get("id")
    user_role = (current_user.get("role") or "client").lower()
    is_admin = (user_role == "admin")

    conn = db.get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT sender_id FROM tickets WHERE id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            raise HTTPException(status_code=404, detail="Bilet kaydı bulunamadı.")

        if ticket['sender_id'] != user_id and not is_admin:
            raise HTTPException(status_code=403, detail="Yanıt verme yetkiniz yok.")

        cursor.execute("""
            INSERT INTO ticket_messages (ticket_id, sender_id, message_text, sent_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING id
        """, (ticket_id, user_id, message_text))
        new_msg_id = cursor.fetchone()['id']

        # Durum Güncellemesi: Admin yazdıysa bilet 'Active'/Yanıtlandı yapılır
        new_status = 'Active' if is_admin else 'Waiting'
        cursor.execute("""
            UPDATE tickets 
            SET ticket_status = %s, updated_at = NOW()
            WHERE id = %s
        """, (new_status, ticket_id))

        conn.commit()
        return {"status": "success", "message_id": new_msg_id}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()