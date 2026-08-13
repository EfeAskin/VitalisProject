import os
import json
import traceback
from datetime import datetime, timezone
from typing import Optional, List, Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

# database.py dosyasındaki doğru fonksiyon içe aktarılıyor
try:
    from backend.database import get_db_connection
except ModuleNotFoundError:
    from database import get_db_connection

router = APIRouter(prefix="/api/expert", tags=["Expert Programs"])

# Dosya yükleme dizini kontrolü
UPLOAD_DIR = os.path.join("static", "uploads", "exercises")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def safe_int(val: Any, default: int = 0) -> int:
    """Güvenli tamsayı dönüştürücü."""
    if val is None:
        return default
    try:
        val_str = str(val).strip()
        return int(val_str) if val_str else default
    except (ValueError, TypeError):
        return default


def validate_difficulty(level_str: Optional[str]) -> str:
    """Zorluk seviyesi kontrolü."""
    allowed = ["Başlangıç", "Orta", "İleri"]
    if not level_str:
        return "Başlangıç"
    
    cleaned = str(level_str).strip()
    for item in allowed:
        if item.lower() == cleaned.lower():
            return item
    return "Başlangıç"


def parse_json_list(raw_val: Any) -> list:
    """Form verisinden gelen JSON veya list yapılarını güvenli şekilde liste tipine dönüştürür."""
    if not raw_val:
        return []
    if isinstance(raw_val, list):
        return raw_val
    if isinstance(raw_val, str):
        try:
            parsed = json.loads(raw_val)
            return parsed if isinstance(parsed, list) else []
        except Exception:
            return []
    return []


def get_val(item, key, idx=0):
    """Hem RealDictRow/dict hem de tuple/list veri tiplerini destekleyen esnek değer çekici."""
    if isinstance(item, dict):
        return item.get(key)
    if hasattr(item, key):
        return getattr(item, key)
    return item[idx] if isinstance(item, (list, tuple)) and len(item) > idx else None


async def process_template_save(request: Request, db, template_id: Optional[int] = None) -> int:
    """
    psycopg2 bağlantısı (db) kullanarak şablon ekleme/güncelleme işlemini gerçekleştirir.
    Veritabanı şemasına (workout_templates, exercises, workout_template_exercises) %100 uyumludur.
    """
    try:
        form_data = await request.form()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Form verisi okunamadı. Content-Type 'multipart/form-data' olmalıdır: {str(e)}"
        )
    
    title = str(form_data.get("title") or "Antrenman Şablonu").strip()
    level = validate_difficulty(form_data.get("level"))
    duration = safe_int(form_data.get("duration"), 45)
    
    raw_trainer_id = form_data.get("trainer_id")
    trainer_id = safe_int(raw_trainer_id, 4) if raw_trainer_id is not None else 4

    # Target muscles PARSE (hem camelCase hem snake_case kontrol edilir)
    target_muscles_raw = form_data.get("targetMuscles") or form_data.get("target_muscles") or "[]"
    target_muscles = parse_json_list(target_muscles_raw)
    target_muscles = [str(m).strip() for m in target_muscles if str(m).strip()]

    # Exercises PARSE
    exercises_raw = form_data.get("exercises", "[]")
    exercises_list = parse_json_list(exercises_raw)

    description_form = form_data.get("description")
    if description_form and str(description_form).strip():
        description_str = str(description_form).strip()
    elif target_muscles:
        description_str = f"Hedef Kaslar: {', '.join(target_muscles)}"
    else:
        description_str = None

    # Yüklenen dosyaları önceden asenkron olarak okuyoruz (Event loop bloklanmasını önlemek için)
    file_contents = {}
    for idx in range(len(exercises_list)):
        file_key = f"exercise_file_{idx}"
        uploaded_file = form_data.get(file_key)
        if uploaded_file and hasattr(uploaded_file, "filename") and uploaded_file.filename:
            content = await uploaded_file.read()
            file_contents[idx] = (uploaded_file.filename, content)

    with db.cursor() as cur:
        # 1. Şablon Ekleme veya Güncelleme (workout_templates tablosu: target_muscles text[] içerir)
        if template_id:
            cur.execute("SELECT id FROM workout_templates WHERE id = %s;", (template_id,))
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{template_id} ID'li şablon bulunamadı."
                )
            
            cur.execute("""
                UPDATE workout_templates
                SET name = %s, difficulty_level = %s, target_muscles = %s, duration_minutes = %s, description = %s, trainer_id = %s
                WHERE id = %s;
            """, (title, level, target_muscles, duration, description_str, trainer_id, template_id))

            cur.execute("DELETE FROM workout_template_exercises WHERE template_id = %s;", (template_id,))
            saved_id = template_id
        else:
            cur.execute("""
                INSERT INTO workout_templates (trainer_id, name, difficulty_level, target_muscles, duration_minutes, description)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (trainer_id, title, level, target_muscles, duration, description_str))
            
            res = cur.fetchone()
            saved_id = res["id"] if isinstance(res, dict) else res[0]

        # 2. Egzersiz Kütüphanesi ve İlişkilendirme
        for idx, ex_data in enumerate(exercises_list):
            if not isinstance(ex_data, dict):
                continue

            ex_name = str(ex_data.get("name", "")).strip() or f"Egzersiz {idx + 1}"
            sets_val = safe_int(ex_data.get("sets"), 3)
            reps_val = str(ex_data.get("reps") or "12").strip()
            ex_notes = str(ex_data.get("notes", "")).strip() or None
            media_type = ex_data.get("mediaType", "none")
            media_link = str(ex_data.get("mediaLink", "")).strip()

            video_url = None

            # Dosya kaydetme kontrolü
            if idx in file_contents:
                filename, content = file_contents[idx]
                file_ext = os.path.splitext(filename)[1] or ".mp4"
                timestamp = int(datetime.now(timezone.utc).timestamp())
                file_name = f"ex_{saved_id}_{idx}_{timestamp}{file_ext}"
                file_path = os.path.join(UPLOAD_DIR, file_name)

                with open(file_path, "wb") as buffer:
                    buffer.write(content)

                video_url = f"/static/uploads/exercises/{file_name}"
            elif media_type == "youtube" and media_link:
                video_url = media_link

            # Var olan egzersizi kontrol et (DB'deki 'target_muscles' text[] sütunu ile tam uyumlu)
            cur.execute("SELECT id, video_url FROM exercises WHERE LOWER(name) = LOWER(%s);", (ex_name,))
            existing_ex = cur.fetchone()

            if not existing_ex:
                primary_muscle = target_muscles[0] if target_muscles else "Genel"

                cur.execute("""
                    INSERT INTO exercises (name, muscle_group, target_muscles, difficulty_level, video_url, trainer_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id;
                """, (ex_name, primary_muscle, target_muscles, level, video_url, trainer_id))
                
                ex_res = cur.fetchone()
                ex_id = ex_res["id"] if isinstance(ex_res, dict) else ex_res[0]
            else:
                ex_id = existing_ex["id"] if isinstance(existing_ex, dict) else existing_ex[0]
                existing_video = existing_ex["video_url"] if isinstance(existing_ex, dict) else existing_ex[1]
                
                if video_url and not existing_video:
                    cur.execute("UPDATE exercises SET video_url = %s WHERE id = %s;", (video_url, ex_id))

            # İlişki tablosuna kaydet (workout_template_exercises: template_id, exercise_id, sets, reps, notes, order_index)
            cur.execute("""
                INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, notes, order_index)
                VALUES (%s, %s, %s, %s, %s, %s);
            """, (saved_id, ex_id, sets_val, reps_val, ex_notes, idx))

    db.commit()
    return saved_id


# --- ENDPOINT'LER ---

@router.post("/workout-templates", status_code=status.HTTP_201_CREATED)
async def create_workout_template(request: Request, db=Depends(get_db_connection)):
    """Yeni bir antrenman şablonu oluşturur."""
    try:
        saved_id = await process_template_save(request, db)
        return {
            "success": True,
            "message": "Antrenman şablonu başarıyla oluşturuldu.",
            "id": saved_id
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print("\n=== BACKEND HATA DETAYI (POST /workout-templates) ===")
        traceback.print_exc()
        print("=====================================================\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sunucu Hatası: {str(e)}"
        )


@router.put("/workout-templates/{template_id}", status_code=status.HTTP_200_OK)
async def update_workout_template(template_id: int, request: Request, db=Depends(get_db_connection)):
    """Mevcut bir antrenman şablonunu günceller."""
    try:
        saved_id = await process_template_save(request, db, template_id=template_id)
        return {
            "success": True,
            "message": "Antrenman şablonu başarıyla güncellendi.",
            "id": saved_id
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"\n=== BACKEND HATA DETAYI (PUT /workout-templates/{template_id}) ===")
        traceback.print_exc()
        print("=====================================================\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sunucu Hatası: {str(e)}"
        )


@router.get("/workout-templates", status_code=status.HTTP_200_OK)
def get_workout_templates(trainer_id: Optional[int] = None, db=Depends(get_db_connection)):
    """Tüm antrenman şablonlarını ve altındaki egzersizleri düzgün biçimlendirilmiş olarak listeler."""
    try:
        with db.cursor() as cur:
            if trainer_id:
                cur.execute("SELECT * FROM workout_templates WHERE trainer_id = %s ORDER BY id DESC;", (trainer_id,))
            else:
                cur.execute("SELECT * FROM workout_templates ORDER BY id DESC;")
            raw_templates = cur.fetchall()

            formatted_templates = []
            for t in raw_templates:
                t_id = get_val(t, "id", 0)

                # Şablona ait egzersizleri çekiyoruz
                cur.execute("""
                    SELECT 
                        wte.id as relation_id,
                        e.id as exercise_id,
                        e.name,
                        e.muscle_group,
                        e.target_muscles,
                        e.difficulty_level,
                        e.video_url,
                        e.description as exercise_description,
                        wte.sets,
                        wte.reps,
                        wte.notes,
                        wte.order_index
                    FROM workout_template_exercises wte
                    JOIN exercises e ON wte.exercise_id = e.id
                    WHERE wte.template_id = %s
                    ORDER BY wte.order_index ASC;
                """, (t_id,))
                raw_exercises = cur.fetchall()

                exercises_list = []
                for ex in raw_exercises:
                    exercises_list.append({
                        "relation_id": get_val(ex, "relation_id", 0),
                        "exercise_id": get_val(ex, "exercise_id", 1),
                        "name": get_val(ex, "name", 2),
                        "muscle_group": get_val(ex, "muscle_group", 3),
                        "target_muscles": get_val(ex, "target_muscles", 4),
                        "difficulty_level": get_val(ex, "difficulty_level", 5),
                        "video_url": get_val(ex, "video_url", 6),
                        "exercise_description": get_val(ex, "exercise_description", 7),
                        "sets": get_val(ex, "sets", 8),
                        "reps": get_val(ex, "reps", 9),
                        "notes": get_val(ex, "notes", 10),
                        "order_index": get_val(ex, "order_index", 11),
                    })

                formatted_templates.append({
                    "id": t_id,
                    "trainer_id": get_val(t, "trainer_id", 1),
                    "name": get_val(t, "name", 2),
                    "difficulty_level": get_val(t, "difficulty_level", 3),
                    "target_muscles": get_val(t, "target_muscles", 4),
                    "duration_minutes": get_val(t, "duration_minutes", 5),
                    "description": get_val(t, "description", 6),
                    "created_at": str(get_val(t, "created_at", 7)) if get_val(t, "created_at", 7) else None,
                    "exercises": exercises_list
                })

        return {
            "success": True,
            "count": len(formatted_templates),
            "templates": formatted_templates,
            "data": formatted_templates
        }
    except Exception as e:
        print("\n=== BACKEND HATA DETAYI (GET /workout-templates) ===")
        traceback.print_exc()
        print("===================================================\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Şablonlar getirilirken hata oluştu: {str(e)}"
        )


@router.get("/workout-templates/{template_id}", status_code=status.HTTP_200_OK)
def get_workout_template_detail(template_id: int, db=Depends(get_db_connection)):
    """Belirli bir şablonun detaylarını ve egzersizlerini getirir."""
    try:
        with db.cursor() as cur:
            cur.execute("SELECT * FROM workout_templates WHERE id = %s;", (template_id,))
            template = cur.fetchone()

            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Şablon bulunamadı."
                )

            cur.execute("""
                SELECT 
                    wte.id as relation_id,
                    e.id as exercise_id,
                    e.name,
                    e.muscle_group,
                    e.target_muscles,
                    e.difficulty_level,
                    e.video_url,
                    e.description as exercise_description,
                    wte.sets,
                    wte.reps,
                    wte.notes,
                    wte.order_index
                FROM workout_template_exercises wte
                JOIN exercises e ON wte.exercise_id = e.id
                WHERE wte.template_id = %s
                ORDER BY wte.order_index ASC;
            """, (template_id,))
            exercises_detail = cur.fetchall()

        return {
            "success": True,
            "template": {
                "id": get_val(template, "id", 0),
                "trainer_id": get_val(template, "trainer_id", 1),
                "name": get_val(template, "name", 2),
                "difficulty_level": get_val(template, "difficulty_level", 3),
                "target_muscles": get_val(template, "target_muscles", 4),
                "duration_minutes": get_val(template, "duration_minutes", 5),
                "description": get_val(template, "description", 6),
                "created_at": str(get_val(template, "created_at", 7)) if get_val(template, "created_at", 7) else None,
                "exercises": [
                    {
                        "relation_id": get_val(ex, "relation_id", 0),
                        "exercise_id": get_val(ex, "exercise_id", 1),
                        "name": get_val(ex, "name", 2),
                        "muscle_group": get_val(ex, "muscle_group", 3),
                        "target_muscles": get_val(ex, "target_muscles", 4),
                        "difficulty_level": get_val(ex, "difficulty_level", 5),
                        "video_url": get_val(ex, "video_url", 6),
                        "exercise_description": get_val(ex, "exercise_description", 7),
                        "sets": get_val(ex, "sets", 8),
                        "reps": get_val(ex, "reps", 9),
                        "notes": get_val(ex, "notes", 10),
                        "order_index": get_val(ex, "order_index", 11),
                    }
                    for ex in exercises_detail
                ]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n=== BACKEND HATA DETAYI (GET /workout-templates/{template_id}) ===")
        traceback.print_exc()
        print("==========================================================\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Şablon detayı alınırken hata oluştu: {str(e)}"
        )


@router.delete("/workout-templates/{template_id}", status_code=status.HTTP_200_OK)
def delete_workout_template(template_id: int, db=Depends(get_db_connection)):
    """Bir antrenman şablonunu siler."""
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM workout_templates WHERE id = %s;", (template_id,))
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Silinecek şablon bulunamadı."
                )

            cur.execute("DELETE FROM workout_template_exercises WHERE template_id = %s;", (template_id,))
            cur.execute("DELETE FROM workout_templates WHERE id = %s;", (template_id,))

        db.commit()
        return {
            "success": True,
            "message": f"{template_id} ID'li şablon başarıyla silindi."
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"\n=== BACKEND HATA DETAYI (DELETE /workout-templates/{template_id}) ===")
        traceback.print_exc()
        print("=============================================================\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Şablon silinirken hata oluştu: {str(e)}"
        )


@router.get("/exercises", status_code=status.HTTP_200_OK)
def get_exercise_library(muscle_group: Optional[str] = None, db=Depends(get_db_connection)):
    """Egzersiz kütüphanesini listeler."""
    try:
        with db.cursor() as cur:
            if muscle_group:
                cur.execute("SELECT * FROM exercises WHERE muscle_group ILIKE %s ORDER BY name ASC;", (f"%{muscle_group}%",))
            else:
                cur.execute("SELECT * FROM exercises ORDER BY name ASC;")
            exercises = cur.fetchall()

        return {
            "success": True,
            "count": len(exercises),
            "data": exercises
        }
    except Exception as e:
        print("\n=== BACKEND HATA DETAYI (GET /exercises) ===")
        traceback.print_exc()
        print("===========================================\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Egzersiz kütüphanesi getirilirken hata oluştu: {str(e)}"
        )