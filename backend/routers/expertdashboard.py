from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List, Any
from pydantic import BaseModel
from backend.database import get_db_connection
from backend.routers.auth import get_current_user
from psycopg2.extras import RealDictCursor

router = APIRouter(tags=["Expert Dashboard & Marketplace"])


# ==============================================================================
# PYDANTIC ŞEMALARI
# ==============================================================================
class ListingCreateUpdateSchema(BaseModel):
    specialist_id: int
    title: str
    price: float
    period: Optional[str] = "Aylık"
    description: Optional[str] = ""
    is_active: Optional[bool] = True


# ==============================================================================
# YARDIMCI FONKSİYONLAR
# ==============================================================================

def _get_user_id(current_user: Any) -> Optional[int]:
    if isinstance(current_user, dict):
        value = current_user.get("id", current_user.get("user_id"))
    elif isinstance(current_user, (tuple, list)):
        value = current_user[0] if len(current_user) > 0 else None
    else:
        value = getattr(current_user, "id", None)
        if value is None:
            value = getattr(current_user, "user_id", None)

    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _get_user_role(current_user: Any) -> Optional[str]:
    if isinstance(current_user, dict):
        return current_user.get("role")
    if isinstance(current_user, (tuple, list)):
        return current_user[10] if len(current_user) > 10 else None
    return getattr(current_user, "role", None)


def _get_authorized_specialist(
    cursor: RealDictCursor,
    current_user: Any,
    requested_specialist_id: Optional[int] = None
) -> int:
    user_id = _get_user_id(current_user)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçerli kullanıcı kimliği bulunamadı."
        )

    role = _get_user_role(current_user)

    if role not in ("trainer", "dietitian"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için uzman yetkisi bulunmamaktadır."
        )

    cursor.execute("""
        SELECT id, user_id
        FROM specialist_profiles
        WHERE user_id = %s
        LIMIT 1
    """, (user_id,))

    specialist = cursor.fetchone()

    if not specialist:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Uzman profili bulunamadı."
        )

    specialist_profile_id = int(specialist["id"])

    if requested_specialist_id is not None:
        requested_id = int(requested_specialist_id)

        if requested_id not in (specialist_profile_id, int(specialist["user_id"])):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Başka bir uzmanın verilerine erişemezsiniz."
            )

    return specialist_profile_id


# ==============================================================================
# 1. PAZARYERİ / UZMAN İLANLARINI LİSTELE
# ==============================================================================

@router.get("/api/marketplace/listings")
def get_marketplace_listings(
    specialist_id: Optional[int] = Query(None, description="Uzman ID'ye göre filtrele"),
    conn=Depends(get_db_connection)
):
    """
    marketplace_listings tablosundaki aktif ilanları gerçek DB'den çeker.
    Belirli bir specialist_id verilirse yalnızca o uzmanın ilanlarını döndürür.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            if specialist_id is not None:
                cursor.execute("""
                    SELECT
                        id,
                        specialist_id,
                        title,
                        price,
                        period,
                        description,
                        is_active,
                        created_at,
                        updated_at
                    FROM marketplace_listings
                    WHERE specialist_id = %s
                      AND is_active = TRUE
                    ORDER BY created_at DESC
                """, (specialist_id,))
            else:
                cursor.execute("""
                    SELECT
                        id,
                        specialist_id,
                        title,
                        price,
                        period,
                        description,
                        is_active,
                        created_at,
                        updated_at
                    FROM marketplace_listings
                    WHERE is_active = TRUE
                    ORDER BY created_at DESC
                """)

            result = cursor.fetchall() or []
            return [dict(row) for row in result]

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pazaryeri ilanları alınamadı: {str(e)}"
        )


# ==============================================================================
# 2. UZMANIN KENDİ İLANLARINI LİSTELE
# ==============================================================================

@router.get("/api/expert/listings")
def get_expert_listings(
    specialist_id: Optional[int] = Query(None),
    conn=Depends(get_db_connection),
    current_user=Depends(get_current_user)
):
    """
    Giriş yapan uzmanın kendi ilanlarını getirir.
    URL/query üzerinden başka specialist_id verilse bile yetkisiz erişime izin vermez.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_profile_id = _get_authorized_specialist(
                cursor,
                current_user,
                specialist_id
            )

            cursor.execute("""
                SELECT
                    id,
                    specialist_id,
                    title,
                    price,
                    period,
                    description,
                    is_active,
                    created_at,
                    updated_at
                FROM marketplace_listings
                WHERE specialist_id = %s
                ORDER BY created_at DESC
            """, (specialist_profile_id,))

            result = cursor.fetchall() or []
            return [dict(row) for row in result]

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Uzman ilanları alınamadı: {str(e)}"
        )


# ==============================================================================
# 3. YENİ PAKET / İLAN EKLE
# ==============================================================================

@router.post(
    "/api/marketplace/listings",
    status_code=status.HTTP_201_CREATED
)
def create_marketplace_listing(
    listing: ListingCreateUpdateSchema,
    conn=Depends(get_db_connection),
    current_user=Depends(get_current_user)
):
    """
    Giriş yapan uzmanın vitrinine yeni hizmet/paket ilanı ekler.
    specialist_id request body'den alınsa bile güvenlik amacıyla token sahibi
    kullanıcının gerçek specialist_profiles.id değeri kullanılır.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_profile_id = _get_authorized_specialist(
                cursor,
                current_user,
                listing.specialist_id
            )

            title = listing.title.strip() if listing.title else ""
            period = listing.period.strip() if listing.period else "Aylık"
            description = listing.description.strip() if listing.description else ""
            price = float(listing.price)

            if not title:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="İlan başlığı boş bırakılamaz."
                )

            if price < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="İlan fiyatı negatif olamaz."
                )

            cursor.execute("""
                INSERT INTO marketplace_listings (
                    specialist_id,
                    title,
                    price,
                    period,
                    description,
                    is_active,
                    created_at,
                    updated_at
                )
                VALUES (%s,%s,%s,%s,%s,%s,NOW(),NOW())
                RETURNING
                    id,
                    specialist_id,
                    title,
                    price,
                    period,
                    description,
                    is_active,
                    created_at,
                    updated_at
            """, (
                specialist_profile_id,
                title,
                price,
                period,
                description,
                bool(listing.is_active)
            ))

            new_row = cursor.fetchone()

            if not new_row:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="İlan oluşturuldu ancak kayıt geri alınamadı."
                )

            conn.commit()

            return {
                "message": "İlan başarıyla oluşturuldu.",
                "success": True,
                "data": dict(new_row)
            }

    except HTTPException:
        conn.rollback()
        raise
    except ValueError:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz fiyat değeri."
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"İlan oluşturulurken hata oluştu: {str(e)}"
        )


# ==============================================================================
# 4. İLAN / PAKET GÜNCELLE
# ==============================================================================

@router.put("/api/marketplace/listings/{listing_id}")
def update_marketplace_listing(
    listing_id: int,
    listing: ListingCreateUpdateSchema,
    conn=Depends(get_db_connection),
    current_user=Depends(get_current_user)
):
    """
    Yalnızca giriş yapan uzmana ait ilanı günceller.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_profile_id = _get_authorized_specialist(
                cursor,
                current_user,
                listing.specialist_id
            )

            title = listing.title.strip() if listing.title else ""
            period = listing.period.strip() if listing.period else "Aylık"
            description = listing.description.strip() if listing.description else ""
            price = float(listing.price)

            if not title:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="İlan başlığı boş bırakılamaz."
                )

            if price < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="İlan fiyatı negatif olamaz."
                )

            cursor.execute("""
                UPDATE marketplace_listings
                SET
                    title = %s,
                    price = %s,
                    period = %s,
                    description = %s,
                    is_active = %s,
                    updated_at = NOW()
                WHERE id = %s
                  AND specialist_id = %s
                RETURNING
                    id,
                    specialist_id,
                    title,
                    price,
                    period,
                    description,
                    is_active,
                    created_at,
                    updated_at
            """, (
                title,
                price,
                period,
                description,
                bool(listing.is_active),
                listing_id,
                specialist_profile_id
            ))

            updated_row = cursor.fetchone()

            if not updated_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="İlan bulunamadı veya bu ilanı güncelleme yetkiniz yok."
                )

            conn.commit()

            return {
                "message": f"{listing_id} numaralı ilan güncellendi.",
                "success": True,
                "data": dict(updated_row)
            }

    except HTTPException:
        conn.rollback()
        raise
    except ValueError:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz fiyat değeri."
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"İlan güncellenirken hata oluştu: {str(e)}"
        )


# ==============================================================================
# 5. İLANI KALDIR / SİL
# ==============================================================================

@router.delete("/api/marketplace/listings/{listing_id}")
def delete_marketplace_listing(
    listing_id: int,
    conn=Depends(get_db_connection),
    current_user=Depends(get_current_user)
):
    """
    Yalnızca giriş yapan uzmana ait ilanı tamamen siler.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            specialist_profile_id = _get_authorized_specialist(
                cursor,
                current_user
            )

            cursor.execute("""
                DELETE FROM marketplace_listings
                WHERE id = %s
                  AND specialist_id = %s
                RETURNING id, specialist_id
            """, (
                listing_id,
                specialist_profile_id
            ))

            deleted_row = cursor.fetchone()

            if not deleted_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="İlan bulunamadı veya bu ilanı silme yetkiniz yok."
                )

            conn.commit()

            return {
                "message": "İlan kaldırıldı.",
                "success": True,
                "data": dict(deleted_row)
            }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"İlan silinirken hata oluştu: {str(e)}"
        )