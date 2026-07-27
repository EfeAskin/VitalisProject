from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# ⭐ Import Yolları Proje Dizilimine Göre Düzeltildi
from backend.database import get_db_connection
from backend.routers.auth import get_current_user

router = APIRouter(
    prefix="/api/water",
    tags=["Water Engine"]
)

# --- ZAMAN DİLİMİ AYARI (GMT+3 / Türkiye Saati) ---
TURKEY_TZ = timezone(timedelta(hours=3))


def get_turkey_date():
    """Türkiye saatine (GMT+3) göre bugünün sadece tarihini (YYYY-MM-DD) döner."""
    return datetime.now(TURKEY_TZ).date()


def get_or_create_today_water_log(user_id: int, conn):
    """
    Kullanıcının bugünkü (GMT+3) su kaydı var mı kontrol eder.
    Gece 12 geçildiyse veya kayıt yoksa eski hedefini koruyarak 0.0L ile YENİ SATIR açar.
    Geçmiş günlerin verilerine kesinlikle dokunmaz.
    """
    today = get_turkey_date()
    
    with conn.cursor() as cur:
        # 1. Bugünün kaydı var mı?
        cur.execute("""
            SELECT id, user_id, water_target, water_consumed, log_date 
            FROM water_logs 
            WHERE user_id = %s AND log_date = %s
        """, (user_id, today))
        log = cur.fetchone()
        
        if log:
            return log
        
        # 2. Bugün kaydı yoksa, kullanıcının en son belirlenen su hedefini bul
        cur.execute("""
            SELECT water_target 
            FROM water_logs 
            WHERE user_id = %s 
            ORDER BY log_date DESC 
            LIMIT 1
        """, (user_id,))
        last_log = cur.fetchone()
        
        target = 2.5  # Varsayılan standart hedef
        if last_log:
            target_val = last_log.get("water_target") if isinstance(last_log, dict) or hasattr(last_log, "get") else last_log[0]
            if target_val:
                target = float(target_val)

        # 3. Bugünün tarihine 0.0L tüketim ile yeni satır aç
        cur.execute("""
            INSERT INTO water_logs (user_id, water_target, water_consumed, log_date)
            VALUES (%s, %s, 0.0, %s)
            RETURNING id, user_id, water_target, water_consumed, log_date
        """, (user_id, target, today))
        
        new_log = cur.fetchone()
        conn.commit()
        return new_log


# --- PYDANTIC INPUT MODELLERİ ---

class WaterUpdateInput(BaseModel):
    amount: float  # Güncellenecek toplam tüketilen su miktarı (Litre)

class WaterTargetInput(BaseModel):
    target: float  # Yeni su hedefi (Litre)


# --- ENDPOINT ROTALARI ---

@router.get("/today")
def get_today_water(current_user = Depends(get_current_user), conn = Depends(get_db_connection)):
    """Kullanıcının bugünkü su durumunu getirir. Yeni günse otomatik yeni satır açar."""
    user_id = current_user.get("id") if isinstance(current_user, dict) or hasattr(current_user, "get") else current_user[0]
    log = get_or_create_today_water_log(user_id, conn)
    
    consumed = log.get("water_consumed") if isinstance(log, dict) or hasattr(log, "get") else log[3]
    target = log.get("water_target") if isinstance(log, dict) or hasattr(log, "get") else log[2]
    log_date = log.get("log_date") if isinstance(log, dict) or hasattr(log, "get") else log[4]
    
    return {
        "status": "success",
        "water_consumed": float(consumed or 0.0),
        "water_target": float(target or 2.5),
        "log_date": str(log_date)
    }


@router.post("/update")
def update_water_consumed(data: WaterUpdateInput, current_user = Depends(get_current_user), conn = Depends(get_db_connection)):
    """Bugünün su tüketim miktarını Neon DB üzerinde günceller."""
    user_id = current_user.get("id") if isinstance(current_user, dict) or hasattr(current_user, "get") else current_user[0]
    today = get_turkey_date()
    
    get_or_create_today_water_log(user_id, conn)
    
    # 0L ile 10L arasında güvenli değer kontrolü
    new_consumed = round(max(0.0, min(data.amount, 10.0)), 2)
    
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE water_logs 
            SET water_consumed = %s 
            WHERE user_id = %s AND log_date = %s
            RETURNING water_consumed, water_target
        """, (new_consumed, user_id, today))
        updated = cur.fetchone()
        conn.commit()
        
        consumed = updated.get("water_consumed") if isinstance(updated, dict) or hasattr(updated, "get") else updated[0]
        target = updated.get("water_target") if isinstance(updated, dict) or hasattr(updated, "get") else updated[1]
        
        return {
            "status": "success",
            "water_consumed": float(consumed),
            "water_target": float(target)
        }


@router.post("/reset")
def reset_today_water(current_user = Depends(get_current_user), conn = Depends(get_db_connection)):
    """Bugünün su tüketimini sıfırlar (0.0 Litre yapar)."""
    user_id = current_user.get("id") if isinstance(current_user, dict) or hasattr(current_user, "get") else current_user[0]
    today = get_turkey_date()
    
    get_or_create_today_water_log(user_id, conn)
    
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE water_logs 
            SET water_consumed = 0.0 
            WHERE user_id = %s AND log_date = %s
            RETURNING water_consumed, water_target
        """, (user_id, today))
        updated = cur.fetchone()
        conn.commit()
        
        target = updated.get("water_target") if isinstance(updated, dict) or hasattr(updated, "get") else updated[1]
        
        return {
            "status": "success",
            "water_consumed": 0.0,
            "water_target": float(target)
        }


@router.post("/set-target")
def set_water_target(data: WaterTargetInput, current_user = Depends(get_current_user), conn = Depends(get_db_connection)):
    """Su hedefini değiştirir ve bugünün kaydına anında yansıtır."""
    user_id = current_user.get("id") if isinstance(current_user, dict) or hasattr(current_user, "get") else current_user[0]
    today = get_turkey_date()
    
    get_or_create_today_water_log(user_id, conn)
    new_target = round(max(0.5, min(data.target, 8.0)), 2)
    
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE water_logs 
            SET water_target = %s 
            WHERE user_id = %s AND log_date = %s
        """, (new_target, user_id, today))
        conn.commit()
        
        return {
            "status": "success",
            "water_target": new_target
        }