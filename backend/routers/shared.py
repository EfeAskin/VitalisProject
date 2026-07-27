from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db_connection
from backend.schemas import SharedClientDashboard

router = APIRouter(
    prefix="/api/shared", 
    tags=["Shared Synchronization Panel"]
)

@router.get("/client/{client_id}/dashboard", response_model=SharedClientDashboard)
def get_shared_dashboard(client_id: int, specialist_id: int, conn=Depends(get_db_connection)):
    """
    Diyetisyen veya Antrenörün danışanın tüm ortak bilgilerini izleyebileceği 
    eşzamanlı panel verilerini Neon DB'den çekerek tek bir şemada birleştirir.
    """
    with conn.cursor() as cur:
        # 1. İstek atan uzmanın o kişiye atanıp atanmadığını denetle
        cur.execute("""
            SELECT specialist_type FROM specialist_subscriptions 
            WHERE client_id = %s AND specialist_id = %s AND status = 'active'
        """, (client_id, specialist_id))
        sub = cur.fetchone()
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Bu danışanın verilerine erişim izniniz yok veya abonelik aktif değil."
            )

        # 2. Kullanıcı Genel Bilgileri (Pydantic User şemasıyla tam uyumlu olabilmesi için tüm kolonları çekiyoruz)
        cur.execute("""
            SELECT id, name, email, yas, boy, kilo, cinsiyet, role, created_at 
            FROM users 
            WHERE id = %s
        """, (client_id,))
        client_info = cur.fetchone()
        if not client_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Danışan kullanıcı profili bulunamadı."
            )

        # 3. Test Değerlendirmeleri
        cur.execute("SELECT * FROM onboarding_assessments WHERE client_id = %s", (client_id,))
        assessment = cur.fetchone()

        # 4. Diyetisyen Hedefleri
        cur.execute("SELECT * FROM dietitian_targets WHERE client_id = %s", (client_id,))
        diet_targets = cur.fetchone()

        # 5. Bugün Yenen Yemekler (logged_at TIMESTAMP tipini date ile döküyoruz)
        cur.execute("""
            SELECT * FROM client_meal_logs 
            WHERE client_id = %s AND logged_at::date = CURRENT_DATE
        """, (client_id,))
        logged_meals_today = cur.fetchall()

        # 6. Diyetisyen Programı
        cur.execute("SELECT * FROM nutrition_programs WHERE client_id = %s", (client_id,))
        nutrition_program = cur.fetchone()

        # 7. Antrenör Programı
        cur.execute("SELECT * FROM workout_programs WHERE client_id = %s", (client_id,))
        workout_program = cur.fetchone()

        return {
            "client_info": client_info,
            "assessment": assessment,
            "diet_targets": diet_targets,
            "logged_meals_today": logged_meals_today if logged_meals_today is not None else [],
            "nutrition_program": nutrition_program,
            "workout_program": workout_program
        }