import json
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
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
    template_id: Optional[int] = Field(default=None, description="Şablon ID")
    diet_template_id: Optional[int] = Field(default=None, description="Diyet Şablon ID")
    client_ids: Optional[List[int]] = Field(default=None, description="Danışan ID listesi")
    client_id: Optional[int] = Field(default=None, description="Tekil danışan ID'si")
    assigned_days: List[str] = Field(default_factory=list, description="Seçilen uygulama günleri")


# ============================================================
# HELPER
# ============================================================

def map_to_day_id(val: Any) -> Optional[str]:
    """
    Gelen gün ifadesini standart 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz' formatına dönüştürür.
    """
    if not val:
        return None
    s = str(val).strip().lower()
    if s == 'pzt' or s.startswith('pazartesi'):
        return 'Pzt'
    if s == 'sal' or s.startswith('salı') or s.startswith('sali'):
        return 'Sal'
    if s == 'çar' or s == 'car' or s.startswith('çarşamba') or s.startswith('carsamba'):
        return 'Çar'
    if s == 'per' or s.startswith('perşembe') or s.startswith('persembe'):
        return 'Per'
    if s == 'cum' or s == 'cuma':
        return 'Cum'
    if s == 'cmt' or s.startswith('cumartesi'):
        return 'Cmt'
    if s == 'paz' or s.startswith('pazar'):
        return 'Paz'
    return None


def get_current_user_id(current_user) -> int:
    """
    auth.py içerisindeki get_current_user fonksiyonundan dönen
    kullanıcı nesnesinden kullanıcı ID'sini güvenli şekilde ve tamsayı olarak alır.
    """
    user_id = None

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

    try:
        return int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı kimlik formatı geçersiz."
        )


# ============================================================
# ACTIVE CLIENTS
# ============================================================

@router.get("/my-active-clients")
def get_my_active_clients(
    current_user=Depends(
        RoleChecker(["trainer", "dietitian", "TRAINER", "DIETITIAN"])
    ),
    db=Depends(get_db_connection)
):
    """
    Giriş yapan uzmana aktif olarak abone olan danışanları getirir.
    """

    cursor = None

    try:
        current_user_id = get_current_user_id(current_user)

        cursor = db.cursor(cursor_factory=RealDictCursor)

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

        clients = cursor.fetchall() or []
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
                "goal": client.get("goal") or "Formu Korumak",
                "package": client.get("package_name") or "Aylık PT Danışmanlığı",
                "program_name": prog_names
            })

        return {"clients": formatted_clients}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Expert Assignment] Active clients error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Aktif danışanlar yüklenirken bir hata oluştu."
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
        RoleChecker(["trainer", "dietitian", "TRAINER", "DIETITIAN"])
    ),
    db=Depends(get_db_connection)
):
    """
    Seçilen antrenman şablonunu giriş yapan uzmanın aktif danışanlarına atar.
    """

    cursor = None

    try:
        current_user_id = get_current_user_id(current_user)

        raw_client_ids = []
        if data.client_ids and isinstance(data.client_ids, list):
            raw_client_ids.extend(data.client_ids)
        if data.client_id is not None:
            raw_client_ids.append(data.client_id)

        if not raw_client_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir danışan seçilmelidir."
            )

        if not data.assigned_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir antrenman günü seçilmelidir."
            )

        client_ids = []
        for cid in raw_client_ids:
            try:
                val = int(cid)
                if val not in client_ids:
                    client_ids.append(val)
            except (ValueError, TypeError):
                continue

        if not client_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçersiz danışan ID'si gönderildi."
            )

        template_id = data.template_id or data.diet_template_id
        if not template_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Şablon ID bilgisi eksik."
            )

        cursor = db.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT id, trainer_id, name
            FROM workout_templates
            WHERE id = %s
            """,
            (template_id,)
        )

        template = cursor.fetchone()
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Antrenman şablonu bulunamadı."
            )

        raw_template_trainer_id = template.get("trainer_id")
        template_trainer_id = None
        if raw_template_trainer_id is not None:
            try:
                template_trainer_id = int(raw_template_trainer_id)
            except (ValueError, TypeError):
                template_trainer_id = None

        if template_trainer_id is not None and template_trainer_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu antrenman şablonunu kullanma yetkiniz bulunmamaktadır."
            )

        template_name = template.get("name") or "Antrenman Programı"
        trainer_id = template_trainer_id or current_user_id

        program_details = {
            "assigned_days": data.assigned_days,
            "template_name": template_name
        }
        program_details_json = json.dumps(program_details, ensure_ascii=False)

        cursor.execute(
            """
            SELECT DISTINCT ss.client_id
            FROM specialist_subscriptions ss
            WHERE ss.specialist_id = %s
              AND ss.status = 'active'
              AND ss.client_id = ANY(%s)
            """,
            (current_user_id, client_ids)
        )

        active_subscription_rows = cursor.fetchall() or []
        active_client_ids = {
            int(row["client_id"])
            for row in active_subscription_rows
            if row.get("client_id") is not None
        }

        unauthorized_client_ids = [cid for cid in client_ids if cid not in active_client_ids]
        if unauthorized_client_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seçilen danışanlardan bazıları bu uzmana aktif olarak abone değil."
            )

        assigned_count = 0
        for cid in client_ids:
            cursor.execute(
                """
                INSERT INTO workout_programs
                (client_id, trainer_id, template_id, program_details, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, 'active', NOW(), NOW())
                """,
                (cid, trainer_id, template_id, program_details_json)
            )

            cursor.execute(
                """
                UPDATE specialist_subscriptions
                SET
                    program_name = CASE
                        WHEN program_name IS NULL THEN ARRAY[%s]::text[]
                        WHEN NOT (%s = ANY(program_name::text[])) THEN ARRAY_APPEND(program_name::text[], %s)
                        ELSE program_name
                    END,
                    updated_at = NOW()
                WHERE client_id = %s
                  AND specialist_id = %s
                  AND status = 'active'
                """,
                (template_name, template_name, template_name, cid, current_user_id)
            )
            assigned_count += 1

        db.commit()

        return {
            "success": True,
            "message": f"Antrenman {assigned_count} danışana başarıyla atandı.",
            "assigned_days": data.assigned_days,
            "program_name": template_name
        }

    except HTTPException:
        if db:
            db.rollback()
        raise
    except Exception as e:
        if db:
            db.rollback()
        print(f"[Expert Assignment] Workout assignment error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Antrenman ataması sırasında bir hata oluştu."
        )
    finally:
        if cursor:
            cursor.close()


# ============================================================
# ASSIGN DIET
# ============================================================

# ============================================================
# ASSIGN DIET
# ============================================================

@router.post("/assign-diet")
def assign_diet_to_clients(
    data: AssignWorkoutRequest,
    current_user=Depends(
        RoleChecker(["dietitian", "DIETITIAN", "trainer", "TRAINER"])
    ),
    db=Depends(get_db_connection)
):
    """
    Seçilen diyet şablonunu tüm öğün ve gün detaylarıyla birlikte
    uzmanın aktif danışanlarına atar.
    """
    cursor = None

    try:
        current_user_id = get_current_user_id(current_user)

        raw_client_ids = []
        if data.client_ids and isinstance(data.client_ids, list):
            raw_client_ids.extend(data.client_ids)
        if data.client_id is not None:
            raw_client_ids.append(data.client_id)

        if not raw_client_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir danışan seçilmelidir."
            )

        client_ids = list(set([int(cid) for cid in raw_client_ids if str(cid).isdigit()]))

        diet_template_id = data.diet_template_id or data.template_id
        if not diet_template_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Diyet şablonu ID'si eksik."
            )

        cursor = db.cursor(cursor_factory=RealDictCursor)

        # 1. Diyet Şablonunu ve Öğün Detaylarını (day_types) Çek
        cursor.execute(
            """
            SELECT id, dietitian_id, title, goal, day_types, 
                   target_calories, target_protein_g, target_carbs_g, target_fat_g, general_notes
            FROM diet_templates
            WHERE id = %s
            """,
            (diet_template_id,)
        )
        diet_template = cursor.fetchone()

        if not diet_template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diyet şablonu bulunamadı."
            )

        # 2. Yetki Kontrolü
        template_dietitian_id = diet_template.get("dietitian_id")
        if template_dietitian_id is not None and int(template_dietitian_id) != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu diyet şablonunu kullanma yetkiniz bulunmamaktadır."
            )

        # 3. Danışanların Aktif Abonelik Kontrolü
        cursor.execute(
            """
            SELECT DISTINCT ss.client_id
            FROM specialist_subscriptions ss
            WHERE ss.specialist_id = %s
              AND ss.status = 'active'
              AND ss.client_id = ANY(%s)
            """,
            (current_user_id, client_ids)
        )
        active_subscription_rows = cursor.fetchall() or []
        active_client_ids = {int(row["client_id"]) for row in active_subscription_rows if row.get("client_id")}

        unauthorized_client_ids = [cid for cid in client_ids if cid not in active_client_ids]
        if unauthorized_client_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seçilen danışanlardan bazıları bu uzmana aktif olarak abone değil."
            )

        # 4. JSON verilerini (day_types, general_notes) Güvenli Parse Et
        day_types = diet_template.get("day_types")
        if isinstance(day_types, str):
            try:
                day_types = json.loads(day_types)
            except Exception:
                day_types = []
        elif day_types is None:
            day_types = []

        general_notes = diet_template.get("general_notes")
        if isinstance(general_notes, str):
            try:
                general_notes = json.loads(general_notes)
            except Exception:
                general_notes = []

        # Atanacak günlerin tespiti (Pzt, Sal vb.)
        assigned_days = data.assigned_days if data.assigned_days else []
        if not assigned_days and isinstance(day_types, list):
            for dt in day_types:
                day_name = dt.get("name") or dt.get("day") if isinstance(dt, dict) else str(dt)
                mapped = map_to_day_id(day_name)
                if mapped and mapped not in assigned_days:
                    assigned_days.append(mapped)

        if not assigned_days:
            assigned_days = ["Pzt"]

        # 5. Tam program_details Objesini Oluştur (Eski sistemdeki deneme diet 4 formatı ile birebir aynı)
        program_details = {
            "template_id": diet_template["id"],
            "template_title": diet_template.get("title") or "Diyet Planı",
            "goal": diet_template.get("goal") or "Sağlıklı Beslenme",
            "target_calories": diet_template.get("target_calories") or 0,
            "target_protein_g": float(diet_template.get("target_protein_g") or 0),
            "target_carbs_g": float(diet_template.get("target_carbs_g") or 0),
            "target_fat_g": float(diet_template.get("target_fat_g") or 0),
            "assigned_days": assigned_days,
            "day_types": day_types,
            "general_notes": general_notes,
            "assignment_notes": None,
            "start_date": None
        }

        program_details_json = json.dumps(program_details, ensure_ascii=False)

        # 6. Veritabanına Ekleme
        assigned_count = 0
        for cid in client_ids:
            cursor.execute(
                """
                INSERT INTO nutrition_programs
                (client_id, dietitian_id, diet_template_id, program_details, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                """,
                (cid, current_user_id, diet_template_id, program_details_json)
            )

            template_title = diet_template.get("title") or "Diyet Planı"
            cursor.execute(
                """
                UPDATE specialist_subscriptions
                SET
                    program_name = CASE
                        WHEN program_name IS NULL THEN ARRAY[%s]::text[]
                        WHEN NOT (%s = ANY(program_name::text[])) THEN ARRAY_APPEND(program_name::text[], %s)
                        ELSE program_name
                    END,
                    updated_at = NOW()
                WHERE client_id = %s
                  AND specialist_id = %s
                  AND status = 'active'
                """,
                (template_title, template_title, template_title, cid, current_user_id)
            )
            assigned_count += 1

        db.commit()

        return {
            "success": True,
            "message": f"Diyet planı {assigned_count} danışana başarıyla atandı.",
            "assigned_days": assigned_days,
            "program_name": diet_template.get("title")
        }

    except HTTPException:
        if db:
            db.rollback()
        raise
    except Exception as e:
        if db:
            db.rollback()
        print(f"[Expert Assignment] Diet assignment error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diyet ataması sırasında bir hata oluştu: {str(e)}"
        )
    finally:
        if cursor:
            cursor.close()