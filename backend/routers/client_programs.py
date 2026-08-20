import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.extras import RealDictCursor

from backend.database import get_db_connection
from backend.routers.auth import get_current_user


# =========================================================
# ROUTERS
# =========================================================

# Ana program yönlendiricisi
router = APIRouter(
    prefix="/api/client/programs",
    tags=["Client Programs"]
)

# Eski / alternatif frontend endpoint'i
workout_router = APIRouter(
    prefix="/api/client/workout",
    tags=["Client Workouts"]
)


# =========================================================
# AUTH / AUTHORIZATION HELPERS
# =========================================================

def get_user_value(current_user, key, index=None):
    """
    get_current_user() dict, nesne veya tuple/list döndürebildiği
    için bütün yapıları destekler.
    """

    if isinstance(current_user, dict):
        return current_user.get(key)

    if hasattr(current_user, key):
        return getattr(current_user, key)

    if hasattr(current_user, "get"):
        return current_user.get(key)

    if isinstance(current_user, (tuple, list)) and index is not None:
        if len(current_user) > index:
            return current_user[index]

    return None


def get_authenticated_user_id(current_user) -> int:
    """
    DB'den doğrulanmış kullanıcının gerçek user.id değerini döndürür.
    """

    user_id = get_user_value(
        current_user,
        "id",
        0
    )

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
    """
    Kullanıcının DB'den doğrulanmış rolünü döndürür.
    """

    return get_user_value(
        current_user,
        "role",
        1
    )


def require_client(current_user):
    """
    Client rolü kontrolü.
    """

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulaması gerekli"
        )

    role = get_authenticated_user_role(
        current_user
    )

    if role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem yalnızca danışanlar tarafından yapılabilir"
        )

    return current_user


# =========================================================
# 1. DANIŞANA ATANAN TÜM PROGRAMLARI LİSTELE
# =========================================================

@router.get("/assigned")
@router.get("")
@workout_router.get("")
@workout_router.get("/assigned")
def get_assigned_programs(
    current_user=Depends(get_current_user)
):
    require_client(current_user)

    client_id = get_authenticated_user_id(
        current_user
    )

    db_gen = get_db_connection()
    conn = None
    cursor = None

    try:
        conn = (
            next(db_gen)
            if hasattr(db_gen, "__next__")
            else db_gen
        )

        cursor = conn.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute(
            """
            WITH ranked_programs AS (
                SELECT DISTINCT ON (
                    COALESCE(wp.template_id, wp.id)
                )
                    wp.id,
                    wp.client_id,
                    wp.trainer_id,
                    wp.template_id,
                    wp.program_details,
                    wp.status,
                    wp.created_at,

                    COALESCE(
                        wt.name,
                        'Antrenman Programı'
                    ) AS title,

                    COALESCE(
                        wt.name,
                        'Antrenman Programı'
                    ) AS name,

                    COALESCE(
                        wt.description,
                        ''
                    ) AS description,

                    wt.difficulty_level,
                    wt.duration_minutes,
                    wt.target_muscles,

                    u.first_name AS trainer_first_name,
                    u.last_name AS trainer_last_name,

                    CONCAT(
                        u.first_name,
                        ' ',
                        u.last_name
                    ) AS trainer_name,

                    u.profile_photo AS trainer_photo

                FROM workout_programs wp

                LEFT JOIN workout_templates wt
                    ON wp.template_id = wt.id

                LEFT JOIN users u
                    ON wp.trainer_id = u.id

                WHERE wp.client_id = %s

                ORDER BY
                    COALESCE(
                        wp.template_id,
                        wp.id
                    ),
                    wp.created_at DESC
            )

            SELECT *
            FROM ranked_programs

            ORDER BY created_at DESC;
            """,
            (client_id,)
        )

        programs = cursor.fetchall()

        return programs if programs is not None else []

    except HTTPException:
        raise

    except Exception:
        print("ERROR in /api/client/programs/assigned:")
        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Programlar getirilemedi"
        )

    finally:

        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

        if conn:
            try:
                conn.close()
            except Exception:
                pass

        if hasattr(db_gen, "close"):
            try:
                db_gen.close()
            except Exception:
                pass


# =========================================================
# 2. PROGRAM DETAYI VE EGZERSİZLERİ GETİR
# =========================================================

@router.get("/{program_id}")
@workout_router.get("/{program_id}")
def get_program_detail(
    program_id: int,
    current_user=Depends(get_current_user)
):
    require_client(current_user)

    client_id = get_authenticated_user_id(
        current_user
    )

    db_gen = get_db_connection()
    conn = None
    cursor = None

    try:

        conn = (
            next(db_gen)
            if hasattr(db_gen, "__next__")
            else db_gen
        )

        cursor = conn.cursor(
            cursor_factory=RealDictCursor
        )

        # =================================================
        # PROGRAMI BUL
        #
        # Öncelik:
        # 1. workout_programs.id
        # 2. workout_programs.template_id
        #
        # Her iki durumda da client_id kontrol edilir.
        # Böylece sadece kullanıcıya atanmış program açılır.
        # =================================================

        cursor.execute(
            """
            SELECT
                wp.id,
                wp.client_id,
                wp.trainer_id,
                wp.template_id,
                wp.program_details,
                wp.status,
                wp.created_at,

                COALESCE(
                    wt.name,
                    'Antrenman Programı'
                ) AS title,

                COALESCE(
                    wt.name,
                    'Antrenman Programı'
                ) AS name,

                COALESCE(
                    wt.description,
                    ''
                ) AS description,

                wt.difficulty_level,
                wt.duration_minutes,
                wt.target_muscles,

                u.first_name AS trainer_first_name,
                u.last_name AS trainer_last_name,

                CONCAT(
                    u.first_name,
                    ' ',
                    u.last_name
                ) AS trainer_name,

                u.profile_photo AS trainer_photo

            FROM workout_programs wp

            LEFT JOIN workout_templates wt
                ON wp.template_id = wt.id

            LEFT JOIN users u
                ON wp.trainer_id = u.id

            WHERE
                wp.client_id = %s
                AND (
                    wp.id = %s
                    OR wp.template_id = %s
                )

            ORDER BY
                CASE
                    WHEN wp.id = %s THEN 0
                    ELSE 1
                END,
                wp.created_at DESC

            LIMIT 1;
            """,
            (
                client_id,
                program_id,
                program_id,
                program_id
            )
        )

        program = cursor.fetchone()

        # =================================================
        # PROGRAM BULUNAMADI
        # =================================================

        if not program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Program bulunamadı veya bu programa erişim yetkiniz yok"
            )

        # =================================================
        # TEMPLATE ID
        # =================================================

        template_id = (
            program.get("template_id")
            or program.get("id")
        )

        # =================================================
        # EGZERSİZLERİ GETİR
        # =================================================

        exercises = []

        if template_id:

            cursor.execute(
                """
                SELECT
                    wte.id,
                    wte.template_id,

                    wte.sets,
                    wte.reps,
                    wte.notes,

                    COALESCE(
                        wte.order_index,
                        0
                    ) AS order_index,

                    COALESCE(
                        wte.order_index,
                        0
                    ) AS sort_order,

                    1 AS day_number,

                    e.id AS exercise_id,

                    COALESCE(
                        e.name,
                        'Egzersiz'
                    ) AS exercise_name,

                    COALESCE(
                        e.name,
                        'Egzersiz'
                    ) AS name,

                    e.video_url,
                    e.target_muscles,
                    e.muscle_group,

                    e.description AS instructions,

                    wte.notes AS ai_tip

                FROM workout_template_exercises wte

                INNER JOIN exercises e
                    ON wte.exercise_id = e.id

                WHERE wte.template_id = %s

                ORDER BY
                    COALESCE(
                        wte.order_index,
                        0
                    ) ASC,

                    wte.id ASC;
                """,
                (template_id,)
            )

            exercises = cursor.fetchall() or []

        # =================================================
        # DEBUG
        # =================================================

        print(
            f"[CLIENT PROGRAM DETAIL] "
            f"client_id={client_id} "
            f"program_id={program_id} "
            f"template_id={template_id} "
            f"exercise_count={len(exercises)}"
        )

        # =================================================
        # RESPONSE
        # =================================================

        return {
            "program": program,
            "exercises": exercises
        }

    except HTTPException:
        raise

    except Exception:
        print(
            "ERROR in "
            "/api/client/programs/{program_id}:"
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Program detayı yüklenemedi"
        )

    finally:

        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

        if conn:
            try:
                conn.close()
            except Exception:
                pass

        if hasattr(db_gen, "close"):
            try:
                db_gen.close()
            except Exception:
                pass