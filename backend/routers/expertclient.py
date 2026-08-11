from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import psycopg2
from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.extras import RealDictCursor

from backend import schemas
from backend.database import get_db_connection
from backend.routers.expertclient_detail import router as detail_router

router = APIRouter(
    prefix="/api/expert-clients",
    tags=["Expert Client Management"]
)

# Child Router'ı (İç sayfa / detay rotalarını) ana router'a dahil ediyoruz
router.include_router(detail_router)


# ==============================================================================
# 1. DANIŞAN YÖNETİM MERKEZİ - DASHBOARD (Aktif Listeler & Gelen Başvurular)
# ==============================================================================
@router.get("/dashboard/{specialist_id}")
def get_expert_dashboard(specialist_id: int, conn=Depends(get_db_connection)):
    """
    Danışan Yönetim Merkezi ana ekranı için aktif danışanları 
    ve bekleyen (pending) başvuru isteklerini getirir.
    page.jsx ile %100 uyumludur.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 1.1 Aktif Danışanlar Listesi
            cursor.execute("""
                SELECT 
                    s.id AS subscription_id,
                    s.client_id AS id,
                    s.client_id,
                    s.package_name AS active_package,
                    s.goal,
                    s.program_name,
                    s.start_date,
                    s.end_date,
                    s.status,
                    GREATEST(0, EXTRACT(DAY FROM (s.end_date - NOW()))::INT) AS package_days_left,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    COALESCE(NULLIF(u.profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar,
                    u.age,
                    u.gender,
                    u.height,
                    u.weight AS current_weight,
                    u.target_kcal AS daily_calories
                FROM specialist_subscriptions s
                JOIN users u ON s.client_id = u.id
                WHERE s.specialist_id = %s AND s.status = 'active'
                ORDER BY s.updated_at DESC
            """, (specialist_id,))
            active_clients = cursor.fetchall()

            # 1.2 Bekleyen Başvuru İstekleri (Yeni İstekler Tab'ı)
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
                    COALESCE(NULLIF(u.profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar,
                    u.age,
                    u.gender,
                    u.height,
                    u.weight
                FROM specialist_subscriptions s
                JOIN users u ON s.client_id = u.id
                WHERE s.specialist_id = %s AND s.status = 'pending'
                ORDER BY s.created_at DESC
            """, (specialist_id,))
            pending_requests = cursor.fetchall()

            return {
                "active_clients": active_clients,
                "pending_requests": pending_requests,
                "counts": {
                    "active": len(active_clients),
                    "pending": len(pending_requests)
                }
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Danışan paneli verileri çekilemedi: {str(e)}"
        )


# ==============================================================================
# 2. HIZLI DETAY POP-UP ENDPOINT'İ
# ==============================================================================
@router.get("/{client_id}/quick-detail")
def get_client_quick_detail(client_id: int, conn=Depends(get_db_connection)):
    """
    Danışan kartındaki 'Hızlı Detay' butonuna tıklandığında açılan
    pop-up modal verilerini getirir.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    id AS client_id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    age,
                    gender,
                    height,
                    weight,
                    COALESCE(NULLIF(profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar
                FROM users
                WHERE id = %s
            """, (client_id,))
            client = cursor.fetchone()
            
            if not client:
                raise HTTPException(status_code=404, detail="Danışan bulunamadı.")
                
            return client
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hızlı detay verisi alınamadı: {str(e)}")


# ==============================================================================
# 3. BAŞVURU KABUL ET / REDDET
# ==============================================================================
@router.post("/requests/action")
def process_subscription_request(payload: schemas.SubscriptionActionRequest, conn=Depends(get_db_connection)):
    """
    Gelen yeni danışan başvurusunu kabul eder veya reddeder.
    page.jsx handleAcceptRequest ve handleRejectRequest ile tam uyumludur.
    """
    if payload.action not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Geçersiz işlem. 'accept' veya 'reject' seçilmelidir.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            if payload.action == "accept":
                package_days = payload.package_days if payload.package_days else 90
                end_date = datetime.now() + timedelta(days=package_days)
                
                cursor.execute("""
                    UPDATE specialist_subscriptions
                    SET status = 'active',
                        start_date = NOW(),
                        end_date = %s,
                        updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, client_id, specialist_id
                """, (end_date, payload.request_id))
            else:
                cursor.execute("""
                    UPDATE specialist_subscriptions
                    SET status = 'rejected',
                        updated_at = NOW()
                    WHERE id = %s
                    RETURNING id
                """, (payload.request_id,))

            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=404, detail="Başvuru kaydı bulunamadı.")

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
        raise HTTPException(status_code=500, detail=f"Başvuru işlenirken hata oluştu: {str(e)}")