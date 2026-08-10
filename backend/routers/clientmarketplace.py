from fastapi import APIRouter, HTTPException, Query, Depends, status
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api/client/marketplace",
    tags=["Client Marketplace"]
)

# ============================================================
# VERİTABANI BAĞLANTISI
# ============================================================
try:
    from database import get_db_connection
except ImportError:
    def get_db_connection():
        db_url = (
            os.getenv("DATABASE_URL") or 
            os.getenv("NEON_DATABASE_URL") or 
            os.getenv("LOCAL_DATABASE_URL")
        )
        if not db_url:
            raise RuntimeError("Veritabanı adresi (.env) bulunamadı. Lütfen DATABASE_URL tanımlayın.")
        
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        try:
            yield conn
        finally:
            conn.close()


# ============================================================
# PYDANTIC MODELLERİ
# ============================================================
class SubscriptionRequest(BaseModel):
    specialist_user_id: int
    package_name: str
    goal: Optional[str] = "Genel Sağlık ve Kondisyon"
    request_message: Optional[str] = ""
    client_id: int


def parse_specialties(specs_raw) -> List[str]:
    if not specs_raw:
        return []
    if isinstance(specs_raw, list):
        return [str(s).strip('"{}\' ') for s in specs_raw if str(s).strip()]
    if isinstance(specs_raw, str):
        cleaned = specs_raw.strip('{}[]"\'')
        if cleaned:
            return [s.strip(' "^\'') for s in cleaned.split(',') if s.strip()]
    return []


# ============================================================
# ENDPOINTS
# ============================================================
@router.get("/experts")
def get_marketplace_experts(
    category: Optional[str] = Query("all"),
    search: Optional[str] = Query(""),
    sort: Optional[str] = Query("popular"),
    conn = Depends(get_db_connection)
):
    category = (category or "all").lower().strip()
    search_term = (search or "").lower().strip()
    sort = sort or "popular"

    if not conn:
        return {"experts": [], "success": False, "message": "Veritabanı bağlantısı kurulamadı."}

    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT DISTINCT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                COALESCE(u.role, 'trainer') as role,
                u.profile_photo
            FROM users u
            LEFT JOIN marketplace_listings ml ON u.id = ml.specialist_id
            WHERE LOWER(COALESCE(u.role, '')) IN ('trainer', 'dietitian', 'specialist', 'expert')
               OR ml.specialist_id IS NOT NULL
        """)
        users_raw = cursor.fetchall()

        if not users_raw:
            cursor.execute("SELECT id as user_id, first_name, last_name, email, role, profile_photo FROM users")
            users_raw = cursor.fetchall()

        profiles_dict = {}
        try:
            cursor.execute("SELECT * FROM specialist_profiles")
            profiles = cursor.fetchall()
            for p in profiles:
                uid = p.get('user_id') or p.get('id')
                if uid:
                    profiles_dict[uid] = p
        except Exception:
            conn.rollback()

        listings_by_user = {}
        try:
            cursor.execute("SELECT * FROM marketplace_listings WHERE is_active = TRUE OR is_active IS NULL")
            all_listings = cursor.fetchall()
            for l in all_listings:
                spec_id = l.get('specialist_id')
                if spec_id:
                    if spec_id not in listings_by_user:
                        listings_by_user[spec_id] = []
                    listings_by_user[spec_id].append(l)
        except Exception:
            conn.rollback()

        experts_list = []

        for u in users_raw:
            u_id = u['user_id']
            prof = profiles_dict.get(u_id, {})
            u_listings = listings_by_user.get(u_id, [])

            prof_id = prof.get('id')
            if prof_id and prof_id in listings_by_user and prof_id != u_id:
                u_listings.extend(listings_by_user[prof_id])

            full_name = f"{u.get('first_name') or ''} {u.get('last_name') or ''}".strip()
            if not full_name:
                full_name = (u.get('email') or 'Uzman').split('@')[0].capitalize()

            user_role = str(u.get('role', 'trainer')).lower()
            category_type = 'dietitian' if 'diet' in user_role else 'trainer'

            specs = parse_specialties(prof.get('specialties'))
            if not specs:
                specs = ["Birebir Koçluk", "Beslenme & Antrenman"]

            formatted_listings = []
            prices = []

            for l in u_listings:
                p_val = float(l.get('price') or 0.0)
                prices.append(p_val)
                formatted_listings.append({
                    "id": l.get('id'),
                    "title": l.get('title') or "Uzman Koçluk Paketi",
                    "price": p_val,
                    "period": l.get('period') or "Aylık",
                    "description": l.get('description') or ""
                })

            min_price = min(prices) if prices else 2500.0

            expert_obj = {
                "id": prof_id or u_id,
                "userId": u_id,
                "name": full_name,
                "title": prof.get('title') or ("Klinik Diyetisyen" if category_type == 'dietitian' else "Kıdemli Fitness Koçu"),
                "bio": prof.get('bio') or "Danışanlarına özel beslenme ve antrenman programları ile hedeflerine ulaştırıyor.",
                "category": category_type,
                "avatarUrl": u.get('profile_photo') or prof.get('avatar_url') or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
                "rating": float(prof.get('rating') or 5.0),
                "reviewCount": int(prof.get('review_count') or 12),
                "experienceYears": 5,
                "minPrice": min_price,
                "specialties": specs,
                "verified": True,
                "listings": formatted_listings
            }

            matches_category = (category == 'all') or (expert_obj['category'] == category)
            matches_search = (
                not search_term or 
                search_term in expert_obj['name'].lower() or 
                search_term in expert_obj['title'].lower() or
                any(search_term in s.lower() for s in expert_obj['specialties'])
            )

            if matches_category and matches_search:
                experts_list.append(expert_obj)

        if sort == 'price_asc':
            experts_list.sort(key=lambda x: x['minPrice'])
        elif sort == 'price_desc':
            experts_list.sort(key=lambda x: x['minPrice'], reverse=True)
        elif sort == 'rating':
            experts_list.sort(key=lambda x: x['rating'], reverse=True)

        return {"experts": experts_list, "success": True}

    except Exception as e:
        traceback.print_exc()
        return {"experts": [], "success": False, "error": str(e)}
    finally:
        cursor.close()


@router.post("/subscribe")
def create_subscription_request(
    data: SubscriptionRequest,
    conn = Depends(get_db_connection)
):
    if not conn:
        raise HTTPException(status_code=500, detail="Veritabanı bağlantısı kurulamadı.")
    
    cursor = conn.cursor()
    try:
        # Veritabanı tablonuzdaki gerçek sütun isimlerine göre güncellendi
        insert_query = """
            INSERT INTO specialist_subscriptions 
            (specialist_id, client_id, package_name, status, goal, request_message, created_at, updated_at)
            VALUES (%s, %s, %s, 'pending', %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id;
        """
        cursor.execute(insert_query, (
            data.specialist_user_id,
            data.client_id,
            data.package_name,
            data.goal,
            data.request_message
        ))
        
        new_sub = cursor.fetchone()
        new_sub_id = new_sub['id'] if new_sub else 1
        conn.commit()
        
        return {
            "success": True, 
            "message": "Abonelik başvurunuz uzmana iletildi!",
            "subscription_id": new_sub_id
        }
    except Exception as e:
        conn.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Abonelik kaydı hatası: {str(e)}")
    finally:
        cursor.close()

