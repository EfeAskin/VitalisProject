from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from psycopg2.extras import RealDictCursor

from backend.database import get_db_connection
from backend import schemas

router = APIRouter(
    prefix="/api/expert/marketplace",
    tags=["Expert Marketplace"]
)


def get_current_specialist_id(conn) -> int:
    """
    Geliştirme/test aşamasında Ömer Gürün hesabının ID'sini dinamik olarak tespit eder.
    JWT/Session auth mekanizması tamamlandığında doğrudan token'dan alınacaktır.
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT id FROM users 
            WHERE LOWER(first_name) LIKE '%ömer%' 
               OR LOWER(last_name) LIKE '%gürün%'
               OR LOWER(first_name) LIKE '%omer%'
               OR LOWER(last_name) LIKE '%gurun%'
            ORDER BY id ASC
            LIMIT 1;
        """)
        user = cursor.fetchone()
        if user and user.get("id"):
            return user["id"]

        cursor.execute("SELECT user_id FROM specialist_profiles ORDER BY user_id ASC LIMIT 1;")
        sp = cursor.fetchone()
        if sp and sp.get("user_id"):
            return sp["user_id"]

        return 1
    except Exception:
        return 1
    finally:
        cursor.close()


@router.get("/profile")
def get_marketplace_profile(conn = Depends(get_db_connection)):
    specialist_id = get_current_specialist_id(conn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Uzman bilgisi ve profil çekme
        cursor.execute("""
            SELECT 
                u.id AS user_id,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                u.first_name,
                u.last_name,
                u.*,
                COALESCE(sp.title, 'Personal Trainer') AS title,
                COALESCE(sp.bio, '') AS bio,
                COALESCE(sp.specialties, '{}') AS specialties,
                COALESCE(sp.is_accepting_clients, TRUE) AS is_accepting_clients,
                COALESCE(sp.rating, 5.0) AS rating,
                COALESCE(sp.review_count, 0) AS review_count,
                COALESCE(sp.profile_views, 0) AS profile_views
            FROM users u
            LEFT JOIN specialist_profiles sp ON u.id = sp.user_id
            WHERE u.id = %s
        """, (specialist_id,))
        raw_profile = cursor.fetchone()

        if not raw_profile:
            raise HTTPException(status_code=404, detail="Uzman profili bulunamadı.")

        # Profil fotoğrafını veritabanındaki tüm olası kolon isimlerinden kontrol et
        photo_url = (
            raw_profile.get("profile_picture_url") or 
            raw_profile.get("profile_picture") or 
            raw_profile.get("profile_photo") or 
            raw_profile.get("avatar_url") or 
            raw_profile.get("avatar") or 
            ""
        )

        profile = {
            "user_id": raw_profile["user_id"],
            "full_name": raw_profile["full_name"],
            "first_name": raw_profile.get("first_name", ""),
            "last_name": raw_profile.get("last_name", ""),
            "title": raw_profile["title"],
            "bio": raw_profile["bio"],
            "specialties": raw_profile["specialties"],
            "is_accepting_clients": raw_profile["is_accepting_clients"],
            "rating": raw_profile["rating"],
            "review_count": raw_profile["review_count"],
            "profile_views": raw_profile["profile_views"],
            "profile_picture_url": photo_url,
            "profile_picture": photo_url,
            "profile_photo": photo_url,
            "avatar_url": photo_url
        }

        # Gelen Talep Sayısı (specialist_subscriptions tablosundan)
        cursor.execute("""
            SELECT COUNT(*) AS total_requests 
            FROM specialist_subscriptions 
            WHERE specialist_id = %s
        """, (specialist_id,))
        req_res = cursor.fetchone()
        req_count = req_res["total_requests"] if req_res else 0

        # Dönüşüm Oranı Hesabı
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
def update_marketplace_profile(payload: schemas.MarketplaceProfileUpdate, conn = Depends(get_db_connection)):
    specialist_id = get_current_specialist_id(conn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            INSERT INTO specialist_profiles (user_id, bio, specialties, is_accepting_clients, updated_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
                bio = COALESCE(EXCLUDED.bio, specialist_profiles.bio),
                specialties = COALESCE(EXCLUDED.specialties, specialist_profiles.specialties),
                is_accepting_clients = COALESCE(EXCLUDED.is_accepting_clients, specialist_profiles.is_accepting_clients),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        """, (
            specialist_id,
            payload.bio,
            payload.specialties,
            payload.is_accepting_clients
        ))
        updated_profile = cursor.fetchone()
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
def get_listings(conn = Depends(get_db_connection)):
    specialist_id = get_current_specialist_id(conn)
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
            WHERE specialist_id = %s
            ORDER BY created_at DESC
        """, (specialist_id,))
        listings = cursor.fetchall()
        return listings
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.post("/listings", status_code=201)
def create_listing(payload: schemas.MarketplaceListingCreate, conn = Depends(get_db_connection)):
    specialist_id = get_current_specialist_id(conn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            INSERT INTO marketplace_listings (specialist_id, title, price, period, description)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, price::text AS price, period, description, is_active AS active;
        """, (
            specialist_id,
            payload.title,
            payload.price,
            payload.period,
            payload.description
        ))
        new_listing = cursor.fetchone()
        conn.commit()
        return new_listing
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.put("/listings/{listing_id}")
def update_listing(listing_id: int, payload: schemas.MarketplaceListingUpdate, conn = Depends(get_db_connection)):
    specialist_id = get_current_specialist_id(conn)
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
            WHERE id = %s AND specialist_id = %s
            RETURNING id, title, price::text AS price, period, description, is_active AS active;
        """, (
            payload.title,
            payload.price,
            payload.period,
            payload.description,
            payload.is_active,
            listing_id,
            specialist_id
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
def delete_listing(listing_id: int, conn = Depends(get_db_connection)):
    specialist_id = get_current_specialist_id(conn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            DELETE FROM marketplace_listings
            WHERE id = %s AND specialist_id = %s
            RETURNING id;
        """, (listing_id, specialist_id))
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