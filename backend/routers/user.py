import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db_connection
from backend.schemas import User, BodyAnalysis, OnboardingAssessment
from datetime import datetime
from typing import List, Optional
import psycopg2.extras
import math
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/user",
    tags=["User & Analysis"]
)

class HistoryPointResponse(BaseModel):
    id: int
    name: str
    measured_at: datetime
    kilo: float
    yag: float
    lbm: float
    bmi: float
    bmr: int

    class Config:
        from_attributes = True

# ==========================================
# 1. KULLANICI PROFİLİNİ GETİR
# ==========================================
@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: int, conn=Depends(get_db_connection)):
    """Kullanıcının Neon DB üzerindeki profil bilgilerini ve dinamik profil resmini getirir."""
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("""
            SELECT 
                id, first_name, last_name, email, phone,
                age, height, weight, gender, profile_photo, role, created_at 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        
        # Profil fotoğrafı yoksa ad-soyad baş harflerinden UI-Avatar üretimi
        if not user.get("profile_photo") or not str(user.get("profile_photo")).strip():
            full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Kullanıcı"
            user["profile_photo"] = f"https://ui-avatars.com/api/?name={urllib.parse.quote(full_name)}&background=18231E&color=10B981&bold=true"
        
        if user.get("age") is None:
            user["age"] = 18
        if user.get("height") is None:
            user["height"] = 175.0
        if user.get("weight") is None:
            user["weight"] = 65.0
        if not user.get("gender"):
            user["gender"] = "Belirtilmedi"

        return user


# ==========================================
# 2. VÜCUT ANALİZİNİ GETİR (GEÇMİŞ / TREND)
# ==========================================
@router.get("/{user_id}/analysis/history", response_model=List[HistoryPointResponse])
def get_analysis_history(user_id: int, conn=Depends(get_db_connection)):
    """Kullanıcının geçmiş vücut analizlerini kronolojik sırayla döner."""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    ba.id,
                    COALESCE(ba.measured_at, CURRENT_TIMESTAMP) AS measured_at,
                    COALESCE(u.weight, 65.0) AS kilo,
                    COALESCE(ba.body_fat, 15.0) AS yag,
                    COALESCE(ba.lbm, 55.0) AS lbm,
                    COALESCE(ba.bmi, 21.2) AS bmi,
                    COALESCE(ba.bmr, 1600) AS bmr
                FROM body_analyses ba
                LEFT JOIN users u ON u.id = ba.user_id
                WHERE ba.user_id = %s
                ORDER BY ba.measured_at ASC
            """, (user_id,))
            rows = cur.fetchall()

            turkish_months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
                              "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
            
            result = []
            for row in rows:
                m_date = row['measured_at']
                m_idx = (m_date.month - 1) if m_date else 0
                result.append({
                    "id": row['id'],
                    "name": turkish_months[m_idx],
                    "measured_at": m_date or datetime.now(),
                    "kilo": float(row['kilo'] or 65.0),
                    "yag": float(row['yag'] or 15.0),
                    "lbm": float(row['lbm'] or 55.0),
                    "bmi": float(row['bmi'] or 21.2),
                    "bmr": int(row['bmr'] or 1600)
                })
            return result
    except Exception as e:
        if conn: 
            conn.rollback()
        print(f"History Fetch Error: {str(e)}")
        return []


# ==========================================
# 3. VÜCUT ANALİZİNİ KAYDET
# ==========================================
@router.post("/{user_id}/analysis", response_model=BodyAnalysis)
def save_body_analysis(user_id: int, data: BodyAnalysis, conn=Depends(get_db_connection)):
    """Kullanıcının ölçümlerini alarak Navy formülüyle hesaplar ve kaydeder."""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT age, height, weight, gender FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
            
            cinsiyet_raw = str(user["gender"]).lower().strip() if user.get("gender") else "belirtilmedi"
            boy = float(user["height"]) if user.get("height") else 175.0
            yas = int(user["age"]) if user.get("age") else 18

            kilo = float(getattr(data, 'weight', None) or getattr(data, 'kilo', None) or user.get("weight") or 65.0)
            hip_val = float(data.hip) if data.hip is not None else None
            neck_val = float(data.neck) if data.neck is not None else None
            waist_val = float(data.waist) if data.waist is not None else None

            is_kadin = cinsiyet_raw in ['kadin', 'kadın', 'female']

            if is_kadin and hip_val is None:
                raise HTTPException(status_code=400, detail="Kadın danışanlar için kalça çevresi zorunludur.")
            if neck_val is None or waist_val is None:
                raise HTTPException(status_code=400, detail="Bel ve boyun ölçüleri zorunludur.")

            height_m = boy / 100.0
            bmi = round(kilo / (height_m * height_m), 1) if height_m > 0 else 0.0

            if not is_kadin:
                bmr = round(88.362 + (13.397 * kilo) + (4.799 * boy) - (5.677 * yas))
                body_fat = 495 / (1.0324 - 0.19077 * math.log10(waist_val - neck_val) + 0.15456 * math.log10(boy)) - 450
            else:
                bmr = round(447.593 + (9.247 * kilo) + (3.098 * boy) - (4.330 * yas))
                body_fat = 495 / (1.29579 - 0.35004 * math.log10(waist_val + hip_val - neck_val) + 0.22100 * math.log10(boy)) - 450

            body_fat = round(max(2.0, min(50.0, body_fat)), 1)
            ideal_weight = round((45.5 if is_kadin else 50.0) + (2.3 * ((boy - 152.4) / 2.54)), 1)
            lbm = round(kilo - ((kilo * body_fat) / 100.0), 1)

            cur.execute("UPDATE users SET weight = %s WHERE id = %s", (kilo, user_id))

            cur.execute("""
                INSERT INTO body_analyses (user_id, neck, waist, hip, body_fat, bmr, bmi, ideal_weight, lbm, measured_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id, user_id, neck, waist, hip, body_fat, bmr, bmi, ideal_weight, lbm, measured_at
            """, (user_id, neck_val, waist_val, hip_val, body_fat, bmr, bmi, ideal_weight, lbm))
            
            inserted_analysis = cur.fetchone()
            inserted_analysis["weight"] = kilo
            inserted_analysis["kilo"] = kilo

            conn.commit()
            return inserted_analysis
    except HTTPException:
        if conn: conn.rollback()
        raise
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))