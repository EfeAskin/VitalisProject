from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import os
import socket
import psycopg2
import psycopg2.extras
import traceback

router = APIRouter(
    prefix="/api/nutrition",
    tags=["Nutrition & Meal Management"]
)

class AiAnalysisRequest(BaseModel):
    query: str
    user_id: int  # Aktif kullanıcının ID'si frontend'den zorunlu gelmeli

class ManualMealCreate(BaseModel):
    user_id: int
    food_name: str = "Manuel Giriş"
    kcal: float = 0.0
    protein: float = 0.0
    carb: float = 0.0
    fat: float = 0.0

class ManualMealUpdate(BaseModel):
    user_id: Optional[int] = None
    food_name: Optional[str] = None
    kcal: Optional[float] = None
    protein: Optional[float] = None
    carb: Optional[float] = None
    fat: Optional[float] = None

def get_active_database_url():
    mode = os.getenv("DATABASE_MODE", "auto").lower()
    local_url = os.getenv("LOCAL_DATABASE_URL")
    neon_url = os.getenv("NEON_DATABASE_URL")

    if mode == "local":
        return local_url
    if mode == "neon":
        return neon_url

    if mode == "auto":
        if not neon_url:
            return local_url
        try:
            parsed_host = neon_url.split("@")[1].split("/")[0].split(":")[0]
            socket.setdefaulttimeout(2)
            socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((parsed_host, 5432))
            return neon_url
        except Exception:
            return local_url

    return local_url or os.getenv("DATABASE_URL")

def get_db_connection():
    active_url = get_active_database_url()
    if not active_url:
        raise HTTPException(status_code=500, detail="Hiçbir veritabanı URL'i tanımlı değil.")
    
    try:
        return psycopg2.connect(active_url)
    except Exception as e:
        local_url = os.getenv("LOCAL_DATABASE_URL")
        if local_url and active_url != local_url:
            try:
                return psycopg2.connect(local_url)
            except Exception:
                pass
                
        if "sslmode=require" in active_url:
            try:
                alt_url = active_url.replace("sslmode=require", "sslmode=prefer")
                return psycopg2.connect(alt_url)
            except Exception:
                clean_url = active_url.split("?")[0]
                return psycopg2.connect(clean_url)
        raise e

@router.get("/target/{user_id}")
def get_user_nutrition_target(user_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute(
            "SELECT id, age, height, weight, activity_level, target_kcal FROM users WHERE id = %s;",
            (user_id,)
        )
        user_row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user_row:
            raise HTTPException(status_code=404, detail=f"ID'si {user_id} olan kullanıcı bulunamadı.")

        try: age = int(user_row.get("age") or 22)
        except (ValueError, TypeError): age = 22

        try: height = float(user_row.get("height") or 182.0)
        except (ValueError, TypeError): height = 182.0
            
        try: weight = float(user_row.get("weight") or 82.0)
        except (ValueError, TypeError): weight = 82.0

        activity_raw = str(user_row.get("activity_level") or "moderate").lower()
        db_target_kcal = user_row.get("target_kcal")

        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        
        multiplier = 1.55
        if "az" in activity_raw or "sedentary" in activity_raw:
            multiplier = 1.2
        elif "hafif" in activity_raw or "light" in activity_raw:
            multiplier = 1.375
        elif "orta" in activity_raw or "moderate" in activity_raw:
            multiplier = 1.55
        elif "çok" in activity_raw or "active" in activity_raw:
            multiplier = 1.725

        calculated_target = int(bmr * multiplier)
        target_kcal = int(db_target_kcal) if db_target_kcal else calculated_target

        return {
            "success": True,
            "user_id": user_id,
            "target_kcal": target_kcal,
            "bmr": int(bmr),
            "activity_level": activity_raw
        }
    except HTTPException:
        if conn:
            try: conn.close()
            except: pass
        raise
    except Exception as e:
        if conn:
            try: conn.close()
            except: pass
        raise HTTPException(status_code=500, detail=f"Hedef kalori hesaplanamadı: {str(e)}")

@router.get("/summary/{user_id}")
def get_nutrition_summary(user_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            """
            SELECT id, client_id, meal_text, kcal, protein, carbs, fat, logged_at 
            FROM client_meal_logs 
            WHERE client_id = %s 
              AND (logged_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul')::date = (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul')::date
            ORDER BY logged_at DESC;
            """,
            (user_id,)
        )
        meals = cursor.fetchall() or []
        cursor.close()
        conn.close()

        total_kcal = sum(float(m["kcal"] or 0) for m in meals if m.get("kcal") is not None)
        total_protein = sum(float(m["protein"] or 0) for m in meals if m.get("protein") is not None)
        total_carbs = sum(float(m["carbs"] or 0) for m in meals if m.get("carbs") is not None)
        total_fat = sum(float(m["fat"] or 0) for m in meals if m.get("fat") is not None)

        return {
            "success": True,
            "user_id": user_id,
            "total_consumed_kcal": round(total_kcal, 1),
            "total_protein": round(total_protein, 1),
            "total_carbs": round(total_carbs, 1),
            "total_fat": round(total_fat, 1),
            "logged_meals": meals
        }
    except Exception as e:
        if conn:
            try: conn.close()
            except: pass
        raise HTTPException(status_code=500, detail=f"Özet verileri alınamadı: {str(e)}")

@router.get("/foods")
def get_available_foods():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, food_name, category, serving_unit, serving_size, kcal, protein, carb, fat FROM meal_logs;")
        foods = cursor.fetchall() or []
        cursor.close()
        conn.close()
        return {"success": True, "foods": foods}
    except Exception as e:
        if conn:
            try: conn.close()
            except: pass
        raise HTTPException(status_code=500, detail=f"Besin kataloğu yüklenemedi: {str(e)}")

@router.post("/analyze")
def analyze_and_log_meal(data: AiAnalysisRequest):
    text = data.query.lower() if data.query else ""
    protein, carbs, fat, kcal = 35.0, 45.0, 5.0, 365.0

    if "tavuk" in text or "chicken" in text:
        protein += 25.0
        kcal += 180
    if "pilav" in text or "rice" in text:
        carbs += 40.0
        kcal += 200
    if "ton balığı" in text or "tuna" in text:
        protein += 22.0
        kcal += 150
    if "çorba" in text or "soup" in text:
        carbs += 15.0
        kcal += 120

    calculated_macros = {
        "food_name": data.query,
        "protein": round(protein, 1),
        "carbs": round(carbs, 1),
        "fat": round(fat, 1),
        "kcal": round(kcal, 1)
    }

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE id = %s;", (data.user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"ID'si {data.user_id} olan kullanıcı bulunamadı.")

        insert_query = """
            INSERT INTO client_meal_logs (client_id, meal_text, kcal, protein, carbs, fat, logged_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW());
        """
        cursor.execute(insert_query, (
            data.user_id,
            calculated_macros["food_name"],
            calculated_macros["kcal"],
            calculated_macros["protein"],
            calculated_macros["carbs"],
            calculated_macros["fat"]
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except HTTPException:
        if conn:
            try: conn.rollback(); conn.close()
            except: pass
        raise
    except Exception as e:
        if conn:
            try: conn.rollback(); conn.close()
            except: pass
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "message": "Öğün başarıyla analiz edildi ve veritabanına işlendi.",
        "data": calculated_macros
    }

@router.post("/log")
def create_meal_log(meal: ManualMealCreate):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE id = %s;", (meal.user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"ID'si {meal.user_id} olan kullanıcı veritabanında bulunamadı.")

        insert_query = """
            INSERT INTO client_meal_logs (client_id, meal_text, kcal, protein, carbs, fat, logged_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW());
        """
        cursor.execute(insert_query, (
            meal.user_id,
            meal.food_name,
            meal.kcal,
            meal.protein,
            meal.carb,
            meal.fat
        ))
        conn.commit()
        cursor.close()
        conn.close()

        payload_dict = meal.model_dump() if hasattr(meal, "model_dump") else meal.dict()

        return {
            "success": True,
            "message": "Öğün veritabanına başarıyla kaydedildi.",
            "logged_item": payload_dict
        }
    except Exception as e:

        import traceback
        traceback.print_exc()

        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.put("/meal/{meal_id}")
def update_meal_log(meal_id: int, meal: ManualMealUpdate):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if meal.user_id:
            cursor.execute("SELECT id FROM client_meal_logs WHERE id = %s AND client_id = %s;", (meal_id, meal.user_id))
        else:
            cursor.execute("SELECT id FROM client_meal_logs WHERE id = %s;", (meal_id,))
            
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Güncellenecek öğün bulunamadı veya bu kullanıcıya ait değil.")

        update_query = """
            UPDATE client_meal_logs 
            SET meal_text = COALESCE(%s, meal_text),
                kcal = COALESCE(%s, kcal),
                protein = COALESCE(%s, protein),
                carbs = COALESCE(%s, carbs),
                fat = COALESCE(%s, fat)
            WHERE id = %s;
        """
        cursor.execute(update_query, (
            meal.food_name,
            meal.kcal,
            meal.protein,
            meal.carb,
            meal.fat,
            meal_id
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Öğün başarıyla güncellendi."}
    except HTTPException:
        if conn:
            try: conn.rollback(); conn.close()
            except: pass
        raise
    except Exception as e:
        if conn:
            try: conn.rollback(); conn.close()
            except: pass
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/meal/{meal_id}")
def delete_meal_log(meal_id: int, user_id: Optional[int] = None):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM client_meal_logs WHERE id = %s AND client_id = %s;", (meal_id, user_id))
        else:
            cursor.execute("DELETE FROM client_meal_logs WHERE id = %s;", (meal_id,))
            
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Öğün başarıyla silindi."}
    except Exception as e:
        if conn:
            try: conn.rollback(); conn.close()
            except: pass
        raise HTTPException(status_code=500, detail=str(e))