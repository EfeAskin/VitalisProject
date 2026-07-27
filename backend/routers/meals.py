from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db_connection
from backend.schemas import ClientMealLog
import re

router = APIRouter(
    prefix="/api/meals", 
    tags=["Meal Logger"]
)

@router.post("/{client_id}/log", response_model=ClientMealLog)
def log_meal_with_ai(client_id: int, data: ClientMealLog, conn=Depends(get_db_connection)):
    """
    Kullanıcının girdiği öğün metnini analiz eder, içerdiği kelimelere göre makro 
    değerlerini hesaplar, client_meal_logs tablosuna kaydeder ve güncel kaydı döner.
    """
    # Gelen verideki meal_text bilgisini analiz için küçük harfe çeviriyoruz
    text = data.meal_text.lower()
    
    # 🌟 Gelişmiş AI Analiz Motoru (FastAPI içindeki regex tabanlı hafif model simülasyonu)
    # Varsayılan başlangıç değerleri
    kcal = 250
    protein = 15.0
    carbs = 30.0
    fat = 5.0

    if "tavuk" in text or "chicken" in text:
        protein += 30.0
        kcal += 200
        fat += 3.0
    if "pilav" in text or "rice" in text:
        carbs += 45.0
        kcal += 250
        protein += 4.0
    if "ton balığı" in text or "tuna" in text:
        protein += 25.0
        kcal += 180
        fat += 8.0
    if "yumurta" in text or "egg" in text:
        protein += 12.0
        fat += 10.0
        kcal += 150

    with conn.cursor() as cur:
        # Kullanıcı var mı kontrol et
        cur.execute("SELECT id FROM users WHERE id = %s", (client_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Yemek kaydı girilmek istenen kullanıcı bulunamadı."
            )

        # Neon DB'deki client_meal_logs tablosuna kaydet ve Pydantic ClientMealLog şeması için tüm alanları RETURNING ile çek
        cur.execute("""
            INSERT INTO client_meal_logs (client_id, meal_text, kcal, protein, carbs, fat)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, client_id, meal_text, kcal, protein, carbs, fat, logged_at
        """, (client_id, data.meal_text, int(kcal), float(protein), float(carbs), float(fat)))
        
        conn.commit()
        return cur.fetchone()