import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from psycopg2.extras import RealDictCursor

from backend.database import get_db_connection
from backend.routers.auth import get_current_user, RoleChecker


router = APIRouter(
    prefix="/api/expert",
    tags=["Expert Assignment"]
)


# ============================================================
# PYDANTİC MODELS
# ============================================================

class AssignWorkoutRequest(BaseModel):
    template_id: int
    client_ids: List[int]
    assigned_days: List[str]


# ============================================================
# HELPER
# ============================================================

def get_current_user_id(current_user):
    """
    auth.py içerisindeki get_current_user fonksiyonundan dönen
    kullanıcı nesnesinden kullanıcı ID'sini güvenli şekilde alır.
    """

    if isinstance(current_user, dict):
        user_id = current_user.get("id")

    elif isinstance(current_user, (tuple, list)):
        user_id = current_user[0] if current_user else None

    else:
        user_id = getattr(current_user, "id", None)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum açmış kullanıcı doğrulanamadı."
        )

    return user_id


# ============================================================
# ACTIVE CLIENTS
# ============================================================

@router.get("/my-active-clients")
def get_my_active_clients(
    current_user=Depends(
        RoleChecker(["trainer", "dietitian"])
    ),
    db=Depends(get_db_connection)
):
    """
    Giriş yapan uzmana aktif olarak abone olan danışanları getirir.

    Aynı danışanın aynı uzman altında birden fazla aktif
    specialist_subscriptions kaydı varsa:

    - Danışan yalnızca bir kez gösterilir.
    - En son oluşturulan aktif abonelik kullanılır.
    - Eski/rejected/inactive kayıtlar gösterilmez.
    """

    cursor = None

    try:
        current_user_id = get_current_user_id(
            current_user
        )

        cursor = db.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute(
            """
            SELECT
                client.id,
                client.first_name,
                client.last_name,
                client.email,
                client.goal,
                client.package_name,
                client.program_name
            FROM (
                SELECT DISTINCT ON (ss.client_id)
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    ss.goal,
                    ss.package_name,
                    ss.program_name,
                    ss.created_at,
                    ss.id AS subscription_id
                FROM specialist_subscriptions ss
                INNER JOIN users u
                    ON ss.client_id = u.id
                WHERE
                    ss.status = 'active'
                    AND ss.specialist_id = %s
                ORDER BY
                    ss.client_id,
                    ss.created_at DESC NULLS LAST,
                    ss.id DESC
            ) AS client
            ORDER BY
                client.first_name ASC,
                client.last_name ASC,
                client.id ASC
            """,
            (current_user_id,)
        )

        clients = cursor.fetchall()

        formatted_clients = []

        for client in clients:

            full_name = (
                f"{client.get('first_name') or ''} "
                f"{client.get('last_name') or ''}"
            ).strip()

            if not full_name:
                full_name = "Danışan"

            prog_names = client.get("program_name")
            if prog_names is None:
                prog_names = []
            elif isinstance(prog_names, str):
                prog_names = [prog_names] if prog_names.strip() else []

            formatted_clients.append({
                "id": client["id"],
                "full_name": full_name,
                "goal": (
                    client.get("goal")
                    or "Formu Korumak"
                ),
                "package": (
                    client.get("package_name")
                    or "Aylık PT Danışmanlığı"
                ),
                "program_name": prog_names
            })

        return {
            "clients": formatted_clients
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"[Expert Assignment] "
            f"Active clients error: {e}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Aktif danışanlar yüklenirken "
                "bir hata oluştu."
            )
        )

    finally:

        if cursor:
            cursor.close()


# ============================================================
# ASSIGN WORKOUT
# ============================================================

@router.post("/assign-workout")
def assign_workout_to_clients(
    data: AssignWorkoutRequest,
    current_user=Depends(
        RoleChecker(["trainer", "dietitian"])
    ),
    db=Depends(get_db_connection)
):
    """
    Seçilen antrenman şablonunu giriş yapan uzmanın
    aktif danışanlarına atar.

    İşlemler:

    1. Giriş yapan uzman doğrulanır.
    2. Workout template bulunur.
    3. Template'in trainer_id değeri giriş yapan uzmanla
       karşılaştırılır.
    4. Seçilen client_id değerlerinin gerçekten bu uzmana
       aktif aboneliği olduğu kontrol edilir.
    5. workout_programs kayıtları oluşturulur.
    6. İlgili specialist_subscriptions kayıtlarının
       program_name alanına yeni program dizi olarak eklenir.
    7. Tüm işlemler başarılıysa commit edilir.
    8. Herhangi bir hata olursa rollback yapılır.
    """

    cursor = None

    try:

        current_user_id = get_current_user_id(
            current_user
        )

        # ====================================================
        # REQUEST VALIDATION
        # ====================================================

        if not data.client_ids:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir danışan seçilmelidir."
            )

        if not data.assigned_days:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir antrenman günü seçilmelidir."
            )

        # Aynı danışanın request içerisinde birden
        # fazla kez gönderilmesini engelle.
        client_ids = list(
            dict.fromkeys(data.client_ids)
        )

        cursor = db.cursor(
            cursor_factory=RealDictCursor
        )

        # ====================================================
        # GET WORKOUT TEMPLATE
        # ====================================================

        cursor.execute(
            """
            SELECT
                id,
                trainer_id,
                name
            FROM workout_templates
            WHERE id = %s
            """,
            (data.template_id,)
        )

        template = cursor.fetchone()

        if not template:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Antrenman şablonu bulunamadı."
            )

        template_trainer_id = template.get(
            "trainer_id"
        )

        # ====================================================
        # TEMPLATE OWNERSHIP CHECK
        # ====================================================

        if template_trainer_id != current_user_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Bu antrenman şablonunu kullanma "
                    "yetkiniz bulunmamaktadır."
                )
            )

        template_name = (
            template.get("name")
            or "Antrenman Programı"
        )

        trainer_id = template_trainer_id

        # ====================================================
        # PROGRAM DETAILS
        # ====================================================

        program_details = {
            "assigned_days": data.assigned_days,
            "template_name": template_name
        }

        program_details_json = json.dumps(
            program_details,
            ensure_ascii=False
        )

        # ====================================================
        # VERIFY ACTIVE SUBSCRIPTIONS
        # ====================================================

        cursor.execute(
            """
            SELECT DISTINCT
                ss.client_id
            FROM specialist_subscriptions ss
            WHERE
                ss.specialist_id = %s
                AND ss.status = 'active'
                AND ss.client_id = ANY(%s)
            """,
            (
                current_user_id,
                client_ids
            )
        )

        active_subscription_rows = cursor.fetchall()

        active_client_ids = {
            row["client_id"]
            for row in active_subscription_rows
        }

        unauthorized_client_ids = [
            client_id
            for client_id in client_ids
            if client_id not in active_client_ids
        ]

        if unauthorized_client_ids:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Seçilen danışanlardan bazıları "
                    "bu uzmana aktif olarak abone değil."
                )
            )

        # ====================================================
        # ASSIGN WORKOUT
        # ====================================================

        assigned_count = 0

        for client_id in client_ids:

            # ------------------------------------------------
            # WORKOUT PROGRAM
            # ------------------------------------------------

            cursor.execute(
                """
                INSERT INTO workout_programs
                (
                    client_id,
                    trainer_id,
                    template_id,
                    program_details,
                    status,
                    created_at,
                    updated_at
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    'active',
                    NOW(),
                    NOW()
                )
                """,
                (
                    client_id,
                    trainer_id,
                    data.template_id,
                    program_details_json
                )
            )

            # ------------------------------------------------
            # SPECIALIST SUBSCRIPTION (ARRAY APPEND)
            # ------------------------------------------------

            cursor.execute(
                """
                UPDATE specialist_subscriptions
                SET
                    program_name = CASE
                        WHEN program_name IS NULL THEN ARRAY[%s]::text[]
                        WHEN NOT (%s = ANY(program_name)) THEN ARRAY_APPEND(program_name, %s)
                        ELSE program_name
                    END,
                    updated_at = NOW()
                WHERE
                    client_id = %s
                    AND specialist_id = %s
                    AND status = 'active'
                """,
                (
                    template_name,
                    template_name,
                    template_name,
                    client_id,
                    current_user_id
                )
            )

            assigned_count += 1

        # ====================================================
        # COMMIT
        # ====================================================

        db.commit()

        return {
            "success": True,
            "message": (
                f"Antrenman {assigned_count} danışana "
                "başarıyla atandı."
            ),
            "assigned_days": data.assigned_days,
            "program_name": template_name
        }

    except HTTPException:

        db.rollback()
        raise

    except Exception as e:

        db.rollback()

        print(
            f"[Expert Assignment] "
            f"Workout assignment error: {e}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Antrenman ataması sırasında "
                "bir hata oluştu."
            )
        )

    finally:

        if cursor:
            cursor.close()