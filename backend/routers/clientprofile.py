import os
import shutil
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from backend.database import get_db_connection
from backend.routers.auth import get_current_user
from backend.schemas import UserProfileUpdate

router = APIRouter(
    prefix="/api/client/profile",
    tags=["Client Profile Management"]
)


@router.get("", response_model=Dict[str, Any])
def get_client_profile(
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db_connection)
):
    """
    Giriş yapmış kullanıcının Neon DB üzerindeki canlı profil ve biyometrik verilerini getirir.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz oturum bilgisi."
        )

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, first_name, last_name, email, phone, age, gender, 
                       height, weight, activity_level, goal, profile_photo, role, created_at
                FROM users 
                WHERE id = %s
                """,
                (user_id,)
            )
            user_data = cursor.fetchone()

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kullanıcı veritabanında bulunamadı."
            )

        # Şifre özeti gibi hassas verileri temizle
        user_data.pop("password_hash", None)
        return user_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Veritabanından profil çekilirken hata oluştu: {str(e)}"
        )


@router.put("", response_model=Dict[str, Any])
def update_client_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db_connection)
):
    """
    Kullanıcının profil, fiziki ve biyometrik verilerini Neon DB'de dinamik olarak günceller.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum zaman aşımına uğradı veya yetkisiz erişim."
        )

    update_fields = profile_data.model_dump(exclude_unset=True)

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Güncellenecek herhangi bir veri gönderilmedi."
        )

    # Dinamik SET ifadesi oluşturma (SQL Injection önlemli parameterized query)
    set_clauses = []
    values = []

    for key, value in update_fields.items():
        set_clauses.append(f"{key} = %s")
        values.append(value)

    values.append(user_id)
    query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = %s RETURNING id, first_name, last_name, email, phone, age, gender, height, weight, activity_level, goal, profile_photo, role"

    try:
        with conn.cursor() as cursor:
            cursor.execute(query, tuple(values))
            updated_user = cursor.fetchone()
            conn.commit()

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Güncellenecek kullanıcı kaydı bulunamadı."
            )

        return updated_user

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profil güncellenirken veritabanı hatası: {str(e)}"
        )


@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db_connection)
):
    """
    Kullanıcı profil fotoğrafını sunucu diski/public dizinine kaydeder ve Neon DB'deki profile_photo alanını günceller.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Fotoğraf yüklemek için giriş yapmalısınız."
        )

    allowed_extensions = {"jpg", "jpeg", "png", "webp"}
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz dosya formatı. Yalnızca JPG, PNG veya WEBP formatları desteklenir."
        )

    target_dir = os.path.join(os.getcwd(), "public", "fotos")
    os.makedirs(target_dir, exist_ok=True)

    filename = f"user_{user_id}_profile.{file_ext}"
    file_path = os.path.join(target_dir, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        photo_url = f"/fotos/{filename}"

        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE users SET profile_photo = %s WHERE id = %s",
                (photo_url, user_id)
            )
            conn.commit()

        return {
            "message": "Profil fotoğrafı başarıyla yüklendi ve veritabanı güncellendi.",
            "photo_url": photo_url
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fotoğraf kaydedilirken hata oluştu: {str(e)}"
        )