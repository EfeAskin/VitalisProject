from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json
from datetime import date

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


class LogPresetRequest(BaseModel):
    template_id: Optional[int] = None
    workout_title: Optional[str] = "Hazır Antrenman"
    completed_exercises: Optional[List[Any]] = []
    total_exercises: Optional[int] = 0
    progress_percent: Optional[int] = 0
    calories_burned: Optional[int] = 0
    day: Optional[str] = None


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
    conn: Any = Depends(get_db_connection)
):
    """
    Danışanın haftalık antrenman programını ve günlere göre atanmış egzersizleri getirir.
    Egzersizlerin tamamlanma durumunu veritabanından sorgular.
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

        # 2. Tamamlanmış egzersiz durumlarını getir
        completed_query = """
            SELECT template_exercise_id, day, completed
            FROM client_exercise_logs
            WHERE client_id = %s;
        """

        cursor.execute(completed_query, (target_client_id,))
        completed_rows = cursor.fetchall()

        completed_map = {}

        for c_row in completed_rows:
            ex_id = get_row_val(c_row, 'template_exercise_id', 0)
            ex_day = get_row_val(c_row, 'day', 1)
            is_done = get_row_val(c_row, 'completed', 2)

            if ex_id is not None and ex_day:
                completed_map[(ex_id, ex_day)] = bool(is_done)

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

        # 3. Veritabanından gelen veriyi günlere göre grupla
        for row in rows:
            program_details = get_row_val(row, 'program_details', 1)
            template_name = get_row_val(row, 'template_name', 3)
            template_exercise_id = get_row_val(row, 'template_exercise_id', 5)
            sets = get_row_val(row, 'sets', 6)
            reps = get_row_val(row, 'reps', 7)
            notes = get_row_val(row, 'notes', 8)
            exercise_name = get_row_val(row, 'exercise_name', 11)

            if isinstance(program_details, str):
                try:
                    program_details = json.loads(program_details)
                except json.JSONDecodeError:
                    program_details = {}

            assigned_days = (
                program_details.get("assigned_days", [])
                if isinstance(program_details, dict)
                else []
            )

            for day in assigned_days:
                if day in schedule:
                    schedule[day]['target'] = template_name

                    is_completed = completed_map.get(
                        (template_exercise_id, day),
                        False
                    )

                    if not any(
                        ex['id'] == template_exercise_id
                        for ex in schedule[day]['exercises']
                    ):
                        schedule[day]['exercises'].append({
                            "id": template_exercise_id,
                            "name": exercise_name,
                            "sets": (
                                f"{sets} Set x {reps} Tekrar"
                                if sets and reps
                                else "Belirtilmedi"
                            ),
                            "notes": notes,
                            "completed": is_completed
                        })

        return {
            "status": "success",
            "schedule": schedule
        }

    except Exception as e:
        print(
            f"[WORKOUT SCHEDULE ERROR] "
            f"client_id={target_client_id}, "
            f"error={repr(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Veritabanı hatası: {str(e)}"
        )

    finally:
        cursor.close()


@router.post("/workout-schedule/toggle")
def toggle_exercise_status(
    payload: ToggleExerciseRequest,
    client_id: Optional[int] = Query(None, description="Aktif danışan ID'si"),
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)
):
    """
    Danışanın hareket tamamlama durumunu veritabanına kaydeder/günceller.
    """
    require_client(current_user)

    auth_client_id = get_authenticated_user_id(current_user)

    target_client_id = (
        client_id
        if client_id is not None
        else auth_client_id
    )

    cursor = conn.cursor()

    try:
        # 1. Egzersiz durumunu upsert et
        upsert_query = """
            INSERT INTO client_exercise_logs (
                client_id,
                template_exercise_id,
                day,
                completed,
                updated_at
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (
                client_id,
                template_exercise_id,
                day
            )
            DO UPDATE SET
                completed = EXCLUDED.completed,
                updated_at = CURRENT_TIMESTAMP;
        """

        cursor.execute(
            upsert_query,
            (
                target_client_id,
                payload.exerciseId,
                payload.day,
                payload.completed
            )
        )

        # 2. Günlük log tablosunda antrenman yapıldı bilgisini güncelle
        daily_query = """
            INSERT INTO client_daily_logs (
                client_id,
                log_date,
                workout_done
            )
            VALUES (
                %s,
                CURRENT_DATE,
                %s
            )
            ON CONFLICT (
                client_id,
                log_date
            )
            DO UPDATE SET
                workout_done = EXCLUDED.workout_done;
        """

        cursor.execute(
            daily_query,
            (
                target_client_id,
                payload.completed
            )
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Hareket durumu başarıyla güncellendi",
            "data": payload
        }

    except Exception as e:
        conn.rollback()

        print(
            f"[WORKOUT TOGGLE ERROR] "
            f"client_id={target_client_id}, "
            f"exercise_id={payload.exerciseId}, "
            f"day={payload.day}, "
            f"error={repr(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Güncelleme hatası: {str(e)}"
        )

    finally:
        cursor.close()


@router.post("/workouts/log-preset")
def log_preset_workout(
    payload: LogPresetRequest,
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)
):
    """
    Hazır antrenman tamamlandığında gelen detaylı verileri kaydeder (404 hatasını çözer).
    """
    require_client(current_user)

    auth_client_id = get_authenticated_user_id(current_user)

    cursor = conn.cursor()

    try:
        completed_json = json.dumps(
            payload.completed_exercises or []
        )

        log_query = """
            INSERT INTO client_workout_logs
            (
                client_id,
                template_id,
                workout_title,
                completed_exercises,
                total_exercises,
                progress_percent,
                calories_burned,
                log_date
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                CURRENT_DATE
            );
        """

        cursor.execute(
            log_query,
            (
                auth_client_id,
                payload.template_id,
                payload.workout_title,
                completed_json,
                payload.total_exercises,
                payload.progress_percent,
                payload.calories_burned
            )
        )

        daily_query = """
            INSERT INTO client_daily_logs (
                client_id,
                log_date,
                workout_done
            )
            VALUES (
                %s,
                CURRENT_DATE,
                TRUE
            )
            ON CONFLICT (
                client_id,
                log_date
            )
            DO UPDATE SET
                workout_done = TRUE;
        """

        cursor.execute(
            daily_query,
            (auth_client_id,)
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Antrenman başarıyla tamamlandı olarak kaydedildi",
            "data": payload
        }

    except Exception as e:
        conn.rollback()

        print(
            f"[PRESET WORKOUT ERROR] "
            f"client_id={auth_client_id}, "
            f"error={repr(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Antrenman kaydı hatası: {str(e)}"
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
            JOIN users u
                ON ss.specialist_id = u.id
            LEFT JOIN specialist_profiles sp
                ON u.id = sp.user_id
            WHERE ss.client_id = %s
              AND LOWER(ss.status) = 'active'
            ORDER BY ss.created_at DESC
            LIMIT 1;
        """

        cursor.execute(
            query,
            (auth_client_id,)
        )

        row = cursor.fetchone()

        if not row:
            return {
                "assigned": False,
                "coach": None
            }

        coach_id = get_row_val(
            row,
            'coach_id',
            0
        )

        first_name = (
            get_row_val(row, 'first_name', 1)
            or ""
        )

        last_name = (
            get_row_val(row, 'last_name', 2)
            or ""
        )

        raw_role = (
            get_row_val(row, 'role', 3)
            or ""
        )

        profile_photo = get_row_val(
            row,
            'profile_photo',
            4
        )

        sp_title = get_row_val(
            row,
            'title',
            5
        )

        package_name = get_row_val(
            row,
            'package_name',
            6
        )

        full_name = (
            f"{first_name} {last_name}".strip()
            or "Uzman"
        )

        f_init = (
            first_name[0].upper()
            if first_name
            else ""
        )

        l_init = (
            last_name[0].upper()
            if last_name
            else ""
        )

        initials = (
            f"{f_init}{l_init}"
            or "U"
        )

        badge_title = (
            sp_title
            or (
                "Personal Trainer"
                if str(raw_role).lower() in ["trainer", "pt"]
                else "Diyetisyen"
            )
        )

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
        print(
            f"[MY-COACH DB ERROR] "
            f"client_id={auth_client_id}, "
            f"error={repr(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Koç bilgileri alınırken veritabanı hatası: {str(e)}"
        )

    finally:
        cursor.close()


class StepLogRequest(BaseModel):
    steps: int


@router.post("/daily/steps")
def log_daily_steps(
    payload: StepLogRequest,
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)
):
    """Kullanıcının adım sayısını kaydeder ve yaktığı kaloriyi otomatik hesaplar."""
    require_client(current_user)

    client_id = get_authenticated_user_id(current_user)

    # 1 Adım = ~0.04 kcal
    calculated_calories = int(
        payload.steps * 0.04
    )

    cursor = conn.cursor()

    try:
        query = """
            INSERT INTO client_daily_logs (
                client_id,
                log_date,
                step_count,
                step_calories
            )
            VALUES (
                %s,
                CURRENT_DATE,
                %s,
                %s
            )
            ON CONFLICT (
                client_id,
                log_date
            )
            DO UPDATE SET
                step_count = EXCLUDED.step_count,
                step_calories = EXCLUDED.step_calories;
        """

        cursor.execute(
            query,
            (
                client_id,
                payload.steps,
                calculated_calories
            )
        )

        conn.commit()

        return {
            "status": "success",
            "step_count": payload.steps,
            "step_calories": calculated_calories
        }

    except Exception as e:
        conn.rollback()

        print(
            f"[DAILY STEPS ERROR] "
            f"client_id={client_id}, "
            f"steps={payload.steps}, "
            f"error={repr(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    finally:
        cursor.close()


@router.get("/daily/calories-summary")
def get_daily_calories_summary(
    current_user: Any = Depends(get_current_user),
    conn: Any = Depends(get_db_connection)
):
    """Bugünkü toplam harcanan kaloriyi ve detaylı geçmiş dökümünü getirir."""
    require_client(current_user)

    client_id = get_authenticated_user_id(current_user)

    cursor = conn.cursor()

    try:
        # =========================================================
        # 1. HAZIR ANTRENMANLARDAN GELEN KALORİLER
        # =========================================================

        cursor.execute(
            """
            SELECT
                COALESCE(SUM(calories_burned), 0) AS total_calories
            FROM client_workout_logs
            WHERE client_id = %s
              AND log_date = CURRENT_DATE;
            """,
            (client_id,)
        )

        workout_row = cursor.fetchone()

        preset_calories_raw = get_row_val(
            workout_row,
            "total_calories",
            0
        )

        if preset_calories_raw is None:
            preset_calories = 0
        else:
            try:
                preset_calories = int(
                    float(preset_calories_raw)
                )
            except (TypeError, ValueError):
                preset_calories = 0


        # =========================================================
        # 2. ADIMDAN GELEN KALORİLER VE ADIM SAYISI
        # =========================================================

        cursor.execute(
            """
            SELECT
                COALESCE(step_count, 0) AS step_count,
                COALESCE(step_calories, 0) AS step_calories
            FROM client_daily_logs
            WHERE client_id = %s
              AND log_date = CURRENT_DATE
            LIMIT 1;
            """,
            (client_id,)
        )

        step_row = cursor.fetchone()

        if step_row:
            step_count_raw = get_row_val(
                step_row,
                "step_count",
                0
            )

            step_calories_raw = get_row_val(
                step_row,
                "step_calories",
                1
            )

            try:
                step_count = int(
                    float(step_count_raw or 0)
                )
            except (TypeError, ValueError):
                step_count = 0

            try:
                step_calories = int(
                    float(step_calories_raw or 0)
                )
            except (TypeError, ValueError):
                step_calories = 0

        else:
            step_count = 0
            step_calories = 0


        # =========================================================
        # 3. VARSAYILAN / HESAPLANMIŞ BMR
        # =========================================================

        bmr = 1650


        # =========================================================
        # 4. TOPLAM HARCANAN KALORİ
        # =========================================================

        total_burned = (
            int(bmr)
            + int(preset_calories)
            + int(step_calories)
        )


        # =========================================================
        # 5. RESPONSE
        # =========================================================

        return {
            "status": "success",
            "date": str(date.today()),
            "total_burned": int(total_burned),
            "breakdown": {
                "bmr": int(bmr),
                "workout_calories": int(preset_calories),
                "steps": int(step_count),
                "step_calories": int(step_calories)
            }
        }

    except Exception as e:

        print(
            f"[CALORIES SUMMARY ERROR] "
            f"client_id={client_id}, "
            f"error={repr(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Kalori özeti alınırken veritabanı hatası: {str(e)}"
        )

    finally:
        cursor.close()