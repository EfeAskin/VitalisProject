import os
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from backend.database import get_db_connection

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication Engine"]
)

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-vitalis-os-key-2026-secure-layer")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REMEMBER_ME_EXPIRE_MINUTES = 10080

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(request: Request, conn = Depends(get_db_connection)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz veya süresi dolmuş oturum.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, first_name, last_name, email, phone, age, gender, height, weight, profile_photo, role, created_at 
            FROM users 
            WHERE email = %s
        """, (email,))
        user = cur.fetchone()
        if user is None:
            raise credentials_exception
        return user


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user = Depends(get_current_user)):
        if isinstance(current_user, dict):
            user_role = current_user.get("role")
        elif isinstance(current_user, (tuple, list)):
            user_role = current_user[10]
        else:
            user_role = getattr(current_user, "role", None)

        if not user_role or user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem veya sayfa için yetkiniz bulunmamaktadır."
            )
        return current_user


class UserRegisterInput(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str
    role: str
    gender: Optional[str] = "Diğer"
    age: Optional[int] = 18
    height: Optional[float] = 175.0
    weight: Optional[float] = 65.0
    profile_photo: Optional[str] = None


class UserLoginInput(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = False


@router.post("/register")
def register_user(data: UserRegisterInput, conn = Depends(get_db_connection)):
    hashed = hash_password(data.password)
    
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email = %s", (data.email,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresi sistemde zaten kayıtlı."
            )

        full_name = f"{data.first_name} {data.last_name}".strip()
        encoded_name = urllib.parse.quote(full_name if full_name else "Kullanıcı")
        default_avatar = f"https://ui-avatars.com/api/?name={encoded_name}&background=18231E&color=10B981&bold=true"

        avatar_url = data.profile_photo.strip() if (data.profile_photo and data.profile_photo.strip()) else default_avatar
        
        # Cinsiyet ve Telefon alanlarına VARCHAR(10) taşma koruması
        raw_gender = data.gender.strip() if (data.gender and data.gender.strip()) else "Diğer"
        user_gender = raw_gender[:10]  # Max 10 karaktere sığdırır
        
        user_phone = data.phone.strip() if data.phone else ""
        
        user_age = data.age if data.age is not None else 18
        user_height = data.height if data.height is not None else 175.0
        user_weight = data.weight if data.weight is not None else 65.0

        cur.execute("""
            INSERT INTO users (first_name, last_name, email, password_hash, phone, age, gender, height, weight, profile_photo, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, first_name, last_name, email, phone, age, gender, height, weight, profile_photo, role
        """, (data.first_name, data.last_name, data.email, hashed, user_phone, user_age, user_gender, user_height, user_weight, avatar_url, data.role))
        
        new_user = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success", 
            "message": "Kayıt başarıyla tamamlandı.", 
            "user": new_user
        }


@router.post("/login")
def login_user(data: UserLoginInput, response: Response, conn = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, first_name, last_name, email, password_hash, role 
            FROM users 
            WHERE email = %s
        """, (data.email,))
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Hatalı e-posta veya şifre."
            )
        
        pwd_hash = user.get("password_hash") if isinstance(user, dict) or hasattr(user, "get") else user[4]
        if not pwd_hash or not verify_password(data.password, pwd_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Hatalı e-posta veya şifre."
            )
        
        user_id = user.get("id") if isinstance(user, dict) or hasattr(user, "get") else user[0]
        first_name = user.get("first_name") if isinstance(user, dict) or hasattr(user, "get") else user[1]
        last_name = user.get("last_name") if isinstance(user, dict) or hasattr(user, "get") else user[2]
        email = user.get("email") if isinstance(user, dict) or hasattr(user, "get") else user[3]
        role = user.get("role") if isinstance(user, dict) or hasattr(user, "get") else user[5]

        expire_minutes = REMEMBER_ME_EXPIRE_MINUTES if data.rememberMe else ACCESS_TOKEN_EXPIRE_MINUTES
        access_token_expires = timedelta(minutes=expire_minutes)
        
        token_data = {
            "sub": email,
            "role": role,
            "user_id": user_id
        }
        token = create_access_token(data=token_data, expires_delta=access_token_expires)
        
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            path="/",
            max_age=expire_minutes * 60
        )
        
        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "role": role,
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "name": f"{first_name} {last_name}".strip()
        }


@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {
        "status": "success",
        "message": "Güvenli çıkış başarıyla gerçekleştirildi."
    }


@router.get("/expert/secure-metrics")
def get_expert_dashboard_metrics(current_user = Depends(RoleChecker(["trainer", "dietitian"]))):
    return {
        "status": "authorized",
        "total_assigned_clients": 14,
        "pending_appointments": 3,
        "system_layer": "Vitalis OS Expert Engine V1"
    }


@router.get("/me")
def get_logged_in_user(current_user = Depends(get_current_user)):
    if isinstance(current_user, dict) or hasattr(current_user, "get"):
        first_name = current_user.get("first_name") or ""
        last_name = current_user.get("last_name") or ""
        photo = current_user.get("profile_photo")
        
        if not photo or not str(photo).strip():
            full_name = f"{first_name} {last_name}".strip() or "Kullanıcı"
            photo = f"https://ui-avatars.com/api/?name={urllib.parse.quote(full_name)}&background=18231E&color=10B981&bold=true"

        return {
            "id": current_user.get("id"),
            "first_name": first_name,
            "last_name": last_name,
            "email": current_user.get("email"),
            "phone": current_user.get("phone"),
            "age": current_user.get("age") if current_user.get("age") is not None else 18,
            "gender": current_user.get("gender") or "Diğer",
            "height": current_user.get("height") if current_user.get("height") is not None else 175.0,
            "weight": current_user.get("weight") if current_user.get("weight") is not None else 65.0,
            "profile_photo": photo,
            "role": current_user.get("role"),
            "created_at": current_user.get("created_at")
        }
    elif isinstance(current_user, (tuple, list)):
        first_name = current_user[1] if len(current_user) > 1 and current_user[1] else ""
        last_name = current_user[2] if len(current_user) > 2 and current_user[2] else ""
        photo = current_user[9] if len(current_user) > 9 and current_user[9] else None
        
        if not photo or not str(photo).strip():
            full_name = f"{first_name} {last_name}".strip() or "Kullanıcı"
            photo = f"https://ui-avatars.com/api/?name={urllib.parse.quote(full_name)}&background=18231E&color=10B981&bold=true"

        return {
            "id": current_user[0],
            "first_name": first_name,
            "last_name": last_name,
            "email": current_user[3] if len(current_user) > 3 else None,
            "phone": current_user[4] if len(current_user) > 4 else None,
            "age": current_user[5] if len(current_user) > 5 and current_user[5] is not None else 18,
            "gender": current_user[6] if len(current_user) > 6 and current_user[6] else "Diğer",
            "height": current_user[7] if len(current_user) > 7 and current_user[7] is not None else 175.0,
            "weight": current_user[8] if len(current_user) > 8 and current_user[8] is not None else 65.0,
            "profile_photo": photo,
            "role": current_user[10] if len(current_user) > 10 else "client",
            "created_at": current_user[11] if len(current_user) > 11 else None
        }
    return current_user