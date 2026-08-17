import json
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

# Python 3.9+ zaman dilimi modülü ve Windows/tzdata uyumluluk yönetimi
try:
    from zoneinfo import ZoneInfo

    try:
        tr_tz = ZoneInfo("Europe/Istanbul")
    except Exception:
        tr_tz = timezone(timedelta(hours=3))
except ImportError:
    try:
        import pytz
        tr_tz = pytz.timezone("Europe/Istanbul")
    except Exception:
        tr_tz = timezone(timedelta(hours=3))

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    status,
    Query,
    Body,
    Depends,
)
from jose import JWTError, jwt
from psycopg2.extras import RealDictCursor

# =========================================================================
# AUTH SİSTEMİ
# =========================================================================

try:
    from backend.routers.auth import (
        get_current_user,
        SECRET_KEY,
        ALGORITHM,
    )
except ModuleNotFoundError:
    from routers.auth import (
        get_current_user,
        SECRET_KEY,
        ALGORITHM,
    )

# =========================================================================
# VERİTABANI BAĞLANTISI
# =========================================================================

try:
    from backend.database import get_db_connection
except ModuleNotFoundError:
    from database import get_db_connection


@contextmanager
def db_connection():
    """
    get_db_connection() FastAPI dependency olarak generator döndürdüğü
    için burada gerçek PostgreSQL bağlantısını alır ve generator yaşam
    döngüsünü düzgün şekilde kapatır.
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
# ROUTER'LAR
# =========================================================================

router = APIRouter(
    prefix="/api/v1/messages",
    tags=["Real-time Messages & WebSockets"]
)

expert_router = APIRouter(
    prefix="/api/v1/expert/messages",
    tags=["Expert Messages"]
)


# =========================================================================
# YARDIMCI FONKSİYONLAR
# =========================================================================

def get_expert_roles():
    """
    Sistemde uzman/danışman olarak kabul edilen roller.
    DB'deki mevcut rollerle uyumlu tutulur.
    """
    return (
        "expert",
        "professional",
        "dietitian",
        "trainer",
        "pt",
        "uzman",
    )


def resolve_avatar_url(profile_image: Optional[str]) -> str:
    """Profil fotoğrafı URL'ini standart formata getirir."""
    if not profile_image:
        return "/static/avatars/default_user.png"

    img = str(profile_image).strip()

    if not img:
        return "/static/avatars/default_user.png"

    if img.startswith("http://") or img.startswith("https://"):
        return img

    if img.startswith("/fotos/"):
        return img

    if img.startswith("fotos/"):
        return f"/{img}"

    if img.startswith("/static/"):
        return img

    if img.startswith("static/"):
        return f"/{img}"

    return f"/static/avatars/{img}"


def format_timestamp(dt: Optional[datetime]) -> str:
    """Datetime objesini Europe/Istanbul saat diliminde HH:MM formatına getirir."""
    if not dt:
        return ""

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(tr_tz).strftime("%H:%M")


def extract_user_id(current_user) -> int:
    """
    auth.py -> get_current_user() tarafından döndürülen kullanıcıdan
    güvenli şekilde kullanıcı ID'sini çıkarır.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum açmanız gerekiyor."
        )

    if isinstance(current_user, dict):
        uid = (
            current_user.get("id")
            or current_user.get("user_id")
            or current_user.get("_id")
        )
    elif isinstance(current_user, (tuple, list)):
        uid = current_user[0] if len(current_user) > 0 else None
    else:
        uid = (
            getattr(current_user, "id", None)
            or getattr(current_user, "user_id", None)
        )

    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı oturumu."
        )

    try:
        return int(uid)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı kimliği."
        )


def get_current_user_id(
    current_user=Depends(get_current_user),
) -> int:
    """
    REST endpoint'leri için ortak authentication dependency.
    """
    return extract_user_id(current_user)


# =========================================================================
# WEBSOCKET AUTHENTICATION
# =========================================================================

async def authenticate_websocket_user(
    websocket: WebSocket,
    requested_user_id: int,
    token: Optional[str] = None,
) -> Optional[int]:
    """
    WebSocket bağlantısında JWT doğrulaması yapar.

    Token kaynakları:
    1. token query parametresi
    2. access_token query parametresi
    3. access_token cookie
    4. Authorization header
    """
    access_token = token

    if not access_token:
        access_token = websocket.query_params.get("access_token")

    if not access_token:
        access_token = websocket.cookies.get("access_token")

    if not access_token:
        auth_header = (
            websocket.headers.get("Authorization")
            or websocket.headers.get("authorization")
        )

        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ", 1)[1].strip()

    if not access_token:
        return None

    try:
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")
        token_user_id = payload.get("user_id")

        if not email:
            return None

    except JWTError:
        return None
    except Exception:
        return None

    try:
        with db_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)

            cur.execute(
                """
                SELECT id, email, role
                FROM users
                WHERE email = %s
                """,
                (email,)
            )

            user = cur.fetchone()
            cur.close()

            if not user:
                return None

            db_user_id = int(user["id"])

            if token_user_id is not None:
                try:
                    if int(token_user_id) != db_user_id:
                        return None
                except (TypeError, ValueError):
                    return None

            if requested_user_id and int(requested_user_id) != db_user_id:
                return None

            return db_user_id

    except Exception as e:
        print(f"WebSocket kullanıcı doğrulama hatası: {e}")
        return None


# =========================================================================
# 1. WEBSOCKET CONNECTION MANAGER
# =========================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, List[WebSocket]]] = {}

    async def connect(
        self,
        room_id: int,
        user_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}

        if user_id not in self.active_connections[room_id]:
            self.active_connections[room_id][user_id] = []

        self.active_connections[room_id][user_id].append(websocket)

    def disconnect(
        self,
        room_id: int,
        user_id: int,
        websocket: WebSocket
    ):
        if room_id not in self.active_connections:
            return

        if user_id not in self.active_connections[room_id]:
            return

        if websocket in self.active_connections[room_id][user_id]:
            self.active_connections[room_id][user_id].remove(websocket)

        if not self.active_connections[room_id][user_id]:
            del self.active_connections[room_id][user_id]

        if not self.active_connections[room_id]:
            del self.active_connections[room_id]

    async def broadcast_to_room(
        self,
        room_id: int,
        message_data: dict
    ):
        if room_id not in self.active_connections:
            return

        for user_id, sockets in list(
            self.active_connections[room_id].items()
        ):
            for ws in list(sockets):
                try:
                    await ws.send_json(message_data)
                except Exception as e:
                    print(
                        f"WebSocket iletim hatası "
                        f"(User #{user_id}): {e}"
                    )
                    self.disconnect(
                        room_id,
                        user_id,
                        ws
                    )


manager = ConnectionManager()


# =========================================================================
# 2. WEBSOCKET ENDPOINT
# =========================================================================

@router.websocket("/ws/{room_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    room_id: int,
    user_id: int = Query(...),
    token: Optional[str] = Query(None)
):
    """
    Gerçek zamanlı sohbet WebSocket endpoint'i.

    Kullanıcının JWT'si doğrulanır ve ardından chat_rooms tablosundaki
    client_id / expert_id üzerinden oda erişimi kontrol edilir.
    """

    authenticated_user_id = await authenticate_websocket_user(
        websocket=websocket,
        requested_user_id=user_id,
        token=token
    )

    if authenticated_user_id is None:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION
        )
        return

    user_id = authenticated_user_id

    try:
        with db_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)

            cur.execute(
                """
                SELECT id
                FROM chat_rooms
                WHERE id = %s
                  AND (
                        client_id = %s
                        OR expert_id = %s
                      )
                """,
                (
                    room_id,
                    user_id,
                    user_id
                )
            )

            room = cur.fetchone()
            cur.close()

            if not room:
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION
                )
                return

    except Exception as e:
        print(f"WebSocket oda doğrulama hatası: {e}")

        await websocket.close(
            code=status.WS_1011_INTERNAL_ERROR
        )
        return

    await manager.connect(
        room_id,
        user_id,
        websocket
    )

    try:
        while True:
            data_raw = await websocket.receive_text()

            try:
                payload = json.loads(data_raw)

                if not isinstance(payload, dict):
                    payload = {
                        "message": str(payload)
                    }

            except json.JSONDecodeError:
                payload = {
                    "message": data_raw
                }

            message_text = (
                payload.get("message")
                or payload.get("message_text")
                or ""
            )

            message_text = str(message_text).strip()

            if not message_text:
                continue

            try:
                with db_connection() as conn:
                    cur = conn.cursor(
                        cursor_factory=RealDictCursor
                    )

                    cur.execute(
                        """
                        INSERT INTO chat_messages (
                            room_id,
                            sender_id,
                            message_text,
                            is_from_ai,
                            is_read,
                            created_at
                        )
                        VALUES (
                            %s,
                            %s,
                            %s,
                            FALSE,
                            FALSE,
                            NOW()
                        )
                        RETURNING id, created_at;
                        """,
                        (
                            room_id,
                            user_id,
                            message_text
                        )
                    )

                    new_msg = cur.fetchone()
                    conn.commit()

                    cur.execute(
                        """
                        SELECT first_name, last_name
                        FROM users
                        WHERE id = %s
                        """,
                        (user_id,)
                    )

                    sender = cur.fetchone()
                    cur.close()

                    if not new_msg:
                        continue

                    time_str = format_timestamp(
                        new_msg["created_at"]
                    )

                    event_payload = {
                        "type": "new_message",
                        "id": new_msg["id"],
                        "room_id": room_id,
                        "sender_id": user_id,
                        "sender_name": (
                            f"{sender['first_name']} "
                            f"{sender['last_name']}"
                        ).strip()
                        if sender
                        else f"Kullanıcı #{user_id}",
                        "content": message_text,
                        "message_text": message_text,
                        "timestamp": time_str
                    }

                    await manager.broadcast_to_room(
                        room_id,
                        event_payload
                    )

            except Exception as db_err:
                print(
                    f"WebSocket DB Kayıt Hatası: {db_err}"
                )

    except WebSocketDisconnect:
        manager.disconnect(
            room_id,
            user_id,
            websocket
        )

    except Exception as e:
        print(f"WebSocket Hatası: {e}")

        manager.disconnect(
            room_id,
            user_id,
            websocket
        )


# =========================================================================
# 3. REST API ENDPOINTS
# =========================================================================

# =========================================================================
# AVAILABLE CONTACTS
# =========================================================================

@router.get("/available-contacts")
@expert_router.get("/available-contacts")
async def get_available_contacts(
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Kullanıcının aktif abonelik veya aktif uzman-danışan ilişkisi üzerinden
    gerçekten mesajlaşabileceği kişileri listeler.
    """

    with db_connection() as conn:
        if not conn:
            raise HTTPException(
                status_code=500,
                detail="Veritabanı bağlantı hatası."
            )

        try:
            cur = conn.cursor(
                cursor_factory=RealDictCursor
            )

            cur.execute(
                """
                SELECT role
                FROM users
                WHERE id = %s
                """,
                (current_user_id,)
            )

            me = cur.fetchone()

            if not me:
                raise HTTPException(
                    status_code=404,
                    detail="Kullanıcı bulunamadı."
                )

            my_role = (
                me.get("role") or ""
            ).lower()

            expert_roles = get_expert_roles()

            # -------------------------------------------------------------
            # Uzman -> Aktif aboneliği olan danışanlar
            # -------------------------------------------------------------
            if my_role in expert_roles:

                query = """
                SELECT
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.role,
                    u.profile_photo,
                    MAX(s.end_date) AS max_subscription_end
                FROM users u
                JOIN specialist_subscriptions s
                    ON s.client_id = u.id
                WHERE s.specialist_id = %s
                  AND s.status = 'active'
                  AND (
                        s.end_date IS NULL
                        OR s.end_date >= NOW()
                      )
                GROUP BY
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.role,
                    u.profile_photo
                ORDER BY u.first_name ASC;
                """

                cur.execute(
                    query,
                    (current_user_id,)
                )

            # -------------------------------------------------------------
            # Danışan -> Aktif aboneliği olan uzmanlar
            # -------------------------------------------------------------
            else:

                query = """
                SELECT
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.role,
                    u.profile_photo,
                    MAX(s.end_date) AS max_subscription_end
                FROM users u
                JOIN specialist_subscriptions s
                    ON s.specialist_id = u.id
                WHERE s.client_id = %s
                  AND s.status = 'active'
                  AND (
                        s.end_date IS NULL
                        OR s.end_date >= NOW()
                      )
                GROUP BY
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.role,
                    u.profile_photo
                ORDER BY u.first_name ASC;
                """

                cur.execute(
                    query,
                    (current_user_id,)
                )

            contacts = cur.fetchall()
            cur.close()

            formatted_contacts = []

            for c in contacts:
                formatted_contacts.append({
                    "id": c["id"],
                    "first_name": c["first_name"],
                    "last_name": c["last_name"],
                    "name": (
                        f"{c['first_name']} "
                        f"{c['last_name']}"
                    ).strip(),
                    "role": c["role"],
                    "avatar": resolve_avatar_url(
                        c["profile_photo"]
                    ),
                    "expires_at": (
                        c["max_subscription_end"].strftime(
                            "%Y-%m-%d"
                        )
                        if c.get("max_subscription_end")
                        else None
                    )
                })

            return {
                "status": "success",
                "contacts": formatted_contacts
            }

        except HTTPException:
            raise

        except Exception as e:
            print(
                f"Mesajlaşılabilir kişiler yüklenemedi: {e}"
            )

            raise HTTPException(
                status_code=500,
                detail="Kişiler yüklenemedi."
            )


# =========================================================================
# CHAT LIST
# =========================================================================

@router.get("/chats")
@expert_router.get("/chats")
async def get_user_chats(
    current_user_id: int = Depends(get_current_user_id),
):
    with db_connection() as conn:
        if not conn:
            raise HTTPException(
                status_code=500,
                detail="Veritabanı bağlantı hatası."
            )

        try:
            cur = conn.cursor(
                cursor_factory=RealDictCursor
            )

            cur.execute(
                """
                SELECT
                    cr.id AS chat_id,
                    u.id AS counterpart_id,
                    u.first_name,
                    u.last_name,
                    u.role AS counterpart_role,
                    u.profile_photo,
                    COALESCE(
                        lm.message_text,
                        'Henüz mesaj yok.'
                    ) AS last_message,
                    COALESCE(
                        lm.sent_at,
                        cr.created_at
                    ) AS last_message_time,
                    (
                        SELECT COUNT(*)
                        FROM chat_messages cm
                        WHERE cm.room_id = cr.id
                          AND cm.is_read = FALSE
                          AND cm.sender_id != %s
                    ) AS unread_count
                FROM chat_rooms cr
                JOIN users u ON (
                    (
                        cr.client_id = u.id
                        AND cr.expert_id = %s
                    )
                    OR
                    (
                        cr.expert_id = u.id
                        AND cr.client_id = %s
                    )
                )
                LEFT JOIN LATERAL (
                    SELECT
                        message_text,
                        created_at AS sent_at
                    FROM chat_messages
                    WHERE room_id = cr.id
                    ORDER BY created_at DESC
                    LIMIT 1
                ) lm ON TRUE
                WHERE (
                    cr.client_id = %s
                    OR cr.expert_id = %s
                )
                AND (
                    cr.is_ai_chat = FALSE
                    OR cr.is_ai_chat IS NULL
                )
                ORDER BY last_message_time DESC;
                """,
                (
                    current_user_id,
                    current_user_id,
                    current_user_id,
                    current_user_id,
                    current_user_id
                )
            )

            db_chats = cur.fetchall()
            chats_list = []

            for row in db_chats:
                raw_role = (
                    row.get("counterpart_role")
                    or "Danışan"
                ).lower()

                if raw_role in [
                    "client",
                    "danisan"
                ]:
                    role_text = "Danışan"
                elif raw_role in get_expert_roles():
                    role_text = "Uzman Danışman"
                else:
                    role_text = (
                        row.get("counterpart_role")
                        or "Danışan"
                    )

                chats_list.append({
                    "chat_id": row["chat_id"],
                    "counterpart": {
                        "id": row["counterpart_id"],
                        "name": (
                            f"{row['first_name']} "
                            f"{row['last_name']}"
                        ).strip(),
                        "role": role_text,
                        "avatar": resolve_avatar_url(
                            row["profile_photo"]
                        )
                    },
                    "last_message": row["last_message"],
                    "unread_count": int(
                        row["unread_count"]
                    ),
                    "updated_at": (
                        row["last_message_time"].isoformat()
                        if row["last_message_time"]
                        else None
                    )
                })

            cur.close()

            return {
                "status": "success",
                "chats": chats_list
            }

        except Exception as e:
            print(
                f"Chat Listesi Hatası: {e}"
            )

            raise HTTPException(
                status_code=500,
                detail="Sohbetler yüklenemedi."
            )


# =========================================================================
# CHAT HISTORY
# =========================================================================

@router.get("/rooms/{room_id}")
@expert_router.get("/rooms/{room_id}")
async def get_chat_history(
    room_id: int,
    current_user_id: int = Depends(get_current_user_id),
):
    with db_connection() as conn:
        if not conn:
            raise HTTPException(
                status_code=500,
                detail="Veritabanı bağlantı hatası."
            )

        try:
            cur = conn.cursor(
                cursor_factory=RealDictCursor
            )

            cur.execute(
                """
                SELECT id
                FROM chat_rooms
                WHERE id = %s
                  AND (
                        client_id = %s
                        OR expert_id = %s
                      )
                """,
                (
                    room_id,
                    current_user_id,
                    current_user_id
                )
            )

            if not cur.fetchone():
                raise HTTPException(
                    status_code=403,
                    detail="Bu sohbete erişim yetkiniz yok."
                )

            cur.execute(
                """
                UPDATE chat_messages
                SET is_read = TRUE
                WHERE room_id = %s
                  AND sender_id != %s;
                """,
                (
                    room_id,
                    current_user_id
                )
            )

            conn.commit()

            cur.execute(
                """
                SELECT
                    cm.id,
                    cm.sender_id,
                    cm.message_text,
                    cm.created_at,
                    u.first_name,
                    u.last_name
                FROM chat_messages cm
                JOIN users u
                    ON cm.sender_id = u.id
                WHERE cm.room_id = %s
                ORDER BY cm.created_at ASC;
                """,
                (room_id,)
            )

            db_messages = cur.fetchall()
            messages_list = []

            for m in db_messages:
                time_str = format_timestamp(
                    m["created_at"]
                )

                messages_list.append({
                    "id": m["id"],
                    "sender_id": m["sender_id"],
                    "sender_name": (
                        f"{m['first_name']} "
                        f"{m['last_name']}"
                    ).strip(),
                    "content": m["message_text"],
                    "message_text": m["message_text"],
                    "timestamp": time_str,
                    "is_me": (
                        int(m["sender_id"])
                        == current_user_id
                    )
                })

            cur.close()

            return {
                "status": "success",
                "room_id": room_id,
                "messages": messages_list
            }

        except HTTPException:
            raise

        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass

            print(
                f"Geçmiş Mesaj Hatası: {e}"
            )

            raise HTTPException(
                status_code=500,
                detail="Mesaj geçmişi yüklenemedi."
            )


# =========================================================================
# SEND MESSAGE - REST
# =========================================================================

@router.post("/rooms/{room_id}/send")
@expert_router.post("/rooms/{room_id}/send")
async def send_message_rest(
    room_id: int,
    payload: dict = Body(...),
    current_user_id: int = Depends(get_current_user_id),
):
    message_text = (
        payload.get("message")
        or payload.get("message_text")
        or ""
    )

    message_text = str(message_text).strip()

    if not message_text:
        raise HTTPException(
            status_code=400,
            detail="Mesaj metni boş olamaz."
        )

    with db_connection() as conn:
        if not conn:
            raise HTTPException(
                status_code=500,
                detail="Veritabanı bağlantı hatası."
            )

        try:
            cur = conn.cursor(
                cursor_factory=RealDictCursor
            )

            cur.execute(
                """
                SELECT id
                FROM chat_rooms
                WHERE id = %s
                  AND (
                        client_id = %s
                        OR expert_id = %s
                      )
                """,
                (
                    room_id,
                    current_user_id,
                    current_user_id
                )
            )

            if not cur.fetchone():
                raise HTTPException(
                    status_code=403,
                    detail=(
                        "Bu sohbete mesaj gönderme "
                        "yetkiniz yok."
                    )
                )

            cur.execute(
                """
                INSERT INTO chat_messages (
                    room_id,
                    sender_id,
                    message_text,
                    is_from_ai,
                    is_read,
                    created_at
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    FALSE,
                    FALSE,
                    NOW()
                )
                RETURNING id, created_at;
                """,
                (
                    room_id,
                    current_user_id,
                    message_text
                )
            )

            new_msg = cur.fetchone()
            conn.commit()

            if not new_msg:
                raise HTTPException(
                    status_code=500,
                    detail="Mesaj kaydı oluşturulamadı."
                )

            cur.execute(
                """
                SELECT first_name, last_name
                FROM users
                WHERE id = %s
                """,
                (current_user_id,)
            )

            sender = cur.fetchone()
            cur.close()

            time_str = format_timestamp(
                new_msg["created_at"]
            )

            event_payload = {
                "type": "new_message",
                "id": new_msg["id"],
                "room_id": room_id,
                "sender_id": current_user_id,
                "sender_name": (
                    f"{sender['first_name']} "
                    f"{sender['last_name']}"
                ).strip()
                if sender
                else f"Kullanıcı #{current_user_id}",
                "content": message_text,
                "message_text": message_text,
                "timestamp": time_str
            }

            await manager.broadcast_to_room(
                room_id,
                event_payload
            )

            return {
                "status": "success",
                "message_id": new_msg["id"],
                "timestamp": time_str,
                "content": message_text
            }

        except HTTPException:
            raise

        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass

            print(
                f"REST Mesaj Gönderme Hatası: {e}"
            )

            raise HTTPException(
                status_code=500,
                detail="Mesaj gönderilemedi."
            )


# =========================================================================
# INITIATE CHAT
# =========================================================================

@router.post("/initiate")
@expert_router.post("/initiate")
async def initiate_chat(
    payload: dict = Body(...),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Seçilen kişi ile sohbet başlatır veya var olan odayı döndürür.

    Kullanıcı sadece aktif uzman-danışan abonelik ilişkisi bulunan
    kişiyle sohbet başlatabilir.
    """
    target_id = (
        payload.get("professional_id")
        or payload.get("client_id")
        or payload.get("counterpart_id")
        or payload.get("target_id")
    )

    if not target_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Sohbet başlatılacak kullanıcı "
                "seçimi zorunludur."
            )
        )

    try:
        target_id = int(target_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz kullanıcı ID."
        )

    if current_user_id == target_id:
        raise HTTPException(
            status_code=400,
            detail="Kendinizle sohbet başlatamazsınız."
        )

    with db_connection() as conn:
        if not conn:
            raise HTTPException(
                status_code=500,
                detail="Veritabanı bağlantı hatası."
            )

        try:
            cur = conn.cursor(
                cursor_factory=RealDictCursor
            )

            # -------------------------------------------------------------
            # Hedef kullanıcı
            # -------------------------------------------------------------

            cur.execute(
                """
                SELECT
                    id,
                    role
                FROM users
                WHERE id = %s
                """,
                (target_id,)
            )

            target_user = cur.fetchone()

            if not target_user:
                raise HTTPException(
                    status_code=404,
                    detail="Seçilen kullanıcı bulunamadı."
                )

            # -------------------------------------------------------------
            # Mevcut kullanıcı
            # -------------------------------------------------------------

            cur.execute(
                """
                SELECT
                    id,
                    role
                FROM users
                WHERE id = %s
                """,
                (current_user_id,)
            )

            me_user = cur.fetchone()

            if not me_user:
                raise HTTPException(
                    status_code=404,
                    detail="Oturum sahibi kullanıcı bulunamadı."
                )

            me_role = (
                me_user.get("role") or ""
            ).lower()

            target_role = (
                target_user.get("role") or ""
            ).lower()

            expert_roles = get_expert_roles()

            # -------------------------------------------------------------
            # Client / Expert eşleşmesi
            # -------------------------------------------------------------

            if me_role in expert_roles:
                professional_id = current_user_id
                client_id = target_id

                # Uzman -> Danışan aktif abonelik kontrolü
                cur.execute(
                    """
                    SELECT id
                    FROM specialist_subscriptions
                    WHERE specialist_id = %s
                      AND client_id = %s
                      AND status = 'active'
                      AND (
                            end_date IS NULL
                            OR end_date >= NOW()
                          )
                    ORDER BY end_date DESC NULLS LAST
                    LIMIT 1
                    """,
                    (
                        current_user_id,
                        target_id
                    )
                )

            elif target_role in expert_roles:
                professional_id = target_id
                client_id = current_user_id

                # Danışan -> Uzman aktif abonelik kontrolü
                cur.execute(
                    """
                    SELECT id
                    FROM specialist_subscriptions
                    WHERE specialist_id = %s
                      AND client_id = %s
                      AND status = 'active'
                      AND (
                            end_date IS NULL
                            OR end_date >= NOW()
                          )
                    ORDER BY end_date DESC NULLS LAST
                    LIMIT 1
                    """,
                    (
                        target_id,
                        current_user_id
                    )
                )

            else:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Sohbet yalnızca danışan ve "
                        "uzman arasında başlatılabilir."
                    )
                )

            subscription = cur.fetchone()

            if not subscription:
                raise HTTPException(
                    status_code=403,
                    detail=(
                        "Bu kullanıcıyla mesajlaşmak için "
                        "aktif bir abonelik veya danışmanlık "
                        "ilişkisi bulunmuyor."
                    )
                )

            # -------------------------------------------------------------
            # Var olan odayı bul
            # -------------------------------------------------------------

            cur.execute(
                """
                SELECT id
                FROM chat_rooms
                WHERE client_id = %s
                  AND expert_id = %s
                  AND (
                        is_ai_chat = FALSE
                        OR is_ai_chat IS NULL
                      )
                ORDER BY id ASC
                LIMIT 1
                """,
                (
                    client_id,
                    professional_id
                )
            )

            room = cur.fetchone()

            if room:
                room_id = room["id"]

            else:
                # ---------------------------------------------------------
                # Yeni oda oluştur
                # ---------------------------------------------------------

                cur.execute(
                    """
                    INSERT INTO chat_rooms (
                        client_id,
                        expert_id,
                        is_ai_chat,
                        created_at
                    )
                    VALUES (
                        %s,
                        %s,
                        FALSE,
                        NOW()
                    )
                    RETURNING id
                    """,
                    (
                        client_id,
                        professional_id
                    )
                )

                room_id = cur.fetchone()["id"]
                conn.commit()

            cur.close()

            return {
                "status": "success",
                "room_id": room_id
            }

        except HTTPException:
            raise

        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass

            print(
                f"Sohbet başlatma hatası: {e}"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Sohbet başlatılamadı: "
                    f"{str(e)}"
                )
            )