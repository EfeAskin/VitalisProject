import os
import json
import traceback
from datetime import datetime, timezone
from typing import Optional, List, Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

# database.py dosyasındaki doğru fonksiyon içe aktarılıyor
try:
    from backend.database import get_db_connection
except ModuleNotFoundError:
    from database import get_db_connection


router = APIRouter(
    prefix="/api/expert",
    tags=["Expert Programs"]
)


# ============================================================
# DOSYA YÜKLEME DİZİNİ
# ============================================================

UPLOAD_DIR = os.path.join(
    "static",
    "uploads",
    "exercises"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ============================================================
# YARDIMCI FONKSİYONLAR
# ============================================================

def safe_int(
    val: Any,
    default: int = 0
) -> int:
    """
    Güvenli tamsayı dönüştürücü.
    """

    if val is None:
        return default

    try:
        val_str = str(val).strip()

        if not val_str:
            return default

        return int(float(val_str))

    except (
        ValueError,
        TypeError
    ):
        return default


def validate_difficulty(
    level_str: Optional[str]
) -> str:
    """
    Frontend'den gelen zorluk seviyesini
    güvenli ve tutarlı şekilde normalize eder.

    Frontend değerleri:
        Başlangıç
        Orta Seviye
        İleri Seviye
        Elit Atlet

    Eski / alternatif değerler:
        Orta
        İleri
        Elit
    """

    if level_str is None:
        return "Başlangıç"

    cleaned = (
        str(level_str)
        .strip()
    )

    if not cleaned:
        return "Başlangıç"

    normalized = (
        cleaned
        .lower()
        .replace("ı", "i")
        .replace("İ", "i")
        .strip()
    )

    difficulty_map = {
        "başlangıç": "Başlangıç",
        "baslangic": "Başlangıç",

        "orta": "Orta",
        "orta seviye": "Orta",

        "ileri": "İleri",
        "ileri seviye": "İleri",

        "elit": "Elit Atlet",
        "elit atlet": "Elit Atlet"
    }

    return difficulty_map.get(
        normalized,
        "Başlangıç"
    )


def parse_json_list(
    raw_val: Any
) -> list:
    """
    Form verisinden gelen JSON veya list
    yapılarını güvenli şekilde liste tipine dönüştürür.
    """

    if not raw_val:
        return []

    if isinstance(
        raw_val,
        list
    ):
        return raw_val

    if isinstance(
        raw_val,
        str
    ):
        try:
            parsed = json.loads(
                raw_val
            )

            return (
                parsed
                if isinstance(
                    parsed,
                    list
                )
                else []
            )

        except Exception:
            return []

    return []


def get_val(
    item,
    key,
    idx=0
):
    """
    Hem RealDictRow/dict hem de tuple/list
    veri tiplerini destekleyen esnek değer çekici.
    """

    if isinstance(
        item,
        dict
    ):
        return item.get(key)

    if hasattr(
        item,
        key
    ):
        return getattr(
            item,
            key
        )

    return (
        item[idx]
        if isinstance(
            item,
            (list, tuple)
        )
        and len(item) > idx
        else None
    )


def row_to_dict(
    row,
    columns
):
    """
    Normal tuple cursor veya RealDictCursor
    kullanılsa bile satırı güvenli şekilde dict'e çevirir.
    """

    if row is None:
        return {}

    if isinstance(
        row,
        dict
    ):
        return dict(row)

    result = {}

    for index, column in enumerate(
        columns
    ):
        result[column] = (
            row[index]
            if len(row) > index
            else None
        )

    return result


# ============================================================
# ŞABLON KAYDETME / GÜNCELLEME
# ============================================================

async def process_template_save(
    request: Request,
    db,
    template_id: Optional[int] = None
) -> int:
    """
    psycopg2 bağlantısı kullanarak şablon ekleme/güncelleme işlemini gerçekleştirir.
    """

    try:
        form_data = await request.form()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Form verisi okunamadı. "
                "Content-Type 'multipart/form-data' olmalıdır: "
                f"{str(e)}"
            )
        )

    # ========================================================
    # TEMEL FORM VERİLERİ
    # ========================================================

    title = str(
        form_data.get("title")
        or "Antrenman Şablonu"
    ).strip()

    # KRİTİK:
    # Frontend'den gelen Orta Seviye / İleri Seviye /
    # Elit Atlet artık Başlangıç'a düşmeyecek.
    level = validate_difficulty(
        form_data.get("level")
    )

    duration = safe_int(
        form_data.get("duration"),
        45
    )

    # ========================================================
    # KALORİ
    # ========================================================

    estimated_calories_raw = (
        form_data.get(
            "estimated_calories"
        )
        if form_data.get(
            "estimated_calories"
        ) is not None
        else form_data.get(
            "estimatedCalories"
        )
    )

    if estimated_calories_raw is None:
        estimated_calories_raw = (
            form_data.get(
                "calories"
            )
        )

    if estimated_calories_raw is None:
        estimated_calories_raw = (
            form_data.get(
                "kcal"
            )
        )

    estimated_calories = safe_int(
        estimated_calories_raw,
        0
    )

    # Negatif kalori engeli
    if estimated_calories < 0:
        estimated_calories = 0

    # ========================================================
    # TRAINER
    # ========================================================

    raw_trainer_id = (
        form_data.get(
            "trainer_id"
        )
    )

    trainer_id = (
        safe_int(
            raw_trainer_id,
            4
        )
        if raw_trainer_id is not None
        else 4
    )

    # ========================================================
    # TARGET MUSCLES
    # ========================================================

    target_muscles_raw = (
        form_data.get(
            "targetMuscles"
        )
        or form_data.get(
            "target_muscles"
        )
        or "[]"
    )

    target_muscles = parse_json_list(
        target_muscles_raw
    )

    target_muscles = [
        str(m).strip()
        for m in target_muscles
        if str(m).strip()
    ]

    # ========================================================
    # EXERCISES
    # ========================================================

    exercises_raw = form_data.get(
        "exercises",
        "[]"
    )

    exercises_list = parse_json_list(
        exercises_raw
    )

    # ========================================================
    # DESCRIPTION
    # ========================================================

    description_form = (
        form_data.get(
            "description"
        )
    )

    if (
        description_form
        and str(
            description_form
        ).strip()
    ):
        description_str = (
            str(
                description_form
            ).strip()
        )

    elif target_muscles:
        description_str = (
            "Hedef Kaslar: "
            + ", ".join(
                target_muscles
            )
        )

    else:
        description_str = None

    # ========================================================
    # DOSYALARI ÖNCEDEN OKU
    # ========================================================

    file_contents = {}

    for idx in range(
        len(exercises_list)
    ):
        file_key = (
            f"exercise_file_{idx}"
        )

        uploaded_file = (
            form_data.get(
                file_key
            )
        )

        if (
            uploaded_file
            and hasattr(
                uploaded_file,
                "filename"
            )
            and uploaded_file.filename
        ):
            content = (
                await uploaded_file.read()
            )

            file_contents[idx] = (
                uploaded_file.filename,
                content
            )

    # ========================================================
    # DATABASE
    # ========================================================

    with db.cursor() as cur:

        # ----------------------------------------------------
        # 1. ŞABLON EKLEME / GÜNCELLEME
        # ----------------------------------------------------

        if template_id:

            cur.execute(
                """
                SELECT id
                FROM workout_templates
                WHERE id = %s;
                """,
                (
                    template_id,
                )
            )

            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        f"{template_id} ID'li "
                        "şablon bulunamadı."
                    )
                )

            cur.execute(
                """
                UPDATE workout_templates
                SET
                    name = %s,
                    difficulty_level = %s,
                    target_muscles = %s,
                    duration_minutes = %s,
                    description = %s,
                    trainer_id = %s,
                    estimated_calories = %s
                WHERE id = %s;
                """,
                (
                    title,
                    level,
                    target_muscles,
                    duration,
                    description_str,
                    trainer_id,
                    estimated_calories,
                    template_id
                )
            )

            # Eski ilişkileri temizle
            cur.execute(
                """
                DELETE FROM workout_template_exercises
                WHERE template_id = %s;
                """,
                (
                    template_id,
                )
            )

            saved_id = template_id

        else:

            cur.execute(
                """
                INSERT INTO workout_templates
                (
                    trainer_id,
                    name,
                    difficulty_level,
                    target_muscles,
                    duration_minutes,
                    description,
                    estimated_calories
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                RETURNING id;
                """,
                (
                    trainer_id,
                    title,
                    level,
                    target_muscles,
                    duration,
                    description_str,
                    estimated_calories
                )
            )

            res = cur.fetchone()

            saved_id = (
                res["id"]
                if isinstance(
                    res,
                    dict
                )
                else res[0]
            )

        # ----------------------------------------------------
        # 2. EGZERSİZ KÜTÜPHANESİ VE İLİŞKİLER
        # ----------------------------------------------------

        for idx, ex_data in enumerate(
            exercises_list
        ):

            if not isinstance(
                ex_data,
                dict
            ):
                continue

            ex_name = str(
                ex_data.get(
                    "name",
                    ""
                )
            ).strip()

            if not ex_name:
                ex_name = (
                    f"Egzersiz {idx + 1}"
                )

            sets_val = safe_int(
                ex_data.get(
                    "sets"
                ),
                3
            )

            reps_val = str(
                ex_data.get(
                    "reps"
                )
                or "12"
            ).strip()

            ex_notes = str(
                ex_data.get(
                    "notes",
                    ""
                )
            ).strip() or None

            media_type = (
                ex_data.get(
                    "mediaType",
                    "none"
                )
            )

            media_link = str(
                ex_data.get(
                    "mediaLink",
                    ""
                )
            ).strip()

            video_url = None

            # ------------------------------------------------
            # DOSYA
            # ------------------------------------------------

            if idx in file_contents:

                filename, content = (
                    file_contents[idx]
                )

                file_ext = (
                    os.path.splitext(
                        filename
                    )[1]
                    or ".mp4"
                )

                timestamp = int(
                    datetime.now(
                        timezone.utc
                    ).timestamp()
                )

                file_name = (
                    f"ex_{saved_id}_"
                    f"{idx}_"
                    f"{timestamp}"
                    f"{file_ext}"
                )

                file_path = os.path.join(
                    UPLOAD_DIR,
                    file_name
                )

                with open(
                    file_path,
                    "wb"
                ) as buffer:
                    buffer.write(
                        content
                    )

                video_url = (
                    "/static/uploads/"
                    "exercises/"
                    + file_name
                )

            elif (
                media_type == "youtube"
                and media_link
            ):
                video_url = (
                    media_link
                )

            # ------------------------------------------------
            # EGZERSİZ KONTROLÜ
            # ------------------------------------------------

            cur.execute(
                """
                SELECT
                    id,
                    video_url
                FROM exercises
                WHERE LOWER(name) = LOWER(%s);
                """,
                (
                    ex_name,
                )
            )

            existing_ex = (
                cur.fetchone()
            )

            if not existing_ex:

                primary_muscle = (
                    target_muscles[0]
                    if target_muscles
                    else "Genel"
                )

                cur.execute(
                    """
                    INSERT INTO exercises
                    (
                        name,
                        muscle_group,
                        target_muscles,
                        difficulty_level,
                        video_url,
                        trainer_id
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    RETURNING id;
                    """,
                    (
                        ex_name,
                        primary_muscle,
                        target_muscles,
                        level,
                        video_url,
                        trainer_id
                    )
                )

                ex_res = (
                    cur.fetchone()
                )

                ex_id = (
                    ex_res["id"]
                    if isinstance(
                        ex_res,
                        dict
                    )
                    else ex_res[0]
                )

            else:

                ex_id = (
                    existing_ex["id"]
                    if isinstance(
                        existing_ex,
                        dict
                    )
                    else existing_ex[0]
                )

                existing_video = (
                    existing_ex[
                        "video_url"
                    ]
                    if isinstance(
                        existing_ex,
                        dict
                    )
                    else existing_ex[1]
                )

                if (
                    video_url
                    and not existing_video
                ):
                    cur.execute(
                        """
                        UPDATE exercises
                        SET video_url = %s
                        WHERE id = %s;
                        """,
                        (
                            video_url,
                            ex_id
                        )
                    )

            # ------------------------------------------------
            # TEMPLATE - EXERCISE İLİŞKİSİ
            # ------------------------------------------------

            cur.execute(
                """
                INSERT INTO workout_template_exercises
                (
                    template_id,
                    exercise_id,
                    sets,
                    reps,
                    notes,
                    order_index
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                );
                """,
                (
                    saved_id,
                    ex_id,
                    sets_val,
                    reps_val,
                    ex_notes,
                    idx
                )
            )

    # ========================================================
    # COMMIT
    # ========================================================

    db.commit()

    return saved_id


# ============================================================
# POST
# ============================================================

@router.post(
    "/workout-templates",
    status_code=status.HTTP_201_CREATED
)
async def create_workout_template(
    request: Request,
    db=Depends(get_db_connection)
):
    """
    Yeni bir antrenman şablonu oluşturur.
    """

    try:

        saved_id = (
            await process_template_save(
                request,
                db
            )
        )

        return {
            "success": True,
            "message": (
                "Antrenman şablonu "
                "başarıyla oluşturuldu."
            ),
            "id": saved_id
        }

    except HTTPException:

        db.rollback()
        raise

    except Exception as e:

        db.rollback()

        print(
            "\n=== BACKEND HATA DETAYI "
            "(POST /workout-templates) ==="
        )

        traceback.print_exc()

        print(
            "=====================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Sunucu Hatası: {str(e)}"
            )
        )


# ============================================================
# PUT
# ============================================================

@router.put(
    "/workout-templates/{template_id}",
    status_code=status.HTTP_200_OK
)
async def update_workout_template(
    template_id: int,
    request: Request,
    db=Depends(get_db_connection)
):
    """
    Mevcut bir antrenman şablonunu günceller.
    """

    try:

        saved_id = (
            await process_template_save(
                request,
                db,
                template_id=template_id
            )
        )

        return {
            "success": True,
            "message": (
                "Antrenman şablonu "
                "başarıyla güncellendi."
            ),
            "id": saved_id
        }

    except HTTPException:

        db.rollback()
        raise

    except Exception as e:

        db.rollback()

        print(
            f"\n=== BACKEND HATA DETAYI "
            f"(PUT /workout-templates/{template_id}) ==="
        )

        traceback.print_exc()

        print(
            "=====================================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Sunucu Hatası: {str(e)}"
            )
        )


# ============================================================
# GET - TÜM ŞABLONLAR
# ============================================================

@router.get(
    "/workout-templates",
    status_code=status.HTTP_200_OK
)
def get_workout_templates(
    trainer_id: Optional[int] = None,
    db=Depends(get_db_connection)
):
    """
    Tüm antrenman şablonlarını ve
    altındaki egzersizleri listeler.

    ÖNEMLİ:
    SELECT * + sabit kolon indexleri yerine
    kolonlar açıkça seçiliyor.
    Böylece estimated_calories yanlış kolondan
    okunmaz.
    """

    try:

        with db.cursor() as cur:

            # ------------------------------------------------
            # TEMPLATE
            # ------------------------------------------------

            if trainer_id:

                cur.execute(
                    """
                    SELECT
                        id,
                        trainer_id,
                        name,
                        difficulty_level,
                        target_muscles,
                        duration_minutes,
                        description,
                        created_at,
                        estimated_calories
                    FROM workout_templates
                    WHERE trainer_id = %s
                    ORDER BY id DESC;
                    """,
                    (
                        trainer_id,
                    )
                )

            else:

                cur.execute(
                    """
                    SELECT
                        id,
                        trainer_id,
                        name,
                        difficulty_level,
                        target_muscles,
                        duration_minutes,
                        description,
                        created_at,
                        estimated_calories
                    FROM workout_templates
                    ORDER BY id DESC;
                    """
                )

            raw_templates = (
                cur.fetchall()
            )

            formatted_templates = []

            for t in raw_templates:

                template = row_to_dict(
                    t,
                    [
                        "id",
                        "trainer_id",
                        "name",
                        "difficulty_level",
                        "target_muscles",
                        "duration_minutes",
                        "description",
                        "created_at",
                        "estimated_calories"
                    ]
                )

                t_id = template.get(
                    "id"
                )

                # ------------------------------------------------
                # TEMPLATE EGZERSİZLERİ
                # ------------------------------------------------

                cur.execute(
                    """
                    SELECT
                        wte.id AS relation_id,
                        e.id AS exercise_id,
                        e.name,
                        e.muscle_group,
                        e.target_muscles,
                        e.difficulty_level,
                        e.video_url,
                        e.description AS exercise_description,
                        wte.sets,
                        wte.reps,
                        wte.notes,
                        wte.order_index
                    FROM workout_template_exercises wte
                    JOIN exercises e
                        ON wte.exercise_id = e.id
                    WHERE wte.template_id = %s
                    ORDER BY wte.order_index ASC;
                    """,
                    (
                        t_id,
                    )
                )

                raw_exercises = (
                    cur.fetchall()
                )

                exercises_list = []

                for ex in raw_exercises:

                    ex_dict = row_to_dict(
                        ex,
                        [
                            "relation_id",
                            "exercise_id",
                            "name",
                            "muscle_group",
                            "target_muscles",
                            "difficulty_level",
                            "video_url",
                            "exercise_description",
                            "sets",
                            "reps",
                            "notes",
                            "order_index"
                        ]
                    )

                    exercises_list.append(
                        {
                            "relation_id":
                                ex_dict.get(
                                    "relation_id"
                                ),

                            "exercise_id":
                                ex_dict.get(
                                    "exercise_id"
                                ),

                            "name":
                                ex_dict.get(
                                    "name"
                                ),

                            "muscle_group":
                                ex_dict.get(
                                    "muscle_group"
                                ),

                            "target_muscles":
                                ex_dict.get(
                                    "target_muscles"
                                ),

                            "difficulty_level":
                                ex_dict.get(
                                    "difficulty_level"
                                ),

                            "video_url":
                                ex_dict.get(
                                    "video_url"
                                ),

                            "exercise_description":
                                ex_dict.get(
                                    "exercise_description"
                                ),

                            "sets":
                                ex_dict.get(
                                    "sets"
                                ),

                            "reps":
                                ex_dict.get(
                                    "reps"
                                ),

                            "notes":
                                ex_dict.get(
                                    "notes"
                                ),

                            "order_index":
                                ex_dict.get(
                                    "order_index"
                                )
                        }
                    )

                # ------------------------------------------------
                # TEMPLATE RESPONSE
                # ------------------------------------------------

                formatted_templates.append(
                    {
                        "id":
                            template.get(
                                "id"
                            ),

                        "trainer_id":
                            template.get(
                                "trainer_id"
                            ),

                        "name":
                            template.get(
                                "name"
                            ),

                        "difficulty_level":
                            template.get(
                                "difficulty_level"
                            ),

                        "target_muscles":
                            template.get(
                                "target_muscles"
                            ),

                        "duration_minutes":
                            template.get(
                                "duration_minutes"
                            ),

                        "description":
                            template.get(
                                "description"
                            ),

                        "created_at":
                            (
                                str(
                                    template.get(
                                        "created_at"
                                    )
                                )
                                if template.get(
                                    "created_at"
                                )
                                else None
                            ),

                        "estimated_calories":
                            safe_int(
                                template.get(
                                    "estimated_calories"
                                ),
                                0
                            ),

                        "exercises":
                            exercises_list
                    }
                )

        return {
            "success": True,
            "count": len(
                formatted_templates
            ),
            "templates":
                formatted_templates,
            "data":
                formatted_templates
        }

    except Exception as e:

        print(
            "\n=== BACKEND HATA DETAYI "
            "(GET /workout-templates) ==="
        )

        traceback.print_exc()

        print(
            "===================================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Şablonlar getirilirken "
                f"hata oluştu: {str(e)}"
            )
        )


# ============================================================
# GET - TEK ŞABLON DETAYI
# ============================================================

@router.get(
    "/workout-templates/{template_id}",
    status_code=status.HTTP_200_OK
)
def get_workout_template_detail(
    template_id: int,
    db=Depends(get_db_connection)
):
    """
    Belirli bir şablonun detaylarını
    ve egzersizlerini getirir.
    """

    try:

        with db.cursor() as cur:

            # ------------------------------------------------
            # TEMPLATE
            # ------------------------------------------------

            cur.execute(
                """
                SELECT
                    id,
                    trainer_id,
                    name,
                    difficulty_level,
                    target_muscles,
                    duration_minutes,
                    description,
                    created_at,
                    estimated_calories
                FROM workout_templates
                WHERE id = %s;
                """,
                (
                    template_id,
                )
            )

            template_row = (
                cur.fetchone()
            )

            if not template_row:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        "Şablon bulunamadı."
                    )
                )

            template = row_to_dict(
                template_row,
                [
                    "id",
                    "trainer_id",
                    "name",
                    "difficulty_level",
                    "target_muscles",
                    "duration_minutes",
                    "description",
                    "created_at",
                    "estimated_calories"
                ]
            )

            # ------------------------------------------------
            # EXERCISES
            # ------------------------------------------------

            cur.execute(
                """
                SELECT
                    wte.id AS relation_id,
                    e.id AS exercise_id,
                    e.name,
                    e.muscle_group,
                    e.target_muscles,
                    e.difficulty_level,
                    e.video_url,
                    e.description AS exercise_description,
                    wte.sets,
                    wte.reps,
                    wte.notes,
                    wte.order_index
                FROM workout_template_exercises wte
                JOIN exercises e
                    ON wte.exercise_id = e.id
                WHERE wte.template_id = %s
                ORDER BY wte.order_index ASC;
                """,
                (
                    template_id,
                )
            )

            exercises_detail = (
                cur.fetchall()
            )

        exercises = []

        for ex in exercises_detail:

            ex_dict = row_to_dict(
                ex,
                [
                    "relation_id",
                    "exercise_id",
                    "name",
                    "muscle_group",
                    "target_muscles",
                    "difficulty_level",
                    "video_url",
                    "exercise_description",
                    "sets",
                    "reps",
                    "notes",
                    "order_index"
                ]
            )

            exercises.append(
                {
                    "relation_id":
                        ex_dict.get(
                            "relation_id"
                        ),

                    "exercise_id":
                        ex_dict.get(
                            "exercise_id"
                        ),

                    "name":
                        ex_dict.get(
                            "name"
                        ),

                    "muscle_group":
                        ex_dict.get(
                            "muscle_group"
                        ),

                    "target_muscles":
                        ex_dict.get(
                            "target_muscles"
                        ),

                    "difficulty_level":
                        ex_dict.get(
                            "difficulty_level"
                        ),

                    "video_url":
                        ex_dict.get(
                            "video_url"
                        ),

                    "exercise_description":
                        ex_dict.get(
                            "exercise_description"
                        ),

                    "sets":
                        ex_dict.get(
                            "sets"
                        ),

                    "reps":
                        ex_dict.get(
                            "reps"
                        ),

                    "notes":
                        ex_dict.get(
                            "notes"
                        ),

                    "order_index":
                        ex_dict.get(
                            "order_index"
                        )
                }
            )

        return {
            "success": True,

            "template": {
                "id":
                    template.get(
                        "id"
                    ),

                "trainer_id":
                    template.get(
                        "trainer_id"
                    ),

                "name":
                    template.get(
                        "name"
                    ),

                "difficulty_level":
                    template.get(
                        "difficulty_level"
                    ),

                "target_muscles":
                    template.get(
                        "target_muscles"
                    ),

                "duration_minutes":
                    template.get(
                        "duration_minutes"
                    ),

                "description":
                    template.get(
                        "description"
                    ),

                "created_at":
                    (
                        str(
                            template.get(
                                "created_at"
                            )
                        )
                        if template.get(
                            "created_at"
                        )
                        else None
                    ),

                "estimated_calories":
                    safe_int(
                        template.get(
                            "estimated_calories"
                        ),
                        0
                    ),

                "exercises":
                    exercises
            }
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"\n=== BACKEND HATA DETAYI "
            f"(GET /workout-templates/{template_id}) ==="
        )

        traceback.print_exc()

        print(
            "==========================================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Şablon detayı alınırken "
                f"hata oluştu: {str(e)}"
            )
        )


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/workout-templates/{template_id}",
    status_code=status.HTTP_200_OK
)
def delete_workout_template(
    template_id: int,
    db=Depends(get_db_connection)
):
    """
    Bir antrenman şablonunu siler.
    """

    try:

        with db.cursor() as cur:

            cur.execute(
                """
                SELECT id
                FROM workout_templates
                WHERE id = %s;
                """,
                (
                    template_id,
                )
            )

            if not cur.fetchone():

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        "Silinecek şablon "
                        "bulunamadı."
                    )
                )

            cur.execute(
                """
                DELETE FROM workout_template_exercises
                WHERE template_id = %s;
                """,
                (
                    template_id,
                )
            )

            cur.execute(
                """
                DELETE FROM workout_templates
                WHERE id = %s;
                """,
                (
                    template_id,
                )
            )

        db.commit()

        return {
            "success": True,
            "message": (
                f"{template_id} ID'li şablon "
                "başarıyla silindi."
            )
        }

    except HTTPException:

        db.rollback()
        raise

    except Exception as e:

        db.rollback()

        print(
            f"\n=== BACKEND HATA DETAYI "
            f"(DELETE /workout-templates/{template_id}) ==="
        )

        traceback.print_exc()

        print(
            "=============================================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Şablon silinirken hata oluştu: "
                f"{str(e)}"
            )
        )


# ============================================================
# GET - EXERCISE LIBRARY
# ============================================================

@router.get(
    "/exercises",
    status_code=status.HTTP_200_OK
)
def get_exercise_library(
    muscle_group: Optional[str] = None,
    db=Depends(get_db_connection)
):
    """
    Egzersiz kütüphanesini listeler.
    """

    try:

        with db.cursor() as cur:

            if muscle_group:

                cur.execute(
                    """
                    SELECT *
                    FROM exercises
                    WHERE muscle_group ILIKE %s
                    ORDER BY name ASC;
                    """,
                    (
                        f"%{muscle_group}%",
                    )
                )

            else:

                cur.execute(
                    """
                    SELECT *
                    FROM exercises
                    ORDER BY name ASC;
                    """
                )

            exercises = (
                cur.fetchall()
            )

        return {
            "success": True,
            "count": len(
                exercises
            ),
            "data": exercises
        }

    except Exception as e:

        print(
            "\n=== BACKEND HATA DETAYI "
            "(GET /exercises) ==="
        )

        traceback.print_exc()

        print(
            "===========================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Egzersiz kütüphanesi "
                "getirilirken hata oluştu: "
                f"{str(e)}"
            )
        )