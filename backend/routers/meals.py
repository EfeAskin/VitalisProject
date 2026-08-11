from fastapi import APIRouter, Depends, HTTPException, status
import os
import socket
import psycopg2
import psycopg2.extras

router = APIRouter(
    prefix="/api/meals", 
    tags=["Meal Logger"]
)

def get_active_database_url():
    mode = os.getenv("DATABASE_MODE", "auto").lower()
    local_url = os.getenv("LOCAL_DATABASE_URL")
    neon_url = os.getenv("NEON_DATABASE_URL")

    if mode == "local":
        return local_url

    if mode == "neon":
        return neon_url

    # AUTO Modu: İnternet/Neon erişim kontrolü
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

@router.post("/{client_id}/log")
def log_meal_with_ai(client_id: int, data: dict):
    conn = None
    meal_text = data.get("meal_text", "")
    text = meal_text.lower() if meal_text else ""
    
    kcal = float(data.get("kcal") or 250)
    protein = float(data.get("protein") or 15.0)
    carbs = float(data.get("carbs") or 30.0)
    fat = float(data.get("fat") or 5.0)

    if "tavuk" in text or "chicken" in text:
        protein += 30.0
        kcal += 200
        fat += 3.0
    if "pilav" in text or "rice" in text:
        carbs += 45.0
        kcal += 250
        protein += 4.0

    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE id = %s", (client_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Yemek kaydı girilmek istenen kullanıcı bulunamadı."
                )

            cur.execute("""
                INSERT INTO client_meal_logs (client_id, meal_text, kcal, protein, carbs, fat, logged_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                RETURNING id, client_id, meal_text, kcal, protein, carbs, fat, logged_at
            """, (client_id, meal_text, int(kcal), float(protein), float(carbs), float(fat)))
            
            inserted_row = cur.fetchone()
            conn.commit()
            return {"success": True, "data": inserted_row}
    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            try: conn.close()
            except: pass