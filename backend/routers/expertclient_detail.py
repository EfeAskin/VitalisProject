from datetime import datetime, date
import json
from typing import Any, Dict, List, Optional
import psycopg2
from fastapi import APIRouter, Depends, HTTPException, Query, status
from psycopg2.extras import RealDictCursor

from backend import schemas
from backend.database import get_db_connection

router = APIRouter()


# ==============================================================================
# YARDIMCI MANTIK: ATANAN ANTRENMAN PROGRAMLARINI GÜVENLİ GETİRME (TEKİLLEŞTİRİLMİŞ)
# ==============================================================================
def fetch_workout_programs_logic(client_id: Optional[int], specialist_id: Optional[int], conn):
    if not client_id:
        return {
            "status": "success",
            "assigned_programs": [],
            "workout_programs": [],
            "programs": []
        }

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            if specialist_id:
                query = """
                    SELECT 
                        wp.id,
                        wp.client_id,
                        wp.trainer_id,
                        wp.template_id,
                        wp.program_details,
                        wp.status,
                        wp.created_at,
                        wp.updated_at,
                        wt.name AS template_name,
                        wt.name AS name,
                        wt.name AS title,
                        wt.description,
                        wt.difficulty_level,
                        wt.target_muscles,
                        wt.duration_minutes
                    FROM workout_programs wp
                    LEFT JOIN workout_templates wt ON wp.template_id = wt.id
                    WHERE wp.client_id = %s AND (wp.trainer_id = %s OR wp.trainer_id IS NULL)
                    ORDER BY wp.id DESC
                """
                cursor.execute(query, (client_id, specialist_id))
            else:
                query = """
                    SELECT 
                        wp.id,
                        wp.client_id,
                        wp.trainer_id,
                        wp.template_id,
                        wp.program_details,
                        wp.status,
                        wp.created_at,
                        wp.updated_at,
                        wt.name AS template_name,
                        wt.name AS name,
                        wt.name AS title,
                        wt.description,
                        wt.difficulty_level,
                        wt.target_muscles,
                        wt.duration_minutes
                    FROM workout_programs wp
                    LEFT JOIN workout_templates wt ON wp.template_id = wt.id
                    WHERE wp.client_id = %s
                    ORDER BY wp.id DESC
                """
                cursor.execute(query, (client_id,))

            program_rows = cursor.fetchall() or []

            assigned_programs = []
            seen_program_ids = set()
            seen_program_keys = set()

            for prog in program_rows:
                prog_dict = dict(prog)
                prog_id = prog_dict.get("id")
                template_id = prog_dict.get("template_id")
                prog_name = prog_dict.get("name") or prog_dict.get("template_name")

                # ID bazlı mükerrer kontrolü
                if prog_id in seen_program_ids:
                    continue

                # İçerik/Şablon bazlı mükerrer kontrolü (3 abonelikte aynı program atandıysa teke indirir)
                dedup_key = (template_id, prog_name)
                if dedup_key in seen_program_keys and template_id is not None:
                    continue

                seen_program_ids.add(prog_id)
                seen_program_keys.add(dedup_key)

                p_details = prog_dict.get("program_details")
                if p_details is None:
                    p_details = {}
                elif isinstance(p_details, str):
                    try:
                        p_details = json.loads(p_details)
                    except Exception:
                        p_details = {}
                elif not isinstance(p_details, dict):
                    p_details = {}

                assigned_days = p_details.get("assigned_days", [])
                if not isinstance(assigned_days, list):
                    assigned_days = []

                prog_dict["program_details"] = p_details
                prog_dict["assigned_days"] = assigned_days

                for k, v in prog_dict.items():
                    if isinstance(v, (datetime, date)):
                        prog_dict[k] = v.isoformat()

                exercises = []
                if template_id:
                    try:
                        cursor.execute("""
                            SELECT 
                                wte.id,
                                wte.template_id,
                                wte.exercise_id,
                                wte.sets,
                                wte.reps,
                                wte.notes,
                                wte.order_index,
                                COALESCE(e.name, 'Egzersiz') AS exercise_name,
                                COALESCE(e.name, 'Egzersiz') AS name
                            FROM workout_template_exercises wte
                            LEFT JOIN exercises e ON wte.exercise_id = e.id
                            WHERE wte.template_id = %s
                            ORDER BY wte.order_index ASC
                        """, (template_id,))
                        ex_rows = cursor.fetchall() or []
                    except Exception:
                        conn.rollback()
                        cursor.execute("""
                            SELECT 
                                wte.id,
                                wte.template_id,
                                wte.exercise_id,
                                wte.sets,
                                wte.reps,
                                wte.notes,
                                wte.order_index,
                                'Egzersiz' AS exercise_name,
                                'Egzersiz' AS name
                            FROM workout_template_exercises wte
                            WHERE wte.template_id = %s
                            ORDER BY wte.order_index ASC
                        """, (template_id,))
                        ex_rows = cursor.fetchall() or []

                    for ex in ex_rows:
                        ex_dict = dict(ex)
                        for ek, ev in ex_dict.items():
                            if isinstance(ev, (datetime, date)):
                                ex_dict[ek] = ev.isoformat()
                        ex_dict["sets"] = ex_dict.get("sets") or 3
                        ex_dict["reps"] = str(ex_dict.get("reps") or "12")
                        exercises.append(ex_dict)

                prog_dict["exercises"] = exercises
                prog_dict["template_exercises"] = exercises
                assigned_programs.append(prog_dict)

            return {
                "status": "success",
                "assigned_programs": assigned_programs,
                "workout_programs": assigned_programs,
                "programs": assigned_programs
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Atanan programlar çekilemedi: {str(e)}")


# ==============================================================================
# 1. ATANAN ANTRENMAN PROGRAMLARI ENDPOINT'LERİ
# ==============================================================================
@router.get("/workout-programs")
@router.get("/assigned-programs")
def get_client_assigned_workout_programs_query(
    client_id: Optional[int] = Query(None),
    specialist_id: Optional[int] = Query(None),
    conn=Depends(get_db_connection)
):
    return fetch_workout_programs_logic(client_id, specialist_id, conn)


@router.get("/workout-programs/{client_id}")
@router.get("/assigned-programs/{client_id}")
@router.get("/{client_id}/workout-programs")
@router.get("/{client_id}/assigned-programs")
@router.get("/assigned-programs/{specialist_id}/{client_id}")
def get_client_assigned_workout_programs_path(
    client_id: int,
    specialist_id: Optional[int] = None,
    conn=Depends(get_db_connection)
):
    return fetch_workout_programs_logic(client_id, specialist_id, conn)


# ==============================================================================
# 2. TAM DANIŞAN DOSYASI (ClientDetailView.jsx)
# ==============================================================================
@router.get("/client-detail/{specialist_id}/{client_id}")
def get_full_client_file(specialist_id: int, client_id: int, conn=Depends(get_db_connection)):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
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
                    u.target_weight,
                    u.target_kcal AS daily_calorie_target,
                    COALESCE(NULLIF(u.profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar
                FROM specialist_subscriptions s
                JOIN users u ON s.client_id = u.id
                WHERE s.specialist_id = %s AND s.client_id = %s AND s.status = 'active'
                ORDER BY s.id DESC
                LIMIT 1
            """, (specialist_id, client_id))
            client_info = cursor.fetchone()

            if not client_info:
                cursor.execute("""
                    SELECT 
                        id AS client_id, first_name, last_name, email, phone, age, gender, 
                        height, weight AS current_weight, target_weight, target_kcal AS daily_calorie_target,
                        COALESCE(NULLIF(profile_photo, ''), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300') AS avatar
                    FROM users WHERE id = %s
                """, (client_id,))
                client_info = cursor.fetchone()
                if not client_info:
                    raise HTTPException(status_code=404, detail="Danışan bulunamadı.")
                client_info["package_name"] = "Atanmamış Paket"
                client_info["remaining_days"] = 0
                client_info["program_name"] = "Program Yok"

            cursor.execute("""
                SELECT ideal_weight 
                FROM body_analyses 
                WHERE user_id = %s 
                ORDER BY measured_at DESC 
                LIMIT 1
            """, (client_id,))
            body_analysis = cursor.fetchone()
            
            latest_ideal_weight = float(body_analysis["ideal_weight"]) if body_analysis and body_analysis.get("ideal_weight") is not None else None

            if client_info.get("target_weight") is not None:
                final_target_weight = float(client_info["target_weight"])
            else:
                final_target_weight = latest_ideal_weight

            client_info["ideal_weight"] = latest_ideal_weight
            client_info["target_weight"] = final_target_weight

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
            notes = cursor.fetchall() or []

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
            daily_logs = cursor.fetchall() or []

            assigned_data = fetch_workout_programs_logic(client_id, specialist_id, conn)
            assigned_programs = assigned_data.get("assigned_programs", [])

            active_program_names = list(dict.fromkeys([p.get("name") for p in assigned_programs if p.get("name")]))
            if active_program_names:
                client_info["program_name"] = active_program_names

            return {
                "client_info": client_info,
                "metrics": {
                    "current_weight": client_info.get("current_weight"),
                    "target_weight": final_target_weight,
                    "ideal_weight": latest_ideal_weight,
                    "daily_calorie_target": client_info.get("daily_calorie_target")
                },
                "notes": notes,
                "daily_logs": daily_logs,
                "assigned_programs": assigned_programs,
                "workout_programs": assigned_programs,
                "programs": assigned_programs
            }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Danışan dosyası yüklenemedi: {str(e)}")


# ==============================================================================
# 3. ABONELİK DETAYLARI VE YÖNETİMİ ENDPOINT'LERİ
# ==============================================================================
def fetch_subscriptions_logic(client_id: Optional[int], specialist_id: Optional[int], conn):
    if not client_id:
        return {"status": "success", "subscriptions": []}

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            query = """
                SELECT 
                    s.id,
                    s.specialist_id,
                    s.client_id,
                    s.package_name,
                    s.package_name AS title,
                    s.goal,
                    s.program_name,
                    s.start_date,
                    s.end_date,
                    s.status,
                    CASE 
                        WHEN s.end_date IS NOT NULL THEN 'recurring' 
                        ELSE 'one_time' 
                    END AS type,
                    GREATEST(0, EXTRACT(DAY FROM (s.end_date - NOW()))::INT) AS remaining_days,
                    TO_CHAR(s.start_date, 'YYYY-MM-DD') AS formatted_start_date,
                    TO_CHAR(s.end_date, 'YYYY-MM-DD') AS formatted_end_date
                FROM specialist_subscriptions s
                WHERE s.client_id = %s
            """
            params = [client_id]

            if specialist_id:
                query += " AND s.specialist_id = %s"
                params.append(specialist_id)

            query += " ORDER BY s.start_date DESC, s.id DESC"

            cursor.execute(query, tuple(params))
            raw_subscriptions = cursor.fetchall() or []

            seen_sub_ids = set()
            subscriptions = []
            for sub in raw_subscriptions:
                sub_dict = dict(sub)
                for k, v in sub_dict.items():
                    if isinstance(v, (datetime, date)):
                        sub_dict[k] = v.isoformat()

                if sub_dict["id"] not in seen_sub_ids:
                    seen_sub_ids.add(sub_dict["id"])
                    # Frontend uyumu için ekstra alan eşlemeleri
                    sub_dict["title"] = sub_dict.get("package_name") or "Özel Hizmet"
                    subscriptions.append(sub_dict)

            return {
                "status": "success",
                "subscriptions": subscriptions
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Abonelik bilgileri çekilemedi: {str(e)}")


@router.get("/subscriptions")
def get_client_subscriptions_query(
    client_id: Optional[int] = Query(None), 
    specialist_id: Optional[int] = Query(None), 
    conn=Depends(get_db_connection)
):
    return fetch_subscriptions_logic(client_id, specialist_id, conn)


@router.get("/{client_id}/subscriptions")
@router.get("/subscriptions/{specialist_id}/{client_id}")
def get_client_subscriptions_path(
    client_id: int, 
    specialist_id: Optional[int] = None, 
    conn=Depends(get_db_connection)
):
    return fetch_subscriptions_logic(client_id, specialist_id, conn)


@router.post("/subscriptions")
@router.post("/{client_id}/subscriptions")
def create_subscription(
    payload: Dict[str, Any],
    client_id: Optional[int] = None,
    conn=Depends(get_db_connection)
):
    target_client_id = client_id or payload.get("client_id")
    if not target_client_id:
        raise HTTPException(status_code=400, detail="client_id gereklidir.")

    title = payload.get("title") or payload.get("package_name") or "Özel Hizmet Paketi"
    sub_type = payload.get("type", "one_time")
    days = payload.get("days", 30) if sub_type == "recurring" else None
    specialist_id = payload.get("specialist_id")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO specialist_subscriptions (
                    client_id, specialist_id, package_name, status, start_date, end_date
                )
                VALUES (
                    %s, %s, %s, 'active', NOW(),
                    CASE WHEN %s::INT IS NOT NULL THEN NOW() + (%s || ' days')::INTERVAL ELSE NULL END
                )
                RETURNING 
                    id, specialist_id, client_id, package_name AS title, package_name, status,
                    TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
                    TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
                    GREATEST(0, EXTRACT(DAY FROM (end_date - NOW()))::INT) AS remaining_days
            """, (target_client_id, specialist_id, title, days, str(days) if days else None))
            
            new_sub = cursor.fetchone()
            conn.commit()
            
            res_dict = dict(new_sub)
            res_dict["type"] = sub_type
            return res_dict
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Abonelik oluşturulamadı: {str(e)}")


@router.patch("/subscriptions/{sub_id}/complete")
def mark_subscription_completed(sub_id: int, conn=Depends(get_db_connection)):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE specialist_subscriptions
                SET status = 'completed',
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id, status, TO_CHAR(updated_at, 'YYYY-MM-DD') AS completed_at
            """, (sub_id,))
            updated = cursor.fetchone()
            if not updated:
                raise HTTPException(status_code=404, detail="Abonelik bulunamadı.")
            conn.commit()
            return {"status": "success", "message": "Abonelik tamamlandı olarak güncellendi.", "subscription": updated}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Abonelik güncellenemedi: {str(e)}")


@router.delete("/subscriptions/{sub_id}")
def delete_subscription(sub_id: int, conn=Depends(get_db_connection)):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                DELETE FROM specialist_subscriptions
                WHERE id = %s
                RETURNING id
            """, (sub_id,))
            deleted = cursor.fetchone()
            if not deleted:
                raise HTTPException(status_code=404, detail="Abonelik bulunamadı.")
            conn.commit()
            return {"status": "success", "message": "Abonelik başarıyla silindi."}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Abonelik silinemedi: {str(e)}")


# ==============================================================================
# 4. UZMAN NOTLARI ENDPOINT'LERİ (QUERY VE PATH AYRIŞTIRILDI)
# ==============================================================================
def fetch_notes_logic(client_id: Optional[int], conn):
    if not client_id:
        return {"status": "success", "notes": []}

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
                ORDER BY created_at DESC, id DESC
            """, (client_id,))
            raw_notes = cursor.fetchall() or []

            seen_note_ids = set()
            notes = []
            for n in raw_notes:
                n_dict = dict(n)
                if n_dict["id"] not in seen_note_ids:
                    seen_note_ids.add(n_dict["id"])
                    notes.append(n_dict)

            return {"status": "success", "notes": notes}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Notlar çekilemedi: {str(e)}")


@router.get("/notes")
def get_client_notes_query(
    client_id: Optional[int] = Query(None), 
    conn=Depends(get_db_connection)
):
    return fetch_notes_logic(client_id, conn)


@router.get("/{client_id}/notes")
def get_client_notes_path(
    client_id: int, 
    conn=Depends(get_db_connection)
):
    return fetch_notes_logic(client_id, conn)


@router.post("/notes")
@router.post("/{client_id}/notes")
def add_note_to_client(
    payload: schemas.ExpertNoteCreate, 
    client_id: Optional[int] = None, 
    conn=Depends(get_db_connection)
):
    if not payload.note_text or not payload.note_text.strip():
        raise HTTPException(status_code=400, detail="Not metni boş olamaz.")

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


# ==============================================================================
# 5. GÜNLÜK ÖZET TAKİBİ ENDPOINT'LERİ (QUERY VE PATH AYRIŞTIRILDI)
# ==============================================================================
def fetch_daily_summary_logic(client_id: Optional[int], days: int, conn):
    if not client_id:
        return {"status": "success", "days": []}

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            daily_map = {}

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
            meal_rows = cursor.fetchall() or []

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

            cursor.execute("""
                SELECT 
                    TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date,
                    COALESCE(SUM(water_consumed), 0)::FLOAT AS water_intake
                FROM water_logs
                WHERE user_id = %s
                GROUP BY TO_CHAR(log_date, 'YYYY-MM-DD')
            """, (client_id,))
            water_rows = cursor.fetchall() or []

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
                ORDER BY log_date DESC, id DESC
            """, (client_id,))
            daily_rows = cursor.fetchall() or []

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

            sorted_days = sorted(daily_map.values(), key=lambda x: x["log_date"], reverse=True)[:days]

            return {
                "status": "success",
                "days": sorted_days
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Günlük özet çekilemedi: {str(e)}")


@router.get("/client-daily-summary")
def get_client_daily_summary_query(
    client_id: Optional[int] = Query(None), 
    days: int = 7, 
    conn=Depends(get_db_connection)
):
    return fetch_daily_summary_logic(client_id, days, conn)


@router.get("/{client_id}/daily-summary")
def get_client_daily_summary_path(
    client_id: int, 
    days: int = 7, 
    conn=Depends(get_db_connection)
):
    return fetch_daily_summary_logic(client_id, days, conn)


# ==============================================================================
# 6. UZMAN METRİK GÜNCELLEMELERİ
# ==============================================================================
@router.post("/set-target-weight")
def set_client_target_weight(payload: Dict[str, Any], conn=Depends(get_db_connection)):
    client_id = payload.get("client_id")
    target_weight = payload.get("target_weight")

    if not client_id or target_weight is None:
        raise HTTPException(status_code=400, detail="client_id ve target_weight alanları zorunludur.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE users
                SET target_weight = %s,
                    updated_at = NOW()
                WHERE id = %s
            """, (float(target_weight), client_id))
            conn.commit()
            return {"status": "success", "message": "Hedef kilo başarıyla güncellendi."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Hedef kilo güncellenemedi: {str(e)}")


@router.post("/set-target-calorie")
def set_client_target_calorie(payload: Dict[str, Any], conn=Depends(get_db_connection)):
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