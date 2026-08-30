from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import psycopg2
from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.extras import RealDictCursor

from backend import schemas
from backend.database import get_db_connection
from backend.routers.auth import get_current_user
from backend.routers.expertclient_detail import router as detail_router

router = APIRouter(prefix="/api/expert-clients", tags=["Expert Client Management"])
router.include_router(detail_router)


def _get_user_id(current_user: Any) -> Optional[int]:
    if isinstance(current_user, dict):
        value = current_user.get("id", current_user.get("user_id"))
    elif isinstance(current_user, (tuple, list)):
        value = current_user[0] if len(current_user) > 0 else None
    else:
        value = getattr(current_user, "id", None)
        if value is None:
            value = getattr(current_user, "user_id", None)
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _get_user_role(current_user: Any) -> Optional[str]:
    if isinstance(current_user, dict):
        return current_user.get("role")
    if isinstance(current_user, (tuple, list)):
        return current_user[10] if len(current_user) > 10 else None
    return getattr(current_user, "role", None)


def _get_authorized_specialist_ids(cursor, current_user: Any, requested_specialist_id: int) -> List[int]:
    """
    Kullanıcının token bilgisi ile istek yapılan specialist_id'yi doğrular.
    Hem 'users.id' hem de 'specialist_profiles.id' değerlerini içeren bir liste döndürür.
    """
    user_id = _get_user_id(current_user)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçerli kullanıcı kimliği bulunamadı.")
    
    role = _get_user_role(current_user)
    if role not in ("trainer", "dietitian"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için uzman yetkisi bulunmamaktadır.")

    cursor.execute("""
        SELECT id, user_id
        FROM specialist_profiles
        WHERE user_id = %s OR id = %s
        LIMIT 1
    """, (user_id, requested_specialist_id))
    profile = cursor.fetchone()

    # İlgili uzmanın hem profil ID'sini hem de User ID'sini kapsayacak dinamik küme
    target_ids = {user_id, requested_specialist_id}
    if profile:
        if profile.get("id") is not None:
            target_ids.add(int(profile["id"]))
        if profile.get("user_id") is not None:
            target_ids.add(int(profile["user_id"]))

    return list(target_ids)


def _get_authorized_client(cursor, specialist_ids: List[int], client_id: int) -> bool:
    cursor.execute("""
        SELECT 1
        FROM specialist_subscriptions
        WHERE specialist_id = ANY(%s::int[])
          AND client_id = %s
          AND LOWER(TRIM(status)) IN ('active', 'pending', 'aktif', 'bekliyor')
        LIMIT 1
    """, (specialist_ids, client_id))
    return cursor.fetchone() is not None


@router.get("/dashboard/{specialist_id}")
def get_expert_dashboard(specialist_id: int, conn=Depends(get_db_connection), current_user=Depends(get_current_user)):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_ids = _get_authorized_specialist_ids(cursor, current_user, specialist_id)
            
            cursor.execute("""
                SELECT 
                    s.id AS subscription_id,
                    s.client_id AS id,
                    s.client_id,
                    s.specialist_id,
                    s.package_name AS active_package,
                    s.goal,
                    s.program_name AS raw_program_name,
                    s.start_date,
                    s.end_date,
                    s.status,
                    GREATEST(0, EXTRACT(DAY FROM (COALESCE(s.end_date, NOW()) - NOW()))::INT) AS package_days_left,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    COALESCE(NULLIF(u.profile_photo, ''), '') AS avatar,
                    u.age,
                    u.gender,
                    u.height,
                    u.weight AS current_weight,
                    u.target_kcal AS daily_calories
                FROM specialist_subscriptions s
                JOIN users u ON s.client_id = u.id
                WHERE s.specialist_id = ANY(%s::int[])
                  AND LOWER(TRIM(s.status)) IN ('active', 'aktif')
                ORDER BY s.updated_at DESC
            """, (specialist_ids,))
            raw_active_clients = cursor.fetchall() or []
            
            active_clients = []
            seen_client_ids = set()
            for client in raw_active_clients:
                client_id = client["client_id"]
                if client_id not in seen_client_ids:
                    seen_client_ids.add(client_id)
                    active_clients.append(client)

            for client in active_clients:
                client_id = client["client_id"]
                assigned_progs = []

                # Diyet Programları Sorgusu
                try:
                    cursor.execute("SAVEPOINT diet_sp")
                    cursor.execute("""
                        SELECT 
                            COALESCE(
                                dt.title, 
                                np.program_details->>'title', 
                                np.program_details->>'name', 
                                'Diyet Planı'
                            ) AS title
                        FROM nutrition_programs np
                        LEFT JOIN diet_templates dt ON np.diet_template_id = dt.id
                        WHERE np.client_id = %s
                    """, (client_id,))
                    diet_rows = cursor.fetchall() or []
                    cursor.execute("RELEASE SAVEPOINT diet_sp")
                    for d_row in diet_rows:
                        title = d_row.get("title")
                        if title and str(title).strip():
                            assigned_progs.append(str(title).strip())
                except Exception:
                    try:
                        cursor.execute("ROLLBACK TO SAVEPOINT diet_sp")
                    except Exception:
                        pass

                # Antrenman Programları Sorgusu
                try:
                    cursor.execute("SAVEPOINT workout_sp")
                    cursor.execute("""
                        SELECT 
                            COALESCE(
                                wt.name, 
                                wp.program_details->>'template_name', 
                                wp.program_details->>'title', 
                                'Antrenman Programı'
                            ) AS title
                        FROM workout_programs wp
                        LEFT JOIN workout_templates wt ON wp.template_id = wt.id
                        WHERE wp.client_id = %s
                    """, (client_id,))
                    workout_rows = cursor.fetchall() or []
                    cursor.execute("RELEASE SAVEPOINT workout_sp")
                    for w_row in workout_rows:
                        title = w_row.get("title")
                        if title and str(title).strip():
                            assigned_progs.append(str(title).strip())
                except Exception:
                    try:
                        cursor.execute("ROLLBACK TO SAVEPOINT workout_sp")
                    except Exception:
                        pass

                raw_progs = client.get("raw_program_name")
                if raw_progs:
                    if isinstance(raw_progs, list):
                        for item in raw_progs:
                            if item and str(item).strip() != "Henüz Program Atanmadı":
                                assigned_progs.append(str(item).strip())
                    elif isinstance(raw_progs, str) and raw_progs.strip() != "Henüz Program Atanmadı":
                        assigned_progs.append(raw_progs.strip())

                unique_programs = list(dict.fromkeys(assigned_progs))
                client["assigned_programs"] = unique_programs
                client["program_name"] = unique_programs if unique_programs else ["Henüz Program Atanmadı"]
                client["active_packages"] = [client["active_package"]] if client.get("active_package") else ["Aktif Paket"]

            cursor.execute("""
                SELECT 
                    s.id AS id,
                    s.id AS request_id,
                    s.client_id,
                    s.package_name AS requested_package,
                    s.goal,
                    COALESCE(s.request_message, '') AS message,
                    TO_CHAR(s.created_at, 'YYYY-MM-DD HH24:MI') AS request_date,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    COALESCE(NULLIF(u.profile_photo, ''), '') AS avatar,
                    u.age,
                    u.gender,
                    u.height,
                    u.weight
                FROM specialist_subscriptions s
                JOIN users u ON s.client_id = u.id
                WHERE s.specialist_id = ANY(%s::int[])
                  AND LOWER(TRIM(s.status)) IN ('pending', 'bekliyor')
                ORDER BY s.created_at DESC
            """, (specialist_ids,))
            pending_requests = cursor.fetchall() or []

            return {
                "active_clients": active_clients,
                "pending_requests": pending_requests,
                "counts": {
                    "active": len(active_clients),
                    "pending": len(pending_requests)
                }
            }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Danışan paneli verileri çekilemedi: {str(e)}"
        )


@router.get("/{client_id}/quick-detail")
def get_client_quick_detail(client_id: int, conn=Depends(get_db_connection), current_user=Depends(get_current_user)):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_ids = _get_authorized_specialist_ids(cursor, current_user, 0)
            if not _get_authorized_client(cursor, specialist_ids, client_id):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu danışana erişim yetkiniz yok.")

            cursor.execute("""
                SELECT 
                    u.id AS client_id,
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    u.age,
                    u.gender,
                    u.height,
                    u.weight,
                    u.target_kcal,
                    COALESCE(NULLIF(u.profile_photo, ''), '') AS avatar
                FROM users u
                WHERE u.id = %s
                LIMIT 1
            """, (client_id,))
            client = cursor.fetchone()
            if not client:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Danışan bulunamadı.")
            return client
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Hızlı detay verisi alınamadı: {str(e)}")


@router.post("/requests/action")
def process_subscription_request(payload: schemas.SubscriptionActionRequest, conn=Depends(get_db_connection), current_user=Depends(get_current_user)):
    if payload.action not in ("accept", "reject"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz işlem. 'accept' veya 'reject' seçilmelidir.")
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_ids = _get_authorized_specialist_ids(cursor, current_user, 0)

            if payload.action == "accept":
                package_days = getattr(payload, "package_days", None)
                package_days = int(package_days) if package_days is not None else 90
                if package_days < 1 or package_days > 3650:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz abonelik süresi.")
                end_date = datetime.now() + timedelta(days=package_days)
                cursor.execute("""
                    UPDATE specialist_subscriptions
                    SET status = 'active',
                        start_date = NOW(),
                        end_date = %s,
                        updated_at = NOW()
                    WHERE id = %s
                      AND specialist_id = ANY(%s::int[])
                      AND LOWER(TRIM(status)) IN ('pending', 'bekliyor')
                    RETURNING id, client_id, specialist_id
                """, (end_date, payload.request_id, specialist_ids))
            else:
                cursor.execute("""
                    UPDATE specialist_subscriptions
                    SET status = 'rejected',
                        updated_at = NOW()
                    WHERE id = %s
                      AND specialist_id = ANY(%s::int[])
                      AND LOWER(TRIM(status)) IN ('pending', 'bekliyor')
                    RETURNING id, client_id, specialist_id
                """, (payload.request_id, specialist_ids))

            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Başvuru bulunamadı veya bu başvuru üzerinde işlem yetkiniz yok.")
            conn.commit()
            return {
                "status": "success",
                "message": f"Başvuru başarıyla {'kabul edildi' if payload.action == 'accept' else 'reddedildi'}.",
                "data": result
            }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Başvuru işlenirken hata oluştu: {str(e)}")