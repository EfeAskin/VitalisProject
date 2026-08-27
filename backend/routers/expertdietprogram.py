import json
import logging
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from psycopg2.extras import DictCursor

from backend.database import get_db_connection
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/expert-diet-program",
    tags=["Expert Diet Program"]
)


# =========================================================
# AUTH / AUTHORIZATION HELPERS
# =========================================================

def get_user_value(current_user, key, index=None):
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
    return get_user_value(current_user, "role", 1)


def parse_jsonb_field(val):
    if val is None:
        return []
    if isinstance(val, (list, dict)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return []
    return []


def calculate_day_types_totals(day_types: Any) -> Dict[str, float]:
    """
    JSONB day_types altındaki meals -> options -> items verilerini tarayarak
    toplam kalori ve makroları dinamik hesaplar.
    """
    totals = {
        "calculated_calories": 0.0,
        "calculated_protein_g": 0.0,
        "calculated_carbs_g": 0.0,
        "calculated_fat_g": 0.0
    }
    
    if not isinstance(day_types, list):
        return totals

    for day in day_types:
        if not isinstance(day, dict):
            continue
        meals = day.get("meals", [])
        if not isinstance(meals, list):
            continue

        for meal in meals:
            if not isinstance(meal, dict):
                continue
            
            # 1. Yöntem: meal.options -> items yapısı
            options = meal.get("options", [])
            if isinstance(options, list) and len(options) > 0:
                for opt in options:
                    if not isinstance(opt, dict):
                        continue
                    items = opt.get("items", [])
                    if isinstance(items, list):
                        for item in items:
                            if isinstance(item, dict):
                                totals["calculated_calories"] += float(item.get("calories") or 0)
                                totals["calculated_protein_g"] += float(item.get("protein") or 0)
                                totals["calculated_carbs_g"] += float(item.get("carbs") or 0)
                                totals["calculated_fat_g"] += float(item.get("fat") or 0)
            
            # 2. Yöntem: Doğrudan meal.items yapısı
            items = meal.get("items", [])
            if isinstance(items, list) and len(items) > 0:
                for item in items:
                    if isinstance(item, dict):
                        totals["calculated_calories"] += float(item.get("calories") or 0)
                        totals["calculated_protein_g"] += float(item.get("protein") or 0)
                        totals["calculated_carbs_g"] += float(item.get("carbs") or 0)
                        totals["calculated_fat_g"] += float(item.get("fat") or 0)

    # Yuvarlama işlemleri
    totals["calculated_calories"] = round(totals["calculated_calories"], 2)
    totals["calculated_protein_g"] = round(totals["calculated_protein_g"], 2)
    totals["calculated_carbs_g"] = round(totals["calculated_carbs_g"], 2)
    totals["calculated_fat_g"] = round(totals["calculated_fat_g"], 2)

    return totals


# ==========================================
# PYDANTIC SCHEMA DEFINITIONS
# ==========================================

class FoodCreateUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = 'all'
    portion_label: Optional[str] = '100g'
    portion_amount: Optional[float] = 100.00
    unit: Optional[str] = 'g'
    calories: float = 0.00
    protein: float = 0.00
    carbs: float = 0.00
    fat: float = 0.00


class FoodResponse(BaseModel):
    id: int
    dietitian_id: Optional[int] = None
    name: str
    category: str
    portion_label: str
    portion_amount: float
    unit: str
    calories: float
    protein: float
    carbs: float
    fat: float
    created_at: Any


class DietTemplateCreateUpdate(BaseModel):
    dietitian_id: int
    title: str = Field(..., min_length=1, max_length=255)
    targetCalories: int = Field(2000, ge=100, le=20000)
    goal: Optional[str] = 'Kilo Verme & Definisyon'
    targetProteinGrams: Optional[float] = 0.00
    targetCarbsGrams: Optional[float] = 0.00
    targetFatGrams: Optional[float] = 0.00
    generalNotes: List[str] = Field(default_factory=list)
    dayTypes: List[Dict[str, Any]] = Field(default_factory=list)


class DietTemplateResponse(BaseModel):
    id: int
    dietitian_id: int
    title: str
    target_calories: int
    goal: str
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    calculated_calories: Optional[float] = 0.0
    calculated_protein_g: Optional[float] = 0.0
    calculated_carbs_g: Optional[float] = 0.0
    calculated_fat_g: Optional[float] = 0.0
    general_notes: List[str]
    day_types: List[Dict[str, Any]]
    created_at: Any
    updated_at: Any


# ==========================================
# 1. BESİN VERİTABANI ENDPOINT'LERİ (foods)
# ==========================================

@router.get("/foods", response_model=List[FoodResponse])
def get_foods(
    dietitian_id: Optional[int] = Query(None, description="Diyetisyene özel besinleri de çekmek için id"),
    category: Optional[str] = Query('all', description="Kategori filtresi: protein, carbs, fat, dairy, veg_fruit"),
    search: Optional[str] = Query(None, description="Besin adı ile arama"),
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        query = "SELECT id, dietitian_id, name, category, portion_label, portion_amount, unit, calories, protein, carbs, fat, created_at FROM public.foods WHERE 1=1"
        params = []

        if dietitian_id is not None:
            query += " AND (dietitian_id IS NULL OR dietitian_id = %s)"
            params.append(dietitian_id)
        else:
            query += " AND dietitian_id IS NULL"

        if category and category != 'all':
            query += " AND category = %s"
            params.append(category)

        if search and search.strip():
            query += " AND name ILIKE %s"
            params.append(f"%{search.strip()}%")

        query += " ORDER BY name ASC"

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

        foods = []
        for r in rows:
            foods.append({
                "id": r[0],
                "dietitian_id": r[1],
                "name": r[2],
                "category": r[3] or 'all',
                "portion_label": r[4] or '100g',
                "portion_amount": float(r[5]) if r[5] is not None else 100.0,
                "unit": r[6] or 'g',
                "calories": float(r[7]) if r[7] is not None else 0.0,
                "protein": float(r[8]) if r[8] is not None else 0.0,
                "carbs": float(r[9]) if r[9] is not None else 0.0,
                "fat": float(r[10]) if r[10] is not None else 0.0,
                "created_at": r[11].isoformat() if r[11] else None
            })
        return foods

    except Exception as e:
        logger.error(f"Error fetching foods: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Besin veritabanı çekilirken hata oluştu: {str(e)}")
    finally:
        cursor.close()


@router.post("/foods", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
def create_custom_food(
    dietitian_id: int,
    food: FoodCreateUpdate,
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        query = """
            INSERT INTO public.foods 
            (dietitian_id, name, category, portion_label, portion_amount, unit, calories, protein, carbs, fat)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, dietitian_id, name, category, portion_label, portion_amount, unit, calories, protein, carbs, fat, created_at;
        """
        cursor.execute(query, (
            dietitian_id,
            food.name,
            food.category,
            food.portion_label,
            food.portion_amount,
            food.unit,
            food.calories,
            food.protein,
            food.carbs,
            food.fat
        ))
        new_row = cursor.fetchone()
        conn.commit()

        return {
            "id": new_row[0],
            "dietitian_id": new_row[1],
            "name": new_row[2],
            "category": new_row[3],
            "portion_label": new_row[4],
            "portion_amount": float(new_row[5]),
            "unit": new_row[6],
            "calories": float(new_row[7]),
            "protein": float(new_row[8]),
            "carbs": float(new_row[9]),
            "fat": float(new_row[10]),
            "created_at": new_row[11].isoformat() if new_row[11] else None
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating custom food: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Özel besin eklenirken hata oluştu: {str(e)}")
    finally:
        cursor.close()


# ==========================================
# 2. DİYET ŞABLONLARI ENDPOINT'LERİ (diet_templates)
# ==========================================

@router.get("/templates", response_model=List[DietTemplateResponse])
def get_diet_templates(
    dietitian_id: int = Query(..., description="Diyetisyene ait şablonları çekmek için ID"),
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        query = """
            SELECT id, dietitian_id, title, target_calories, goal, 
                   target_protein_g, target_carbs_g, target_fat_g, 
                   general_notes, day_types, created_at, updated_at
            FROM public.diet_templates
            WHERE dietitian_id = %s
            ORDER BY updated_at DESC;
        """
        cursor.execute(query, (dietitian_id,))
        rows = cursor.fetchall()

        templates = []
        for r in rows:
            notes = parse_jsonb_field(r[8])
            days = parse_jsonb_field(r[9])
            calc_totals = calculate_day_types_totals(days)

            templates.append({
                "id": r[0],
                "dietitian_id": r[1],
                "title": r[2],
                "target_calories": r[3],
                "goal": r[4] or 'Kilo Verme & Definisyon',
                "target_protein_g": float(r[5]) if r[5] is not None else 0.0,
                "target_carbs_g": float(r[6]) if r[6] is not None else 0.0,
                "target_fat_g": float(r[7]) if r[7] is not None else 0.0,
                "calculated_calories": calc_totals["calculated_calories"],
                "calculated_protein_g": calc_totals["calculated_protein_g"],
                "calculated_carbs_g": calc_totals["calculated_carbs_g"],
                "calculated_fat_g": calc_totals["calculated_fat_g"],
                "general_notes": notes,
                "day_types": days,
                "created_at": r[10].isoformat() if r[10] else None,
                "updated_at": r[11].isoformat() if r[11] else None
            })
        return templates

    except Exception as e:
        logger.error(f"Error fetching diet templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Diyet şablonları çekilirken hata oluştu: {str(e)}")
    finally:
        cursor.close()


@router.get("/templates/{template_id}", response_model=DietTemplateResponse)
def get_diet_template_by_id(
    template_id: int,
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        query = """
            SELECT id, dietitian_id, title, target_calories, goal, 
                   target_protein_g, target_carbs_g, target_fat_g, 
                   general_notes, day_types, created_at, updated_at
            FROM public.diet_templates
            WHERE id = %s;
        """
        cursor.execute(query, (template_id,))
        r = cursor.fetchone()

        if not r:
            raise HTTPException(status_code=404, detail="Diyet şablonu bulunamadı.")

        notes = parse_jsonb_field(r[8])
        days = parse_jsonb_field(r[9])
        calc_totals = calculate_day_types_totals(days)

        return {
            "id": r[0],
            "dietitian_id": r[1],
            "title": r[2],
            "target_calories": r[3],
            "goal": r[4] or 'Kilo Verme & Definisyon',
            "target_protein_g": float(r[5]) if r[5] is not None else 0.0,
            "target_carbs_g": float(r[6]) if r[6] is not None else 0.0,
            "target_fat_g": float(r[7]) if r[7] is not None else 0.0,
            "calculated_calories": calc_totals["calculated_calories"],
            "calculated_protein_g": calc_totals["calculated_protein_g"],
            "calculated_carbs_g": calc_totals["calculated_carbs_g"],
            "calculated_fat_g": calc_totals["calculated_fat_g"],
            "general_notes": notes,
            "day_types": days,
            "created_at": r[10].isoformat() if r[10] else None,
            "updated_at": r[11].isoformat() if r[11] else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Şablon detayları alınırken hata oluştu: {str(e)}")
    finally:
        cursor.close()


@router.post("/templates", response_model=DietTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_diet_template(
    payload: DietTemplateCreateUpdate,
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        query = """
            INSERT INTO public.diet_templates 
            (dietitian_id, title, target_calories, goal, target_protein_g, target_carbs_g, target_fat_g, general_notes, day_types)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
            RETURNING id, dietitian_id, title, target_calories, goal, target_protein_g, target_carbs_g, target_fat_g, general_notes, day_types, created_at, updated_at;
        """
        notes_json = json.dumps(payload.generalNotes, ensure_ascii=False)
        day_types_json = json.dumps(payload.dayTypes, ensure_ascii=False)

        cursor.execute(query, (
            payload.dietitian_id,
            payload.title,
            payload.targetCalories,
            payload.goal,
            payload.targetProteinGrams,
            payload.targetCarbsGrams,
            payload.targetFatGrams,
            notes_json,
            day_types_json
        ))
        new_row = cursor.fetchone()
        conn.commit()

        notes = parse_jsonb_field(new_row[8])
        days = parse_jsonb_field(new_row[9])
        calc_totals = calculate_day_types_totals(days)

        return {
            "id": new_row[0],
            "dietitian_id": new_row[1],
            "title": new_row[2],
            "target_calories": new_row[3],
            "goal": new_row[4],
            "target_protein_g": float(new_row[5]),
            "target_carbs_g": float(new_row[6]),
            "target_fat_g": float(new_row[7]),
            "calculated_calories": calc_totals["calculated_calories"],
            "calculated_protein_g": calc_totals["calculated_protein_g"],
            "calculated_carbs_g": calc_totals["calculated_carbs_g"],
            "calculated_fat_g": calc_totals["calculated_fat_g"],
            "general_notes": notes,
            "day_types": days,
            "created_at": new_row[10].isoformat() if new_row[10] else None,
            "updated_at": new_row[11].isoformat() if new_row[11] else None
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating diet template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Şablon kaydedilirken sunucu hatası: {str(e)}")
    finally:
        cursor.close()


@router.put("/templates/{template_id}", response_model=DietTemplateResponse)
def update_diet_template(
    template_id: int,
    payload: DietTemplateCreateUpdate,
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        cursor.execute("SELECT id FROM public.diet_templates WHERE id = %s;", (template_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Güncellenecek diyet şablonu bulunamadı.")

        query = """
            UPDATE public.diet_templates
            SET title = %s,
                target_calories = %s,
                goal = %s,
                target_protein_g = %s,
                target_carbs_g = %s,
                target_fat_g = %s,
                general_notes = %s::jsonb,
                day_types = %s::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND dietitian_id = %s
            RETURNING id, dietitian_id, title, target_calories, goal, target_protein_g, target_carbs_g, target_fat_g, general_notes, day_types, created_at, updated_at;
        """
        notes_json = json.dumps(payload.generalNotes, ensure_ascii=False)
        day_types_json = json.dumps(payload.dayTypes, ensure_ascii=False)

        cursor.execute(query, (
            payload.title,
            payload.targetCalories,
            payload.goal,
            payload.targetProteinGrams,
            payload.targetCarbsGrams,
            payload.targetFatGrams,
            notes_json,
            day_types_json,
            template_id,
            payload.dietitian_id
        ))
        updated_row = cursor.fetchone()
        conn.commit()

        if not updated_row:
            raise HTTPException(status_code=403, detail="Bu şablonu güncelleme yetkiniz yok.")

        notes = parse_jsonb_field(updated_row[8])
        days = parse_jsonb_field(updated_row[9])
        calc_totals = calculate_day_types_totals(days)

        return {
            "id": updated_row[0],
            "dietitian_id": updated_row[1],
            "title": updated_row[2],
            "target_calories": updated_row[3],
            "goal": updated_row[4],
            "target_protein_g": float(updated_row[5]),
            "target_carbs_g": float(updated_row[6]),
            "target_fat_g": float(updated_row[7]),
            "calculated_calories": calc_totals["calculated_calories"],
            "calculated_protein_g": calc_totals["calculated_protein_g"],
            "calculated_carbs_g": calc_totals["calculated_carbs_g"],
            "calculated_fat_g": calc_totals["calculated_fat_g"],
            "general_notes": notes,
            "day_types": days,
            "created_at": updated_row[10].isoformat() if updated_row[10] else None,
            "updated_at": updated_row[11].isoformat() if updated_row[11] else None
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating diet template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Şablon güncellenirken hata oluştu: {str(e)}")
    finally:
        cursor.close()


@router.delete("/templates/{template_id}", status_code=status.HTTP_200_OK)
def delete_diet_template(
    template_id: int,
    dietitian_id: int = Query(...),
    conn: Any = Depends(get_db_connection)
):
    cursor = conn.cursor(cursor_factory=DictCursor)
    try:
        query = "DELETE FROM public.diet_templates WHERE id = %s AND dietitian_id = %s RETURNING id;"
        cursor.execute(query, (template_id, dietitian_id))
        deleted_row = cursor.fetchone()
        conn.commit()

        if not deleted_row:
            raise HTTPException(status_code=404, detail="Silinecek şablon bulunamadı veya yetkiniz yok.")

        return {"message": "Diyet şablonu başarıyla silindi.", "id": template_id}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting diet template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Şablon silinirken hata oluştu: {str(e)}")
    finally:
        cursor.close()