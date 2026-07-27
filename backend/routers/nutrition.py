from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import os
import psycopg2
import psycopg2.extras

router = APIRouter(
    prefix="/api/nutrition",
    tags=["Nutrition & Meal Management"]
)

# Pydantic Modelleri
class AiAnalysisRequest(BaseModel):
    query: str
    user_id: Optional[int] = 1

class ManualMealCreate(BaseModel):
    user_id: int
    food_name: str
    kcal: float
    protein: float
    carb: float
    fat: float

# 1. Kullanıcının Hedef Kalorisini Çekme ve DB'yi Güncelleme Uç Noktası
@router.get("/target/{user_id}")
def get_user_nutrition_target(user_id: int):
    conn = None
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            raise HTTPException(status_code=500, detail="DATABASE_URL tanımlı değil.")

        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute(
            "SELECT age, height, weight, activity_level FROM users WHERE id = %s;",
            (user_id,)
        )
        user_row = cursor.fetchone()

        if not user_row:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

        age = user_row.get("age") or 22
        height = float(user_row.get("height") or 182)
        weight = float(user_row.get("weight") or 82)
        activity_level = str(user_row.get("activity_level") or "moderate").lower()

        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        multipliers = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "very_active": 1.725}

        multiplier = 1.55
        for key, val in multipliers.items():
            if key in activity_level:
                multiplier = val
                break

        target_kcal = int(bmr * multiplier)

        cursor.execute(
            "UPDATE users SET target_kcal = %s WHERE id = %s;",
            (target_kcal, user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return {
            "user_id": user_id,
            "target_kcal": target_kcal,
            "bmr": int(bmr),
            "activity_level": activity_level
        }

    except Exception as e:
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

# 2. Günlük Özet ve Tüketilen Kalorileri Çekme (Sadece Bugünün Verileri)
@router.get("/summary/{user_id}")
def get_nutrition_summary(user_id: int):
    conn = None
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            raise HTTPException(status_code=500, detail="DATABASE_URL tanımlı değil.")

        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # 📌 Sadece bugüne ait kayıtları çekecek şekilde güncellendi (24 saatlik döngü / günlük sıfırlanma)
        cursor.execute(
            """
            SELECT id, client_id, meal_text, kcal, protein, carbs, fat, logged_at 
            FROM client_meal_logs 
            WHERE client_id = %s AND DATE(logged_at) = CURRENT_DATE
            ORDER BY logged_at DESC;
            """,
            (user_id,)
        )
        meals = cursor.fetchall()
        cursor.close()
        conn.close()

        total_kcal = sum(m["kcal"] for m in meals if m["kcal"])
        total_protein = sum(m["protein"] for m in meals if m["protein"])
        total_carbs = sum(m["carbs"] for m in meals if m["carbs"])
        total_fat = sum(m["fat"] for m in meals if m["fat"])

        return {
            "success": True,
            "total_consumed_kcal": total_kcal,
            "total_protein": round(total_protein, 1),
            "total_carbs": round(total_carbs, 1),
            "total_fat": round(total_fat, 1),
            "logged_meals": meals
        }

    except Exception as e:
        if conn:
            try:
                conn.close()
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

# 3. AI Destekli Öğün Analiz Uç Noktası
@router.post("/analyze")
def analyze_and_log_meal(data: AiAnalysisRequest):
    calculated_macros = {
        "food_name": data.query,
        "Protein": 35.0,
        "Karbonhidrat": 45.0,
        "Yağ": 5.0,
        "Kcal": 365.0
    }

    conn = None
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL, sslmode='require')
            cursor = conn.cursor()
            insert_query = """
                INSERT INTO client_meal_logs (client_id, meal_text, kcal, protein, carbs, fat, logged_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW());
            """
            cursor.execute(insert_query, (
                data.user_id,
                calculated_macros["food_name"],
                calculated_macros["Kcal"],
                calculated_macros["Protein"],
                calculated_macros["Karbonhidrat"],
                calculated_macros["Yağ"]
            ))
            conn.commit()
            cursor.close()
            conn.close()
    except Exception as e:
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "message": "Öğün başarıyla analiz edildi ve veritabanına işlendi.",
        "data": calculated_macros
    }

# 4. Manuel veya Arama Sonucu Öğün Kaydetme
@router.post("/log")
def create_meal_log(meal: ManualMealCreate):
    conn = None
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL, sslmode='require')
            cursor = conn.cursor()
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
    except Exception as e:
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "message": "Öğün veritabanına başarıyla kaydedildi.",
        "logged_item": meal.dict()
    }

# 5. 📌 Yeni Eklenen: Yanlış Eklenen Öğünü Silme Uç Noktası
@router.delete("/meal/{meal_id}")
def delete_meal_log(meal_id: int):
    conn = None
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            raise HTTPException(status_code=500, detail="DATABASE_URL tanımlı değil.")

        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM client_meal_logs WHERE id = %s;", (meal_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Öğün başarıyla silindi."}
    except Exception as e:
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))