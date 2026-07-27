from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db_connection
from backend.schemas import User, BodyAnalysis, OnboardingAssessment
from datetime import date
import psycopg2.extras
import math

# Router kurulumu
router = APIRouter(
    prefix="/api/user",
    tags=["User & Analysis"]
)

# ==========================================
# 1. KULLANICI PROFİLİNİ GETİR
# ==========================================
@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: int, conn=Depends(get_db_connection)):
    """Kullanıcının Neon DB üzerindeki profil bilgilerini tam şemaya uygun şekilde getirir."""
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # Pydantic User şemasının beklediği TÜM zorunlu alanları (first_name, last_name, phone, age, height, weight, gender vb.) 
        # veritabanındaki orijinal kolon adlarıyla çekiyoruz.
        cur.execute("""
            SELECT 
                id, 
                first_name, 
                last_name, 
                email, 
                phone,
                age, 
                height, 
                weight, 
                gender, 
                role, 
                created_at 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        
        return user


# ==========================================
# 2. VÜCUT ANALİZİNİ KAYDET (ÖLÇÜM GÜNCELLE)
# ==========================================
@router.post("/{user_id}/analysis", response_model=BodyAnalysis)
def save_body_analysis(user_id: int, data: BodyAnalysis, conn=Depends(get_db_connection)):
    """
    Kullanıcının kilo, bel, boyun ve kalça çevre ölçümlerini alarak Navy formülüyle 
    vücut analizini hesaplar, body_analyses tablosuna yazar, users tablosundaki 
    güncel kiloyu günceller ve güncel analizi döner.
    """
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # Profil bilgilerini doğrula
        cur.execute("""
            SELECT age, height, weight, gender 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        
        cinsiyet = user["gender"].lower() if user["gender"] else "erkek"
        boy = float(user["height"]) if user["height"] else 170.0
        yas = int(user["age"]) if user["age"] else 25

        # DÜZELTME: Modal'dan gelen güncel kilo (weight veya kilo) önceliklidir. Yoksa kullanıcı tablosundakini al.
        kilo = float(getattr(data, 'weight', None) or getattr(data, 'kilo', None) or user["weight"] or 70.0)

        hip_val = float(data.hip) if data.hip is not None else None

        if cinsiyet == 'kadin' and hip_val is None:
            raise HTTPException(status_code=400, detail="Kadın danışanlar için kalça çevresi (hip) ölçüsü zorunludur.")

        if data.neck is None or data.waist is None:
            raise HTTPException(status_code=400, detail="Vücut analizi için bel (waist) ve boyun (neck) ölçüleri zorunludur.")

        # --- BİLİMSEL HESAPLAMALAR ---
        height_m = boy / 100.0
        bmi = round(kilo / (height_m * height_m), 1)

        # Bazal Metabolizma Hızı (BMR) - Harris Benedict
        if cinsiyet == 'erkek':
            bmr = round(88.362 + (13.397 * kilo) + (4.799 * boy) - (5.677 * yas))
        else:
            bmr = round(447.593 + (9.247 * kilo) + (3.098 * boy) - (4.330 * yas))

        # Vücut Yağ Oranı (U.S. Navy Formülü)
        try:
            if cinsiyet == 'erkek':
                if data.waist <= data.neck:
                    raise ValueError("Bel ölçüsü boyun ölçüsünden büyük olmalıdır.")
                body_fat = 495 / (1.0324 - 0.19077 * math.log10(data.waist - data.neck) + 0.15456 * math.log10(boy)) - 450
            else:
                if (data.waist + hip_val) <= data.neck:
                    raise ValueError("Bel ve kalça toplamı boyun ölçüsünden büyük olmalıdır.")
                body_fat = 495 / (1.29579 - 0.35004 * math.log10(data.waist + hip_val - data.neck) + 0.22100 * math.log10(boy)) - 450
            
            body_fat = round(max(2.0, min(50.0, body_fat)), 1)
        except (ValueError, ZeroDivisionError, TypeError):
            raise HTTPException(status_code=400, detail="Girilen çevre ölçümleri matematiksel olarak geçersiz bir logaritma üretiyor.")

        # İdeal Kilo (Devine Formülü)
        if cinsiyet == 'erkek':
            ideal_weight = round(50.0 + (2.3 * ((boy - 152.4) / 2.54)), 1)
        else:
            ideal_weight = round(45.5 + (2.3 * ((boy - 152.4) / 2.54)), 1)
        
        # Yağsız Vücut Kütlesi (LBM)
        lbm = round(kilo - ((kilo * body_fat) / 100.0), 1)

        # 1. Ana kullanıcı tablosundaki kiloyu yeni ölçümle senkronize et
        cur.execute("""
            UPDATE users 
            SET weight = %s 
            WHERE id = %s
        """, (kilo, user_id))

        # 2. body_analyses tablosuna yeni ölçümü kaydet
        cur.execute("""
            INSERT INTO body_analyses (user_id, neck, waist, hip, body_fat, bmr, bmi, ideal_weight, lbm)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, user_id, neck, waist, hip, body_fat, bmr, bmi, ideal_weight, lbm, measured_at
        """, (user_id, data.neck, data.waist, hip_val, body_fat, bmr, bmi, ideal_weight, lbm))
        
        inserted_analysis = cur.fetchone()
        
        # Pydantic model şemasının weight/kilo alanlarını güvenle karşılaması için ekliyoruz
        inserted_analysis["weight"] = kilo
        inserted_analysis["kilo"] = kilo

        conn.commit()
        return inserted_analysis


# ==========================================
# 3. ONBOARDING / DEĞERLENDİRME TESTİNİ KAYDET
# ==========================================
@router.post("/{user_id}/assessment")
def submit_test_assessment(user_id: int, data: OnboardingAssessment, conn=Depends(get_db_connection)):
    """Kullanıcının onboarding testini çözer, detaylı vücut analizini yapar, kaydeder ve profili günceller."""
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # Kullanıcı var mı kontrol et
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        
        # --- BİLİMSEL HESAPLAMALAR ---
        height_m = data.height / 100.0
        bmi = round(data.weight / (height_m * height_m), 1) if height_m > 0 else 0.0
        
        # BMR
        if data.gender.lower() == 'erkek':
            bmr = round(88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age))
        else:
            bmr = round(447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age))
            
        # Yağ Oranı ve LBM Hesaplaması (Eğer opsiyonel boyun ve bel ölçüleri girilmişse)
        body_fat = None
        lbm = None
        if data.neck and data.waist:
            try:
                if data.gender.lower() == 'erkek':
                    if data.waist > data.neck:
                        body_fat = 495 / (1.0324 - 0.19077 * math.log10(data.waist - data.neck) + 0.15456 * math.log10(data.height)) - 450
                else:
                    if not data.hip:
                        raise HTTPException(status_code=400, detail="Kadın danışanlar için kalça ölçüsü zorunludur.")
                    if (data.waist + data.hip) > data.neck:
                        body_fat = 495 / (1.29579 - 0.35004 * math.log10(data.waist + data.hip - data.neck) + 0.22100 * math.log10(data.height)) - 450
                
                if body_fat is not None:
                    body_fat = round(max(2.0, min(50.0, body_fat)), 1)
                    # LBM (Yağsız Kütle)
                    fat_mass = (data.weight * body_fat) / 100.0
                    lbm = round(data.weight - fat_mass, 1)
            except HTTPException:
                raise
            except Exception:
                body_fat = None
                lbm = None

        # Onboarding tablosuna kaydet veya güncelle (Upsert)
        cur.execute("""
            INSERT INTO onboarding_assessments 
            (client_id, gender, activity_level, goal, age, height, weight, neck, waist, hip, body_fat, bmr, bmi, lbm)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (client_id) DO UPDATE SET
                gender = EXCLUDED.gender,
                activity_level = EXCLUDED.activity_level,
                goal = EXCLUDED.goal,
                age = EXCLUDED.age,
                height = EXCLUDED.height,
                weight = EXCLUDED.weight,
                neck = EXCLUDED.neck,
                waist = EXCLUDED.waist,
                hip = EXCLUDED.hip,
                body_fat = EXCLUDED.body_fat,
                bmr = EXCLUDED.bmr,
                bmi = EXCLUDED.bmi,
                lbm = EXCLUDED.lbm,
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, data.gender, data.activity_level, data.goal, data.age, data.height, data.weight, data.neck, data.waist, data.hip, body_fat, bmr, bmi, lbm))
        
        # Ana kullanıcı tablosundaki yaş, boy, kilo bilgisini test verilerine göre senkronize et (Orijinal veritabanı şemasıyla uyumlu)
        cur.execute("""
            UPDATE users 
            SET age = %s, height = %s, weight = %s, gender = %s 
            WHERE id = %s
        """, (data.age, data.height, data.weight, data.gender, user_id))

        conn.commit()
        return {"status": "success", "message": "Değerlendirme kaydedildi ve uzmanlarınızla paylaşıldı."}