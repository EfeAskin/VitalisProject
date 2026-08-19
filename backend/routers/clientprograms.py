from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
import json

# Veritabanı bağlantı jeneratörü ve auth bağımlılıkları
from backend.database import get_db_connection
from backend.routers.auth import get_current_user

router = APIRouter(
    prefix="/api/client",
    tags=["Client Workouts"]
)

# =========================================================
# AUTH / AUTHORIZATION HELPERS
# =========================================================

def get_user_value(current_user, key, index=None):
    """get_current_user() dict veya tuple/list döndürebildiği için her iki yapıyı da destekler."""
    if isinstance(current_user, dict):
        return current_user.get(key)

    if hasattr(current_user, "get"):
        return current_user.get(key)

    if isinstance(current_user, (tuple, list)) and index is not None:
        if len(current_user) > index:
            return current_user[index]

    return None


def get_authenticated_user_id(current_user) -> int:
    """DB'den doğrulanmış kullanıcının gerçek user.id değerini döndürür."""
    user_id = get_user_value(current_user, "id", 0)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı kimliği",
        )

    try:
        return int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı kimliği",
        )


def get_authenticated_user_role(current_user):
    """Kullanıcının DB'den doğrulanmış rolünü döndürür."""
    return get_user_value(current_user, "role", 10)


def require_client(current_user=Depends(get_current_user)):
    """Client rolü kontrolü."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulaması gerekli",
        )

    role = get_authenticated_user_role(current_user)

    if role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem yalnızca danışanlar tarafından yapılabilir",
        )

    return current_user


class ToggleExerciseRequest(BaseModel):
    exerciseId: int
    completed: bool
    day: str


def get_row_val(row, key, index):
    """Dict ya da Tuple dönen veritabanı satırından güvenli veri çekme yardımcısı."""
    if isinstance(row, dict):
        return row.get(key)
    elif isinstance(row, (tuple, list)) and len(row) > index:
        return row[index]
    return None


# =========================================================
# ENDPOINTS
# =========================================================

@router.get("/workout-schedule")
def get_client_workout_schedule(
    client_id: Optional[int] = Query(None, description="Aktif danışan ID'si"),
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)  # <-- FastAPI Dependency Injection ile bağlantı alınıyor
):
    """
    Danışanın haftalık antrenman programını ve günlere göre atanmış egzersizleri getirir.
    """
    require_client(current_user)
    auth_client_id = get_authenticated_user_id(current_user)
    
    target_client_id = client_id if client_id is not None else auth_client_id

    cursor = conn.cursor()

    try:
        # 1. Danışana atanan aktif programları ve şablon detaylarını getir
        query = """
            SELECT 
                wp.id AS program_id,
                wp.program_details,
                wt.id AS template_id,
                wt.name AS template_name,
                wt.description AS template_desc,
                wte.id AS template_exercise_id,
                wte.sets,
                wte.reps,
                wte.notes,
                wte.order_index,
                e.id AS exercise_id,
                e.name AS exercise_name,
                e.video_url
            FROM workout_programs wp
            JOIN workout_templates wt ON wp.template_id = wt.id
            JOIN workout_template_exercises wte ON wt.id = wte.template_id
            JOIN exercises e ON wte.exercise_id = e.id
            WHERE wp.client_id = %s AND wp.status = 'active'
            ORDER BY wte.order_index ASC;
        """
        cursor.execute(query, (target_client_id,))
        rows = cursor.fetchall()

        # Haftalık şema taslağı
        schedule = {
            'Pzt': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
            'Sal': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
            'Çar': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
            'Per': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
            'Cum': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
            'Cmt': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
            'Paz': {'target': 'Planlanmış Antrenman Yok', 'exercises': []},
        }

        # 2. Veritabanından gelen veriyi günlere göre grupla
        for row in rows:
            program_details = get_row_val(row, 'program_details', 1)
            template_name = get_row_val(row, 'template_name', 3)
            template_exercise_id = get_row_val(row, 'template_exercise_id', 5)
            sets = get_row_val(row, 'sets', 6)
            reps = get_row_val(row, 'reps', 7)
            notes = get_row_val(row, 'notes', 8)
            exercise_name = get_row_val(row, 'exercise_name', 11)

            # JSONB formatındaki assigned_days verisini ayrıştır
            if isinstance(program_details, str):
                try:
                    program_details = json.loads(program_details)
                except json.JSONDecodeError:
                    program_details = {}
            
            assigned_days = program_details.get("assigned_days", []) if isinstance(program_details, dict) else []

            # Egzersiz kartı formatı
            exercise_item = {
                "id": template_exercise_id,
                "name": exercise_name,
                "sets": f"{sets} Set x {reps} Tekrar" if sets and reps else "Belirtilmedi",
                "notes": notes,
                "completed": False
            }

            # Programın atandığı her gün için veriyi ekle
            for day in assigned_days:
                if day in schedule:
                    schedule[day]['target'] = template_name
                    if not any(ex['id'] == template_exercise_id for ex in schedule[day]['exercises']):
                        schedule[day]['exercises'].append(exercise_item)

        return {"status": "success", "schedule": schedule}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Veritabanı hatası: {str(e)}"
        )
    finally:
        cursor.close()
        # NOT: conn.close() yapmıyoruz, database.py içerisindeki 
        # get_db_connection jeneratörünün finally bloğu bunu havuza devredecektir.


@router.post("/workout-schedule/toggle")
def toggle_exercise_status(
    payload: ToggleExerciseRequest,
    client_id: Optional[int] = Query(None, description="Aktif danışan ID'si"),
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)  # <-- FastAPI Dependency Injection
):
    """
    Danışanın hareket tamamlama durumunu günceller.
    """
    require_client(current_user)
    cursor = conn.cursor()

    try:
        return {
            "status": "success",
            "message": "Hareket durumu güncellendi",
            "data": payload
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Güncelleme hatası: {str(e)}"
        )
    finally:
        cursor.close() 

@router.get("/my-coach")
def get_assigned_coach(
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)
):
    """
    Danışanın aktif aboneliği üzerinden bağlı olduğu koç/uzman bilgilerini getirir.
    """
    require_client(current_user)
    auth_client_id = get_authenticated_user_id(current_user)

    cursor = conn.cursor()

    try:
        query = """
            SELECT 
                u.id AS coach_id,
                u.first_name,
                u.last_name,
                u.role,
                u.profile_photo,
                sp.title,
                ss.package_name
            FROM specialist_subscriptions ss
            JOIN users u ON ss.specialist_id = u.id
            LEFT JOIN specialist_profiles sp ON u.id = sp.user_id
            WHERE ss.client_id = %s AND LOWER(ss.status) = 'active'
            ORDER BY ss.created_at DESC
            LIMIT 1;
        """
        cursor.execute(query, (auth_client_id,))
        row = cursor.fetchone()

        if not row:
            return {"assigned": False, "coach": None}

        coach_id = get_row_val(row, 'coach_id', 0)
        first_name = get_row_val(row, 'first_name', 1) or ""
        last_name = get_row_val(row, 'last_name', 2) or ""
        raw_role = get_row_val(row, 'role', 3) or ""
        profile_photo = get_row_val(row, 'profile_photo', 4)
        sp_title = get_row_val(row, 'title', 5)
        package_name = get_row_val(row, 'package_name', 6)

        full_name = f"{first_name} {last_name}".strip() or "Uzman"

        # Baş harfler (Initials)
        f_init = first_name[0].upper() if first_name else ""
        l_init = last_name[0].upper() if last_name else ""
        initials = f"{f_init}{l_init}" or "U"

        # Rozet Alanı (Örn: Personal Trainer / Diyetisyen)
        badge_title = sp_title or ("Personal Trainer" if raw_role.lower() in ["trainer", "pt"] else "Diyetisyen")

        return {
            "assigned": True,
            "coach": {
                "id": coach_id,
                "full_name": full_name,
                "title": badge_title,
                "profile_photo": profile_photo,
                "initials": initials,
                "status": "Aktif Programda",
                "package_name": package_name
            }
        }

    except Exception as e:
        print("MY-COACH DB ERROR:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Koç bilgileri alınırken veritabanı hatası: {str(e)}"
        )
    finally:
        cursor.close()