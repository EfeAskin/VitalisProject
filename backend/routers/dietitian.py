from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db_connection
from backend.schemas import DietitianTarget
from datetime import date

router = APIRouter(
    prefix="/api/dietitian", 
    tags=["Dietitian Actions"]
)

@router.post("/client/{client_id}/targets", response_model=DietitianTarget)
def set_macro_targets(client_id: int, dietitian_id: int, data: DietitianTarget, conn=Depends(get_db_connection)):
    """
    Diyetisyen, danışanına günlük makro limitlerini (Min/Max) atar veya günceller.
    İşlem başarılıysa güncel hedef verilerini şemaya uygun şekilde döner.
    """
    with conn.cursor() as cur:
        # 1. Diyetisyen ve danışan ilişkisini doğrula
        cur.execute("""
            SELECT id FROM specialist_subscriptions 
            WHERE client_id = %s AND specialist_id = %s AND specialist_type = 'dietitian' AND status = 'active'
        """, (client_id, dietitian_id))
        
        if not cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Bu üye ile aktif bir diyetisyen aboneliğiniz bulunmuyor."
            )

        # 2. dietitian_targets tablosuna kaydet veya güncelle (Upsert) ve Pydantic DietitianTarget şeması için RETURNING kullan
        cur.execute("""
            INSERT INTO dietitian_targets 
            (client_id, dietitian_id, min_kcal, max_kcal, min_protein, max_protein, min_carbs, max_carbs, min_fat, max_fat, dietitian_note)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (client_id) DO UPDATE SET
                dietitian_id = EXCLUDED.dietitian_id,
                min_kcal = EXCLUDED.min_kcal,
                max_kcal = EXCLUDED.max_kcal,
                min_protein = EXCLUDED.min_protein,
                max_protein = EXCLUDED.max_protein,
                min_carbs = EXCLUDED.min_carbs,
                max_carbs = EXCLUDED.max_carbs,
                min_fat = EXCLUDED.min_fat,
                max_fat = EXCLUDED.max_fat,
                dietitian_note = EXCLUDED.dietitian_note,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, client_id, dietitian_id, min_kcal, max_kcal, min_protein, max_protein, min_carbs, max_carbs, min_fat, max_fat, dietitian_note, updated_at
        """, (client_id, dietitian_id, data.min_kcal, data.max_kcal, data.min_protein, data.max_protein, data.min_carbs, data.max_carbs, data.min_fat, data.max_fat, data.dietitian_note))
        
        conn.commit()
        return cur.fetchone()