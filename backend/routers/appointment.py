import traceback
from datetime import date, datetime, time, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.extras import RealDictCursor

from backend.database import get_db_connection
from backend.routers.auth import get_current_user
from backend.schemas import (
    AppointmentCreateByClient,
    AppointmentCreateByExpert,
    AppointmentLinkUpdate,
    AppointmentStatusUpdate,
)

router = APIRouter(
    prefix="/api/appointments",
    tags=["Appointments"],
)

# =========================================================
# CONSTANTS
# =========================================================

APPOINTMENT_DURATION_MINUTES = 45

ALLOWED_APPOINTMENT_TYPES = {
    "online",
    "in_person",
}

ALLOWED_APPOINTMENT_STATUSES = {
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
    "confirmed",
}


# =========================================================
# AUTH / AUTHORIZATION HELPERS
# =========================================================


def get_user_value(current_user, key, index=None):
    """get_current_user() dict veya tuple/list döndürebildiği için her iki yapıyı da destekler."""
    if isinstance(current_user, dict):
        return current_user.get(key)

    if hasattr(current_user, "get"):
        return current_user.get(key)

    if isinstance(current_user, (tuple, list)) and index is not None:
        if len(current_user) > index:
            return current_user[index]

    return None


def get_authenticated_user_id(current_user) -> int:
    """DB'den doğrulanmış kullanıcının gerçek user.id değerini döndürür."""
    user_id = get_user_value(current_user, "id", 0)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı kimliği",
        )

    try:
        return int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı kimliği",
        )


def get_authenticated_user_role(current_user):
    """Kullanıcının DB'den doğrulanmış rolünü döndürür."""
    return get_user_value(current_user, "role", 10)


def require_expert(current_user):
    """Vitalis OS uzman rolleri: trainer, dietitian"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulaması gerekli",
        )

    role = get_authenticated_user_role(current_user)

    if role not in ("trainer", "dietitian"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem yalnızca uzmanlar tarafından yapılabilir",
        )

    return current_user


def require_client(current_user):
    """Client rolü kontrolü."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulaması gerekli",
        )

    role = get_authenticated_user_role(current_user)

    if role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem yalnızca danışanlar tarafından yapılabilir",
        )

    return current_user


# =========================================================
# VALIDATION & DATE/TIME HELPERS
# =========================================================


def to_date_object(val) -> date:
    """Gelen date, datetime veya ISO string değerini güvenli şekilde date nesnesine çevirir."""
    if val is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Randevu tarihi zorunludur.",
        )
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    try:
        return date.fromisoformat(str(val))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Geçersiz randevu tarihi.",
        )


def validate_appointment_type(appointment_type: str):
    """Randevu türünün desteklenen türlerden biri olduğunu kontrol eder."""
    if appointment_type not in ALLOWED_APPOINTMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Geçersiz görüşme türü. online veya in_person olmalıdır.",
        )


def validate_appointment_date(appointment_date):
    """Randevu tarihinin geçmişte olmasını engeller."""
    appointment_day = to_date_object(appointment_date)
    if appointment_day < date.today():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Geçmiş bir tarihe randevu oluşturulamaz.",
        )
    return appointment_day


def normalize_time_slot(time_slot) -> str:
    """time_slot değerini HH:MM formatına getirir.

    '09:00 - 09:45', '09:00:00', '09:00' gibi girdileri destekler.
    """
    if time_slot is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Randevu saati zorunludur.",
        )

    value = str(time_slot).strip()

    if not value:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Randevu saati zorunludur.",
        )

    if "-" in value:
        value = value.split("-")[0].strip()

    try:
        if len(value) == 5:
            parsed = datetime.strptime(value, "%H:%M")
        elif len(value) == 8:
            parsed = datetime.strptime(value, "%H:%M:%S")
        else:
            raise ValueError
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Geçersiz saat formatı. Saat HH:MM formatında olmalıdır.",
        )

    return parsed.strftime("%H:%M")


def get_appointment_datetime(appointment_date, time_slot) -> datetime:
    """Tarih + saat bilgisini tek datetime değerine çevirir."""
    appointment_day = to_date_object(appointment_date)
    normalized_time = normalize_time_slot(time_slot)
    appointment_time = datetime.strptime(normalized_time, "%H:%M").time()
    return datetime.combine(appointment_day, appointment_time)


def validate_future_appointment(appointment_date, time_slot):
    """Randevunun yalnızca gelecekte olmasını sağlar."""
    validate_appointment_date(appointment_date)
    appointment_datetime = get_appointment_datetime(
        appointment_date, time_slot
    )
    if appointment_datetime <= datetime.now():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Geçmiş bir tarih veya saat için randevu oluşturulamaz.",
        )


def validate_optional_link(
    appointment_type, meeting_link=None, location_link=None
):
    """Online randevuda meeting_link, yüz yüze randevuda location_link doğrulaması."""
    validate_appointment_type(appointment_type)

    if appointment_type == "online" and location_link:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Online randevuda location_link kullanılamaz.",
        )

    if appointment_type == "in_person" and meeting_link:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Yüz yüze randevuda meeting_link kullanılamaz.",
        )


def validate_status(status_value):
    """Appointment status değerini kontrol eder."""
    if status_value not in ALLOWED_APPOINTMENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Geçersiz randevu durumu. "
                "pending, approved, rejected, cancelled, "
                "completed veya confirmed kullanılabilir."
            ),
        )


# =========================================================
# DB / APPOINTMENT CONFLICT HELPERS
# =========================================================


def check_appointment_conflict(
    cursor,
    expert_id: int,
    client_id: int,
    appointment_date,
    time_slot,
    exclude_appointment_id: Optional[int] = None,
):
    """Uzman veya danışanın aynı zaman aralığında başka aktif randevusu olup olmadığını kontrol eder."""
    app_date_obj = to_date_object(appointment_date)
    appointment_datetime = get_appointment_datetime(app_date_obj, time_slot)
    appointment_end = appointment_datetime + timedelta(
        minutes=APPOINTMENT_DURATION_MINUTES
    )

    query = """
        SELECT
            id,
            expert_id,
            client_id,
            appointment_date,
            time_slot,
            duration_minutes,
            status
        FROM appointments
        WHERE
            (
                expert_id = %s
                OR client_id = %s
            )
            AND status IN (
                'pending',
                'approved',
                'confirmed'
            )
            AND appointment_date = %s
    """
    params = [expert_id, client_id, app_date_obj]

    if exclude_appointment_id is not None:
        query += " AND id <> %s"
        params.append(exclude_appointment_id)

    query += " ORDER BY time_slot ASC;"

    cursor.execute(query, tuple(params))
    existing_appointments = cursor.fetchall()

    for existing in existing_appointments:
        existing_datetime = get_appointment_datetime(
            existing["appointment_date"],
            existing["time_slot"],
        )

        existing_duration = (
            existing.get("duration_minutes") or APPOINTMENT_DURATION_MINUTES
        )
        try:
            existing_duration = int(existing_duration)
        except (TypeError, ValueError):
            existing_duration = APPOINTMENT_DURATION_MINUTES

        existing_end = existing_datetime + timedelta(minutes=existing_duration)

        if (
            appointment_datetime < existing_end
            and appointment_end > existing_datetime
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Seçilen tarih ve saatte çakışan bir randevu bulunuyor.",
            )


# =========================================================
# 1. DANIŞAN: AKTİF UZMANLARINI GETİR
# =========================================================


@router.get("/client/experts")
def get_client_active_experts(current_user=Depends(get_current_user)):
    """Client'ın yalnızca aktif aboneliği bulunan uzmanlarını getirir."""
    current_user = require_client(current_user)
    client_id = get_authenticated_user_id(current_user)

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                ss.id AS subscription_id,
                ss.specialist_id AS expert_id,
                ss.package_name,
                ss.goal,
                ss.program_name,
                ss.start_date,
                ss.end_date,
                ss.status,
                u.id AS user_id,
                u.first_name,
                u.last_name,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                u.email,
                u.profile_photo,
                u.role,
                sp.title AS expert_title
            FROM specialist_subscriptions ss
            INNER JOIN users u ON u.id = ss.specialist_id
            LEFT JOIN specialist_profiles sp ON sp.user_id = ss.specialist_id
            WHERE ss.client_id = %s
              AND ss.status = 'active'
              AND u.role IN ('trainer', 'dietitian')
            ORDER BY ss.created_at DESC;
            """,
            (client_id,),
        )
        return cursor.fetchall()
    except HTTPException:
        raise
    except Exception:
        print("ERROR in /client/experts:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Aktif uzmanlar getirilemedi",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 2. DANIŞAN: RANDEVU TALEBİ OLUŞTUR
# =========================================================


@router.post("/client/create", status_code=status.HTTP_201_CREATED)
def create_appointment_by_client(
    payload: AppointmentCreateByClient,
    current_user=Depends(get_current_user),
):
    """Client kendi JWT / DB kimliği üzerinden randevu oluşturur."""
    current_user = require_client(current_user)
    client_id = get_authenticated_user_id(current_user)

    validate_appointment_type(payload.appointment_type)
    validate_future_appointment(payload.appointment_date, payload.time_slot)

    app_date_obj = to_date_object(payload.appointment_date)

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT id, role
            FROM users
            WHERE id = %s AND role IN ('trainer', 'dietitian')
            LIMIT 1;
            """,
            (payload.expert_id,),
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uzman bulunamadı",
            )

        cursor.execute(
            """
            SELECT id, client_id, specialist_id, status, package_name, goal, program_name, start_date, end_date
            FROM specialist_subscriptions
            WHERE client_id = %s AND specialist_id = %s AND status = 'active'
            ORDER BY created_at DESC
            LIMIT 1;
            """,
            (client_id, payload.expert_id),
        )
        subscription = cursor.fetchone()

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu uzmanla aktif bir aboneliğiniz bulunmuyor.",
            )

        if subscription.get("start_date"):
            start_date_obj = to_date_object(subscription["start_date"])
            if app_date_obj < start_date_obj:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Randevu abonelik başlangıç tarihinden önce olamaz.",
                )

        if subscription.get("end_date"):
            end_date_obj = to_date_object(subscription["end_date"])
            if app_date_obj > end_date_obj:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Randevu abonelik bitiş tarihinden sonra olamaz.",
                )

        check_appointment_conflict(
            cursor=cursor,
            expert_id=int(payload.expert_id),
            client_id=client_id,
            appointment_date=app_date_obj,
            time_slot=payload.time_slot,
        )

        cursor.execute(
            """
            INSERT INTO appointments
            (
                client_id, expert_id, title, appointment_date, time_slot,
                appointment_type, notes, status, created_by_role, duration_minutes
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending', 'client', %s)
            RETURNING *;
            """,
            (
                client_id,
                payload.expert_id,
                payload.title or "Birebir Görüşme",
                app_date_obj,
                normalize_time_slot(payload.time_slot),
                payload.appointment_type,
                payload.notes,
                APPOINTMENT_DURATION_MINUTES,
            ),
        )

        new_appointment = cursor.fetchone()
        conn.commit()

        return {
            "message": "Randevu talebi oluşturuldu",
            "appointment": new_appointment,
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception:
        if conn:
            conn.rollback()
        print("ERROR in /client/create:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Randevu oluşturulurken bir hata oluştu",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 3. DANIŞAN: KENDİ RANDEVULARINI LİSTELE
# =========================================================


@router.get("/client/{client_id}")
def get_client_appointments(
    client_id: int,
    current_user=Depends(get_current_user),
):
    """Client kendi randevularını listeler."""
    current_user = require_client(current_user)
    authenticated_client_id = get_authenticated_user_id(current_user)

    if client_id != authenticated_client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu danışanın randevularına erişim yetkiniz yok",
        )

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                a.*,
                u.first_name AS expert_first_name,
                u.last_name AS expert_last_name,
                CONCAT(u.first_name, ' ', u.last_name) AS expert_name,
                u.profile_photo AS expert_profile_photo,
                u.email AS expert_email,
                u.role AS expert_role,
                sp.title AS expert_title
            FROM appointments a
            LEFT JOIN users u ON a.expert_id = u.id
            LEFT JOIN specialist_profiles sp ON a.expert_id = sp.user_id
            WHERE a.client_id = %s
            ORDER BY a.appointment_date DESC, a.time_slot DESC, a.created_at DESC;
            """,
            (authenticated_client_id,),
        )
        return cursor.fetchall()
    except Exception:
        print("ERROR in /client/{client_id}:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Randevular getirilemedi",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 4. UZMAN: DOĞRUDAN SEANS PLANLA
# =========================================================


@router.post("/expert/create", status_code=status.HTTP_201_CREATED)
def create_appointment_by_expert(
    payload: AppointmentCreateByExpert,
    current_user=Depends(get_current_user),
):
    """Uzman doğrudan randevu planlar."""
    current_user = require_expert(current_user)
    expert_id = get_authenticated_user_id(current_user)

    validate_appointment_type(payload.appointment_type)
    validate_future_appointment(payload.appointment_date, payload.time_slot)
    validate_optional_link(
        payload.appointment_type,
        payload.meeting_link,
        payload.location_link,
    )

    app_date_obj = to_date_object(payload.appointment_date)

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                ss.id AS subscription_id, ss.client_id, ss.specialist_id,
                ss.package_name, ss.status, ss.goal, ss.program_name,
                ss.start_date, ss.end_date, u.first_name, u.last_name, u.email, u.profile_photo
            FROM specialist_subscriptions ss
            INNER JOIN users u ON u.id = ss.client_id
            WHERE ss.specialist_id = %s AND ss.client_id = %s AND ss.status = 'active' AND u.role = 'client'
            ORDER BY ss.created_at DESC
            LIMIT 1;
            """,
            (expert_id, payload.client_id),
        )
        client_subscription = cursor.fetchone()

        if not client_subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu danışanın sizinle aktif bir aboneliği bulunmuyor",
            )

        if client_subscription.get("start_date"):
            start_date_obj = to_date_object(client_subscription["start_date"])
            if app_date_obj < start_date_obj:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Randevu abonelik başlangıç tarihinden önce olamaz.",
                )

        if client_subscription.get("end_date"):
            end_date_obj = to_date_object(client_subscription["end_date"])
            if app_date_obj > end_date_obj:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Randevu abonelik bitiş tarihinden sonra olamaz.",
                )

        check_appointment_conflict(
            cursor=cursor,
            expert_id=expert_id,
            client_id=int(payload.client_id),
            appointment_date=app_date_obj,
            time_slot=payload.time_slot,
        )

        meeting_link = (
            payload.meeting_link
            if payload.appointment_type == "online"
            else None
        )
        location_link = (
            payload.location_link
            if payload.appointment_type == "in_person"
            else None
        )

        cursor.execute(
            """
            INSERT INTO appointments
            (
                client_id, expert_id, title, appointment_date, time_slot,
                appointment_type, notes, meeting_link, location_link,
                status, created_by_role, duration_minutes
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'approved', 'expert', %s)
            RETURNING *;
            """,
            (
                payload.client_id,
                expert_id,
                payload.title or "Uzman Tarafından Planlanan Seans",
                app_date_obj,
                normalize_time_slot(payload.time_slot),
                payload.appointment_type,
                payload.notes,
                meeting_link,
                location_link,
                APPOINTMENT_DURATION_MINUTES,
            ),
        )

        new_appointment = cursor.fetchone()
        conn.commit()

        return {
            "message": "Randevu başarıyla planlandı",
            "appointment": new_appointment,
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception:
        if conn:
            conn.rollback()
        print("ERROR in /expert/create:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Uzman randevusu oluşturulurken bir hata oluştu",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 5. UZMAN: AKTİF ABONELİĞİ OLAN DANIŞANLARI GETİR
# =========================================================


@router.get("/expert/clients")
def get_expert_active_clients(current_user=Depends(get_current_user)):
    """Giriş yapmış uzmanın yalnızca ACTIVE subscription sahibi danışanlarını getirir."""
    current_user = require_expert(current_user)
    specialist_id = get_authenticated_user_id(current_user)

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                ss.id AS subscription_id, ss.client_id, ss.specialist_id,
                ss.package_name, ss.status, ss.goal, ss.program_name,
                ss.start_date, ss.end_date, u.id AS user_id, u.first_name, u.last_name,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                u.email, u.phone, u.profile_photo, u.age, u.gender, u.height, u.weight
            FROM specialist_subscriptions ss
            INNER JOIN users u ON u.id = ss.client_id
            WHERE ss.specialist_id = %s AND ss.status = 'active' AND u.role = 'client'
            ORDER BY ss.created_at DESC;
            """,
            (specialist_id,),
        )
        return cursor.fetchall()
    except Exception:
        print("ERROR in /expert/clients:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Aktif danışanlar getirilemedi",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 6. UZMAN: KENDİ RANDEVULARINI LİSTELE
# =========================================================


@router.get("/expert/{expert_id}")
def get_expert_appointments(
    expert_id: int,
    current_user=Depends(get_current_user),
):
    """Uzman yalnızca kendi randevularını görebilir."""
    current_user = require_expert(current_user)
    authenticated_expert_id = get_authenticated_user_id(current_user)

    if expert_id != authenticated_expert_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu uzmanın randevularına erişim yetkiniz yok",
        )

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                a.*,
                u.id AS client_user_id,
                u.first_name,
                u.last_name,
                CONCAT(u.first_name, ' ', u.last_name) AS client_name,
                u.email AS client_email,
                u.profile_photo AS client_profile_photo
            FROM appointments a
            LEFT JOIN users u ON a.client_id = u.id
            WHERE a.expert_id = %s
            ORDER BY a.appointment_date DESC, a.time_slot DESC, a.created_at DESC;
            """,
            (authenticated_expert_id,),
        )
        return cursor.fetchall()
    except Exception:
        print("ERROR in /expert/{expert_id}:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Uzman randevuları getirilemedi",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 7. UZMAN: RANDEVU DURUMUNU GÜNCELLE
# =========================================================


@router.put("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    current_user=Depends(get_current_user),
):
    """Sadece randevunun bağlı olduğu uzman status ve rejection_reason değiştirebilir."""
    current_user = require_expert(current_user)
    expert_id = get_authenticated_user_id(current_user)

    validate_status(payload.status)

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT * FROM appointments
            WHERE id = %s AND expert_id = %s;
            """,
            (appointment_id, expert_id),
        )
        appointment = cursor.fetchone()

        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Randevu bulunamadı veya bu randevuya erişim yetkiniz yok",
            )

        meeting_link = appointment["meeting_link"]
        location_link = appointment["location_link"]

        if payload.meeting_link is not None:
            meeting_link = (
                payload.meeting_link.strip() if payload.meeting_link else None
            )

        if payload.location_link is not None:
            location_link = (
                payload.location_link.strip()
                if payload.location_link
                else None
            )

        validate_optional_link(
            appointment["appointment_type"],
            meeting_link,
            location_link,
        )

        rejection_reason = appointment.get("rejection_reason")
        if payload.status == "rejected":
            rejection_reason = (
                payload.rejection_reason.strip()
                if payload.rejection_reason
                else None
            )
        elif payload.status in ("approved", "confirmed"):
            rejection_reason = None

        if payload.status in ("rejected", "cancelled"):
            if payload.meeting_link is None:
                meeting_link = None
            if payload.location_link is None:
                location_link = None

        cursor.execute(
            """
            UPDATE appointments
            SET status = %s,
                meeting_link = %s,
                location_link = %s,
                rejection_reason = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND expert_id = %s
            RETURNING *;
            """,
            (
                payload.status,
                meeting_link,
                location_link,
                rejection_reason,
                appointment_id,
                expert_id,
            ),
        )

        updated_appointment = cursor.fetchone()

        if not updated_appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Randevu güncellenemedi",
            )

        conn.commit()

        return {
            "message": f"Randevu durumu '{payload.status}' olarak güncellendi",
            "appointment": updated_appointment,
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception:
        if conn:
            conn.rollback()
        print("ERROR in /{appointment_id}/status:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Randevu durumu güncellenirken bir hata oluştu",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 8. UZMAN: TOPLANTI / KONUM LİNKLERİNİ GÜNCELLE
# =========================================================


@router.put("/{appointment_id}/links")
def update_appointment_links(
    appointment_id: int,
    payload: AppointmentLinkUpdate,
    current_user=Depends(get_current_user),
):
    """Sadece randevunun bağlı olduğu uzman linkleri değiştirebilir."""
    current_user = require_expert(current_user)
    expert_id = get_authenticated_user_id(current_user)

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT id, appointment_type, meeting_link, location_link
            FROM appointments
            WHERE id = %s AND expert_id = %s;
            """,
            (appointment_id, expert_id),
        )
        appointment = cursor.fetchone()

        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Randevu bulunamadı veya bu randevuya erişim yetkiniz yok",
            )

        meeting_link = appointment["meeting_link"]
        location_link = appointment["location_link"]

        if payload.meeting_link is not None:
            meeting_link = (
                payload.meeting_link.strip() if payload.meeting_link else None
            )

        if payload.location_link is not None:
            location_link = (
                payload.location_link.strip()
                if payload.location_link
                else None
            )

        validate_optional_link(
            appointment["appointment_type"],
            meeting_link,
            location_link,
        )

        cursor.execute(
            """
            UPDATE appointments
            SET meeting_link = %s,
                location_link = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND expert_id = %s
            RETURNING *;
            """,
            (meeting_link, location_link, appointment_id, expert_id),
        )

        updated_appointment = cursor.fetchone()

        if not updated_appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Linkler güncellenemedi",
            )

        conn.commit()

        return {
            "message": "Linkler güncellendi",
            "appointment": updated_appointment,
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception:
        if conn:
            conn.rollback()
        print("ERROR in /{appointment_id}/links:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Linkler güncellenemedi",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()


# =========================================================
# 9. RANDEVU SİL
# =========================================================


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user=Depends(get_current_user),
):
    """Client veya Expert kendi yetkisindeki randevuyu silebilir."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulaması gerekli",
        )

    user_id = get_authenticated_user_id(current_user)
    user_role = get_authenticated_user_role(current_user)

    if user_role not in ("client", "trainer", "dietitian"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yetkiniz yok",
        )

    db = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = next(db)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        if user_role == "client":
            cursor.execute(
                """
                DELETE FROM appointments
                WHERE id = %s AND client_id = %s
                RETURNING id;
                """,
                (appointment_id, user_id),
            )
        else:
            cursor.execute(
                """
                DELETE FROM appointments
                WHERE id = %s AND expert_id = %s
                RETURNING id;
                """,
                (appointment_id, user_id),
            )

        deleted = cursor.fetchone()

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Randevu bulunamadı veya bu randevuyu silme yetkiniz yok",
            )

        conn.commit()

        return {
            "message": "Randevu başarıyla silindi",
            "id": appointment_id,
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception:
        if conn:
            conn.rollback()
        print("ERROR in delete /{appointment_id}:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Randevu silinirken bir hata oluştu",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        db.close()