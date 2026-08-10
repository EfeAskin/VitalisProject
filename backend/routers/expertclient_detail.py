from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from backend.database import get_db_connection
from backend import schemas

router = APIRouter()


# ==============================================================================
# 4. TAM DANIŞAN DOSYASI (ClientDetailView.jsx)
# ==============================================================================
@router.get("/client-detail/{specialist_id}/{client_id}")
def get_full_client_file(specialist_id: int, client_id: int, conn=Depends(get_db_connection)):
    """
    ClientDetailView.jsx sayfası için gerekli tüm verileri tek hamlede getirir:
    - Danışan Profil Bilgileri & Abonelik Süresi
    - Kilo / Hedef Kilo / Günlük Kalori Metrikleri
    - Uzman Notları
    - Günlük Aktivite ve Diyet Logları
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 4.1 Danışan Kimlik & Abonelik Bilgisi
            cursor.execute("""
                SELECT 
                    s.id AS subscription_id,
                    s.package_name,
                    s.goal,
                    s.program_name,
                    s.start_date,
                    s.end_date,
                    GREATEST(0, EXTRACT(DAY FROM (s.end_date - NOW()))::INT) AS remaining_days,
                    u.id AS client_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    u.age,
                    u.gender,
                    u.height,
                    u.weight AS current_weight,
                    u.target_kcal AS daily_calorie_target,
                    COALESCE(NULLIF(u.profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar
                FROM specialist_subscriptions s
                JOIN users u ON s.client_id = u.id
                WHERE s.specialist_id = %s AND s.client_id = %s AND s.status = 'active'
                LIMIT 1
            """, (specialist_id, client_id))
            client_info = cursor.fetchone()

            if not client_info:
                # Abonelik bulunamazsa doğrudan users tablosundan fallback bilgisi çek
                cursor.execute("""
                    SELECT 
                        id AS client_id, first_name, last_name, email, phone, age, gender, 
                        height, weight AS current_weight, target_kcal AS daily_calorie_target,
                        COALESCE(NULLIF(profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar
                    FROM users WHERE id = %s
                """, (client_id,))
                client_info = cursor.fetchone()
                if not client_info:
                    raise HTTPException(status_code=404, detail="Danışan bulunamadı.")
                client_info["package_name"] = "Atanmamış Paket"
                client_info["remaining_days"] = 0
                client_info["program_name"] = "Program Yok"

            # 4.2 Son Vücut Analizinden Hedef Kilo Çekme (body_analyses tablosu)
            cursor.execute("""
                SELECT ideal_weight 
                FROM body_analyses 
                WHERE user_id = %s 
                ORDER BY measured_at DESC 
                LIMIT 1
            """, (client_id,))
            body_analysis = cursor.fetchone()
            target_weight = body_analysis["ideal_weight"] if body_analysis and body_analysis.get("ideal_weight") else None

            # 4.3 Uzman Notları (expert_notes tablosu)
            cursor.execute("""
                SELECT 
                    id,
                    specialist_id,
                    client_id,
                    note_text AS text,
                    note_text,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS date,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
                FROM expert_notes
                WHERE specialist_id = %s AND client_id = %s
                ORDER BY created_at DESC
            """, (specialist_id, client_id))
            notes = cursor.fetchall()

            # 4.4 Günlük Loglar (client_daily_logs tablosu)
            cursor.execute("""
                SELECT 
                    id,
                    log_date,
                    weight,
                    workout_done,
                    diet_done,
                    calories_consumed,
                    protein_g,
                    carbs_g,
                    fat_g,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
                FROM client_daily_logs
                WHERE client_id = %s
                ORDER BY log_date DESC
                LIMIT 14
            """, (client_id,))
            daily_logs = cursor.fetchall()

            return {
                "client_info": client_info,
                "metrics": {
                    "current_weight": client_info.get("current_weight"),
                    "target_weight": target_weight,
                    "daily_calorie_target": client_info.get("daily_calorie_target")
                },
                "notes": notes,
                "daily_logs": daily_logs
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Danışan dosyası yüklenemedi: {str(e)}")


# ==============================================================================
# 5. UZMAN NOTLARI YÖNETİMİ (Düzeltilmiş, Çift Rota Destekli & Hatasız)
# ==============================================================================
@router.post("/{client_id}/notes")
@router.post("/notes")
def add_note_to_client(
    payload: schemas.ExpertNoteCreate, 
    client_id: Optional[int] = None, 
    conn=Depends(get_db_connection)
):
    """
    ClientDetailView altındaki 'UZMAN NOTLARI' alanından danışana yeni not kaydeder.
    Hem /api/expert-clients/{client_id}/notes hem de /api/expert-clients/notes rotalarını destekler.
    Tarih verisi JSON serileştirme hatalarından arındırılmıştır.
    """
    if not payload.note_text or not payload.note_text.strip():
        raise HTTPException(status_code=400, detail="Not metni boş olamaz.")

    # URL path veya payload içerisinden client_id belirlenir
    target_client_id = client_id or getattr(payload, "client_id", None)
    if not target_client_id:
        raise HTTPException(status_code=400, detail="Danışan ID (client_id) belirtilmelidir.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO expert_notes (specialist_id, client_id, note_text, created_at)
                VALUES (%s, %s, %s, NOW())
                RETURNING 
                    id, 
                    specialist_id, 
                    client_id, 
                    note_text AS text, 
                    note_text,
                    'Uzman PT' AS author,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS date,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
            """, (payload.specialist_id, target_client_id, payload.note_text.strip()))
            
            new_note = cursor.fetchone()
            conn.commit()
            return {
                "status": "success",
                "message": "Not başarıyla eklendi.",
                "note": new_note,
                "id": new_note["id"],
                "note_text": new_note["text"],
                "created_at": new_note["created_at"],
                "author": "Uzman PT"
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Not eklenirken hata oluştu: {str(e)}")


@router.get("/{client_id}/notes")
def get_client_notes(client_id: int, conn=Depends(get_db_connection)):
    """
    Spesifik bir danışana ait uzman notlarını getirir.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    id,
                    specialist_id,
                    client_id,
                    note_text AS text,
                    note_text,
                    'Uzman PT' AS author,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS date,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
                FROM expert_notes
                WHERE client_id = %s
                ORDER BY created_at DESC
            """, (client_id,))
            notes = cursor.fetchall()
            return {"status": "success", "notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notlar çekilemedi: {str(e)}")


# ==============================================================================
# 6. DANIŞAN GÜNLÜK LOG TAKİBİ & ÇOKLU TABLO BİRLEŞTİRMELİ GÜNLÜK ÖZET
# ==============================================================================
@router.get("/{client_id}/daily-logs")
def get_client_daily_activity(client_id: int, conn=Depends(get_db_connection)):
    """
    Danışanın günlük beslenme, antrenman ve kilo takip loglarını getirir.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    id,
                    client_id,
                    log_date,
                    weight,
                    workout_done,
                    diet_done,
                    calories_consumed,
                    protein_g,
                    carbs_g,
                    fat_g,
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
                FROM client_daily_logs
                WHERE client_id = %s
                ORDER BY log_date DESC
            """, (client_id,))
            logs = cursor.fetchall()
            return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Günlük loglar getirilemedi: {str(e)}")


@router.get("/client-daily-summary")
@router.get("/{client_id}/daily-summary")
def get_client_daily_summary(client_id: Optional[int] = None, days: int = 7, conn=Depends(get_db_connection)):
    """
    ClientDetailView bileşenindeki aktivite ve diyet takibi sekmesi için verileri hazırlar.
    client_daily_logs, client_meal_logs ve water_logs tablolarını tarihe göre birleştirir (Aggregate eder).
    """
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id gereklidir.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            daily_map = {}

            # 1. Öğün Kayıtlarını Tarihe Göre Çek ve Topla (client_meal_logs)
            cursor.execute("""
                SELECT 
                    TO_CHAR(logged_at, 'YYYY-MM-DD') AS log_date,
                    COALESCE(SUM(kcal), 0)::INT AS total_calories,
                    COALESCE(SUM(protein), 0)::FLOAT AS total_protein,
                    COALESCE(SUM(carbs), 0)::FLOAT AS total_carbs,
                    COALESCE(SUM(fat), 0)::FLOAT AS total_fat,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', id,
                            'name', meal_text,
                            'kcal', COALESCE(kcal, 0),
                            'protein', COALESCE(protein, 0),
                            'carb', COALESCE(carbs, 0),
                            'fat', COALESCE(fat, 0)
                        )
                    ) AS meals
                FROM client_meal_logs
                WHERE client_id = %s
                GROUP BY TO_CHAR(logged_at, 'YYYY-MM-DD')
                ORDER BY log_date DESC
            """, (client_id,))
            meal_rows = cursor.fetchall()

            for row in meal_rows:
                d = str(row['log_date'])
                if d not in daily_map:
                    daily_map[d] = {
                        "log_date": d,
                        "totalCalories": 0,
                        "workoutDone": False,
                        "dietDone": False,
                        "protein_g": 0.0,
                        "carbs_g": 0.0,
                        "fat_g": 0.0,
                        "waterIntake": 0.0,
                        "meals": []
                    }
                daily_map[d]["totalCalories"] += row["total_calories"] or 0
                daily_map[d]["protein_g"] += float(row["total_protein"] or 0)
                daily_map[d]["carbs_g"] += float(row["total_carbs"] or 0)
                daily_map[d]["fat_g"] += float(row["total_fat"] or 0)
                daily_map[d]["meals"] = row["meals"] or []

            # 2. Su Kayıtlarını Tarihe Göre Çek (water_logs -> user_id)
            cursor.execute("""
                SELECT 
                    TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date,
                    COALESCE(SUM(water_consumed), 0)::FLOAT AS water_intake
                FROM water_logs
                WHERE user_id = %s
                GROUP BY TO_CHAR(log_date, 'YYYY-MM-DD')
            """, (client_id,))
            water_rows = cursor.fetchall()

            for row in water_rows:
                d = str(row['log_date'])
                if d not in daily_map:
                    daily_map[d] = {
                        "log_date": d,
                        "totalCalories": 0,
                        "workoutDone": False,
                        "dietDone": False,
                        "protein_g": 0.0,
                        "carbs_g": 0.0,
                        "fat_g": 0.0,
                        "waterIntake": 0.0,
                        "meals": []
                    }
                daily_map[d]["waterIntake"] = float(row["water_intake"] or 0)

            # 3. Günlük Log / Antrenman Kayıtlarını Çek (client_daily_logs)
            cursor.execute("""
                SELECT 
                    TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date,
                    workout_done,
                    diet_done,
                    weight,
                    calories_consumed,
                    protein_g,
                    carbs_g,
                    fat_g
                FROM client_daily_logs
                WHERE client_id = %s
            """, (client_id,))
            daily_rows = cursor.fetchall()

            for row in daily_rows:
                d = str(row['log_date'])
                if d not in daily_map:
                    daily_map[d] = {
                        "log_date": d,
                        "totalCalories": 0,
                        "workoutDone": False,
                        "dietDone": False,
                        "protein_g": 0.0,
                        "carbs_g": 0.0,
                        "fat_g": 0.0,
                        "waterIntake": 0.0,
                        "meals": []
                    }
                daily_map[d]["workoutDone"] = bool(row.get("workout_done", False))
                daily_map[d]["dietDone"] = bool(row.get("diet_done", False))
                if row.get("weight") is not None:
                    daily_map[d]["weight"] = float(row["weight"])
                if daily_map[d]["totalCalories"] == 0 and row.get("calories_consumed"):
                    daily_map[d]["totalCalories"] = row["calories_consumed"]
                    daily_map[d]["protein_g"] = float(row.get("protein_g") or 0)
                    daily_map[d]["carbs_g"] = float(row.get("carbs_g") or 0)
                    daily_map[d]["fat_g"] = float(row.get("fat_g") or 0)

            # Tarihe göre azalan sırala ve gün sayısı kadarını döndür
            sorted_days = sorted(daily_map.values(), key=lambda x: x["log_date"], reverse=True)[:days]

            return {
                "status": "success",
                "days": sorted_days
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Günlük özet çekilemedi: {str(e)}")


# ==============================================================================
# 7. UZMAN TARAFLI METRİK GÜNCELLEMELERİ (Target Weight & Target Calorie)
# ==============================================================================
@router.post("/set-target-weight")
def set_client_target_weight(payload: Dict[str, Any], conn=Depends(get_db_connection)):
    """
    Uzmanın danışan için hedef kilo belirlemesini sağlar.
    body_analyses tablosuna yeni bir hedef analiz kaydı işler veya users tablosunu günceller.
    """
    client_id = payload.get("client_id")
    target_weight = payload.get("target_weight")

    if not client_id or target_weight is None:
        raise HTTPException(status_code=400, detail="client_id ve target_weight alanları zorunludur.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO body_analyses (user_id, ideal_weight, measured_at)
                VALUES (%s, %s, NOW())
            """, (client_id, float(target_weight)))
            conn.commit()
            return {"status": "success", "message": "Hedef kilo başarıyla güncellendi."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Hedef kilo güncellenemedi: {str(e)}")


@router.post("/set-target-calorie")
def set_client_target_calorie(payload: Dict[str, Any], conn=Depends(get_db_connection)):
    """
    Uzmanın danışan için özel günlük kalori hedefi koymasını sağlar (users.target_kcal güncellenir).
    """
    client_id = payload.get("client_id")
    expert_target_kcal = payload.get("expert_target_kcal") or payload.get("target_kcal")

    if not client_id or expert_target_kcal is None:
        raise HTTPException(status_code=400, detail="client_id ve expert_target_kcal zorunludur.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE users
                SET target_kcal = %s
                WHERE id = %s
            """, (int(expert_target_kcal), client_id))
            conn.commit()
            return {"status": "success", "message": "Günlük kalori hedefi başarıyla güncellendi."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Kalori hedefi güncellenemedi: {str(e)}")