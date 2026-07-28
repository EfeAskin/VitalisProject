import os
import math
from datetime import datetime
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/vitalis_db")

def get_db():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Veritabanı bağlantı hatası: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

class UserProfileResponse(BaseModel):
    id: int
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    age: Optional[int] = 0
    height: Optional[float] = 0.0
    weight: Optional[float] = 0.0
    gender: Optional[str] = ""

    class Config:
        from_attributes = True

class AnalysisInput(BaseModel):
    neck: float
    waist: float
    hip: float

class AnalysisResultResponse(BaseModel):
    id: int
    user_id: int
    neck: float
    waist: float
    hip: float
    body_fat: float
    bmr: int
    bmi: float
    ideal_weight: float
    lbm: float
    measured_at: datetime

    class Config:
        from_attributes = True

class HistoryPointResponse(BaseModel):
    id: int
    name: str
    measured_at: datetime
    kilo: float
    yag: float
    lbm: float
    bmi: float
    bmr: int

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100.0
    if height_m <= 0:
        return 0.0
    return round(weight_kg / (height_m ** 2), 1)

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> int:
    gender_lower = (gender or "").lower().strip()
    if gender_lower in ['erkek', 'male', 'm']:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    return int(round(bmr))

def calculate_body_fat_navy(height_cm: float, neck_cm: float, waist_cm: float, hip_cm: float, gender: str) -> float:
    gender_lower = (gender or "").lower().strip()
    try:
        if gender_lower in ['erkek', 'male', 'm']:
            diff = waist_cm - neck_cm
            if diff <= 0:
                return 10.0
            body_fat = 86.010 * math.log10(diff) - 70.041 * math.log10(height_cm) + 36.76
        else:
            diff = waist_cm + hip_cm - neck_cm
            if diff <= 0:
                return 18.0
            body_fat = 163.205 * math.log10(diff) - 97.684 * math.log10(height_cm) - 78.387
        
        return round(max(2.0, min(body_fat, 60.0)), 1)
    except Exception:
        return 15.0

def calculate_ideal_weight(height_cm: float, gender: str) -> float:
    gender_lower = (gender or "").lower().strip()
    inches_over_5ft = (height_cm / 2.54) - 60
    if inches_over_5ft < 0:
        inches_over_5ft = 0

    if gender_lower in ['erkek', 'male', 'm']:
        ideal = 50.0 + (2.3 * inches_over_5ft)
    else:
        ideal = 45.5 + (2.3 * inches_over_5ft)
    
    return round(ideal, 1)

def calculate_lbm(weight_kg: float, body_fat_percentage: float) -> float:
    lbm = weight_kg * (1.0 - (body_fat_percentage / 100.0))
    return round(lbm, 1)

router = APIRouter(prefix="/api/user", tags=["Body Analysis"])

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int, conn=Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("SELECT id, first_name, last_name, age, height, weight, gender FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()

        if not user:
            cur.execute("SELECT id, first_name, last_name, age, height, weight, gender FROM users ORDER BY id ASC LIMIT 1")
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    
    return dict(user)

@router.post("/{user_id}/analysis", response_model=AnalysisResultResponse)
def create_body_analysis(user_id: int, body_input: AnalysisInput, conn=Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("SELECT id, age, height, weight, gender FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()

        if not user:
            cur.execute("SELECT id, age, height, weight, gender FROM users ORDER BY id ASC LIMIT 1")
            user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

        effective_user_id = user['id']
        weight = float(user['weight'] or 70.0)
        height = float(user['height'] or 175.0)
        age = int(user['age'] or 25)
        gender = str(user['gender'] or 'erkek')

        bmi = calculate_bmi(weight, height)
        bmr = calculate_bmr(weight, height, age, gender)
        body_fat = calculate_body_fat_navy(height, body_input.neck, body_input.waist, body_input.hip, gender)
        ideal_weight = calculate_ideal_weight(height, gender)
        lbm = calculate_lbm(weight, body_fat)
        now = datetime.now()

        cur.execute("""
            INSERT INTO body_analyses 
            (user_id, neck, waist, hip, body_fat, bmr, bmi, ideal_weight, lbm, measured_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, user_id, neck, waist, hip, body_fat, bmr, bmi, ideal_weight, lbm, measured_at
        """, (effective_user_id, body_input.neck, body_input.waist, body_input.hip, body_fat, bmr, bmi, ideal_weight, lbm, now))
        
        new_row = cur.fetchone()
        conn.commit()
        return dict(new_row)

@router.get("/{user_id}/analysis/history", response_model=List[HistoryPointResponse])
def get_analysis_history(user_id: int, conn=Depends(get_db)):
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    ba.id,
                    ba.measured_at,
                    COALESCE(u.weight, 70.0) AS kilo,
                    COALESCE(ba.body_fat, 15.0) AS yag,
                    COALESCE(ba.lbm, 60.0) AS lbm,
                    COALESCE(ba.bmi, 24.0) AS bmi,
                    COALESCE(ba.bmr, 1800) AS bmr
                FROM body_analyses ba
                LEFT JOIN users u ON u.id = ba.user_id
                WHERE ba.user_id = %s
                ORDER BY ba.measured_at ASC
            """, (user_id,))
            rows = cur.fetchall()

            if not rows:
                cur.execute("""
                    SELECT 
                        ba.id,
                        ba.measured_at,
                        COALESCE(u.weight, 70.0) AS kilo,
                        COALESCE(ba.body_fat, 15.0) AS yag,
                        COALESCE(ba.lbm, 60.0) AS lbm,
                        COALESCE(ba.bmi, 24.0) AS bmi,
                        COALESCE(ba.bmr, 1800) AS bmr
                    FROM body_analyses ba
                    LEFT JOIN users u ON u.id = ba.user_id
                    ORDER BY ba.measured_at ASC
                    LIMIT 10
                """)
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
                "kilo": float(row['kilo'] or 70.0),
                "yag": float(row['yag'] or 15.0),
                "lbm": float(row['lbm'] or 60.0),
                "bmi": float(row['bmi'] or 24.0),
                "bmr": int(row['bmr'] or 1800)
            })
        return result
    except Exception as e:
        if conn:
            conn.rollback()
        # Hata durumunda uygulamanın patlamaması ve frontend'in boş array alması için güvenli dönüş
        return []