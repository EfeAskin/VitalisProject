from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Dict, Any, Optional
from psycopg2.extras import RealDictCursor

from backend.database import get_db_connection
from backend import schemas

router = APIRouter(
    prefix="/api/expert/marketplace",
    tags=["Expert Marketplace"]
)

def normalize_specialties(val) -> List[str]:
    """PostgreSQL text[] dizilerini ve string formatlarını temiz bir Python listesine çevirir."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(x).strip(' "^\'') for x in val if x]
    if isinstance(val, str):
        cleaned = val.strip('{}[]"\' ')
        if not cleaned:
            return []
        return [item.strip(' "^\'') for item in cleaned.split(',') if item.strip(' "^\'')]
    return []

def resolve_specialist_title(raw_title: Optional[str], role: Optional[str] = None, profession: Optional[str] = None) -> str:
    """Kullanıcının rolüne/mesleğine göre unvanı (title) dinamik olarak belirler."""
    role_clean = str(role or '').lower()
    prof_clean = str(profession or '').lower()
    
    is_dietitian = any(k in role_clean or k in prof_clean for k in ['diet', 'diyet'])
    
    if is_dietitian:
        if not raw_title or str(raw_title).strip() == "" or str(raw_title).strip().lower() == "personal trainer":
            return "Klinik Diyetisyen"
        return str(raw_title).strip()
    else:
        if not raw_title or str(raw_title).strip() == "":
            return "Kişisel Antrenör"
        return str(raw_title).strip()

def get_current_specialist_id(conn, requested_id: Optional[int] = None) -> int:
    """Geçerli dinamik kullanıcı ID'sini doğrular. ID yoksa yetkisiz erişim fırlatır."""
    if requested_id and isinstance(requested_id, int) and requested_id > 0:
        return requested_id

    # Dinamik ID gelmediyse kesinlikle varsayılan ilk kullanıcıyı (Ömer) çekmiyoruz.
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Geçerli bir uzman veya kullanıcı ID'si belirtilmedi."
    )

def get_specialist_profile_id(conn, user_id: int) -> int:
    """Aynı zamanda specialist_profiles tablosunun kendi PK 'id'sini getirir."""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT id FROM specialist_profiles WHERE user_id = %s LIMIT 1;", (user_id,))
        row = cursor.fetchone()
        if row and row.get("id"):
            return row["id"]
        return user_id
    except Exception:
        return user_id
    finally:
        cursor.close()


@router.get("/profile")
def get_marketplace_profile(
    specialist_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    conn = Depends(get_db_connection)
):
    target_id = specialist_id or user_id
    active_specialist_id = get_current_specialist_id(conn, target_id)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT 
                u.id AS user_id,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                u.first_name,
                u.last_name,
                u.*,
                sp.title AS raw_title,
                COALESCE(sp.bio, '') AS bio,
                sp.specialties AS raw_specialties,
                COALESCE(sp.is_accepting_clients, TRUE) AS is_accepting_clients,
                COALESCE(sp.rating, 5.0) AS rating,
                COALESCE(sp.review_count, 0) AS review_count,
                COALESCE(sp.profile_views, 0) AS profile_views
            FROM users u
            LEFT JOIN specialist_profiles sp ON u.id = sp.user_id
            WHERE u.id = %s
        """, (active_specialist_id,))
        raw_profile = cursor.fetchone()

        if not raw_profile:
            raise HTTPException(status_code=404, detail="Uzman profili bulunamadı.")

        photo_url = (
            raw_profile.get("profile_picture_url") or 
            raw_profile.get("profile_picture") or 
            raw_profile.get("profile_photo") or 
            raw_profile.get("avatar_url") or 
            raw_profile.get("avatar") or 
            ""
        )

        clean_specs = normalize_specialties(raw_profile.get("raw_specialties"))

        # Rol/meslek bilgisine göre dinamik unvan belirleme
        resolved_title = resolve_specialist_title(
            raw_profile.get("raw_title") or raw_profile.get("title"),
            raw_profile.get("role"),
            raw_profile.get("profession")
        )

        profile = {
            "user_id": raw_profile["user_id"],
            "full_name": raw_profile["full_name"],
            "first_name": raw_profile.get("first_name", ""),
            "last_name": raw_profile.get("last_name", ""),
            "title": resolved_title,
            "bio": raw_profile["bio"],
            "specialties": clean_specs,
            "is_accepting_clients": raw_profile["is_accepting_clients"],
            "rating": raw_profile["rating"],
            "review_count": raw_profile["review_count"],
            "profile_views": raw_profile["profile_views"],
            "profile_picture_url": photo_url,
            "profile_picture": photo_url,
            "profile_photo": photo_url,
            "avatar_url": photo_url
        }

        cursor.execute("""
            SELECT COUNT(*) AS total_requests 
            FROM specialist_subscriptions 
            WHERE specialist_id = %s
        """, (active_specialist_id,))
        req_res = cursor.fetchone()
        req_count = req_res["total_requests"] if req_res else 0

        views = profile["profile_views"] if profile["profile_views"] > 0 else 1
        conversion_rate = round((req_count / views) * 100, 1)

        stats = [
            {"label": "Profil Görüntülenme", "value": str(profile["profile_views"]), "key": "views"},
            {"label": "Gelen Talep", "value": str(req_count), "key": "requests"},
            {"label": "Dönüşüm Oranı", "value": f"%{conversion_rate}", "key": "conversion"}
        ]

        return {
            "profile": profile,
            "stats": stats
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.put("/profile")
def update_marketplace_profile(
    payload: schemas.MarketplaceProfileUpdate,
    specialist_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    conn = Depends(get_db_connection)
):
    target_id = specialist_id or user_id
    active_specialist_id = get_current_specialist_id(conn, target_id)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        clean_specs = normalize_specialties(payload.specialties) if payload.specialties is not None else None

        # Kullanıcının mevcut rolünü sorgula
        cursor.execute("SELECT role, profession FROM users WHERE id = %s;", (active_specialist_id,))
        user_info = cursor.fetchone() or {}

        payload_title = getattr(payload, "title", None)
        
        cursor.execute("SELECT title FROM specialist_profiles WHERE user_id = %s;", (active_specialist_id,))
        existing_profile = cursor.fetchone()
        existing_title = existing_profile.get("title") if existing_profile else None

        target_title = payload_title if payload_title else existing_title
        resolved_title = resolve_specialist_title(target_title, user_info.get("role"), user_info.get("profession"))

        cursor.execute("""
            INSERT INTO specialist_profiles (user_id, title, bio, specialties, is_accepting_clients, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
                title = %s,
                bio = COALESCE(EXCLUDED.bio, specialist_profiles.bio),
                specialties = COALESCE(EXCLUDED.specialties, specialist_profiles.specialties),
                is_accepting_clients = COALESCE(EXCLUDED.is_accepting_clients, specialist_profiles.is_accepting_clients),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        """, (
            active_specialist_id,
            resolved_title,
            payload.bio,
            clean_specs,
            payload.is_accepting_clients,
            resolved_title
        ))
        updated_profile = cursor.fetchone()
        if updated_profile and updated_profile.get("specialties") is not None:
            updated_profile["specialties"] = normalize_specialties(updated_profile["specialties"])
            
        conn.commit()
        return {"message": "Profil başarıyla güncellendi", "profile": updated_profile}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.get("/listings")
def get_listings(
    specialist_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    conn = Depends(get_db_connection)
):
    target_id = specialist_id or user_id
    active_specialist_id = get_current_specialist_id(conn, target_id)
    sp_profile_id = get_specialist_profile_id(conn, active_specialist_id)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT 
                id,
                title,
                price::text AS price,
                period,
                description,
                is_active AS active,
                created_at
            FROM marketplace_listings
            WHERE specialist_id = %s OR specialist_id = %s
            ORDER BY created_at DESC
        """, (active_specialist_id, sp_profile_id))
        listings = cursor.fetchall()
        return listings
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.post("/listings", status_code=201)
def create_listing(
    payload: schemas.MarketplaceListingCreate,
    specialist_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    conn = Depends(get_db_connection)
):
    target_id = specialist_id or user_id
    active_specialist_id = get_current_specialist_id(conn, target_id)
    sp_profile_id = get_specialist_profile_id(conn, active_specialist_id)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    target_ids = [active_specialist_id, sp_profile_id] if active_specialist_id != sp_profile_id else [active_specialist_id]
    
    last_error = None
    for tid in target_ids:
        try:
            cursor.execute("""
                INSERT INTO marketplace_listings (specialist_id, title, price, period, description, is_active)
                VALUES (%s, %s, %s, %s, %s, TRUE)
                RETURNING id, title, price::text AS price, period, description, is_active AS active;
            """, (
                tid,
                payload.title,
                payload.price,
                payload.period,
                payload.description
            ))
            new_listing = cursor.fetchone()
            conn.commit()
            return new_listing
        except Exception as e:
            conn.rollback()
            last_error = e

    raise HTTPException(status_code=500, detail=f"İlan oluşturulamadı: {str(last_error)}")


@router.put("/listings/{listing_id}")
def update_listing(
    listing_id: int,
    payload: schemas.MarketplaceListingUpdate,
    specialist_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    conn = Depends(get_db_connection)
):
    target_id = specialist_id or user_id
    active_specialist_id = get_current_specialist_id(conn, target_id)
    sp_profile_id = get_specialist_profile_id(conn, active_specialist_id)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            UPDATE marketplace_listings
            SET 
                title = COALESCE(%s, title),
                price = COALESCE(%s, price),
                period = COALESCE(%s, period),
                description = COALESCE(%s, description),
                is_active = COALESCE(%s, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND (specialist_id = %s OR specialist_id = %s)
            RETURNING id, title, price::text AS price, period, description, is_active AS active;
        """, (
            payload.title,
            payload.price,
            payload.period,
            payload.description,
            payload.is_active,
            listing_id,
            active_specialist_id,
            sp_profile_id
        ))
        updated = cursor.fetchone()
        if not updated:
            raise HTTPException(status_code=404, detail="İlan bulunamadı.")
        conn.commit()
        return updated
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    specialist_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    conn = Depends(get_db_connection)
):
    target_id = specialist_id or user_id
    active_specialist_id = get_current_specialist_id(conn, target_id)
    sp_profile_id = get_specialist_profile_id(conn, active_specialist_id)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            DELETE FROM marketplace_listings
            WHERE id = %s AND (specialist_id = %s OR specialist_id = %s)
            RETURNING id;
        """, (listing_id, active_specialist_id, sp_profile_id))
        deleted = cursor.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="İlan bulunamadı.")
        conn.commit()
        return {"message": "İlan başarıyla silindi"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()