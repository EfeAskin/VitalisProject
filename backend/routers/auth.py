import os
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from backend.database import get_db_connection

# Router Yapılandırması
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication Engine"]
)

# .env'den güvenli anahtar ve süre ayarları
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-vitalis-os-key-2026-secure-layer")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REMEMBER_ME_EXPIRE_MINUTES = 10080  # 7 gün (dakika cinsinden)

# Şifre özetleme motoru (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token'ın çözüleceği rota tanımlaması
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# --- 1. ŞİFRELEME VE TOKEN YARDIMCILARI ---

def hash_password(password: str) -> str:
    """Şifreyi güçlü bir salt ile tek yönlü hash'ler."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Gelen düz şifreyi db hash'iyle zamanlama saldırısına dirençli şekilde doğrular."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Payload verilerinden şifreli bir JWT üretir."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(request: Request, conn = Depends(get_db_connection)):
    """Hem HttpOnly Cookie'den hem de Authorization Header'dan token'ı okur ve kullanıcıyı doğrular."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz veya süresi dolmuş oturum.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Öncelik: HttpOnly Cookie içindeki access_token
    token = request.cookies.get("access_token")
    
    # 2. Öncelik: Authorization Header (Bearer Token)
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


# 🔐 SİBER GÜVENLİK KATMANI: Rol Tabanlı Erişim Kontrolü (RBAC) Bağımlılığı
class RoleChecker:
    """İsteği atan kullanıcının rolünü doğrular, yetkisiz ise geçit vermez."""
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
                detail="Bu işlem veya sayfa için yetkiniz bulunmamaktadır. Erişim engellendi."
            )
        return current_user


# --- 2. INPUT PYDANTIC MODELLERİ ---

class UserRegisterInput(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str
    role: str  # 'client', 'dietitian', 'trainer', 'admin'


class UserLoginInput(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = False


# --- 3. ENDPOINT ROTALARI ---

@router.post("/register")
def register_user(data: UserRegisterInput, conn = Depends(get_db_connection)):
    """Kullanıcıyı siber güvenli tuzlama yöntemiyle şifreleyerek Neon DB'ye yazar."""
    hashed = hash_password(data.password)
    
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email = %s", (data.email,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresi sistemde zaten kayıtlı."
            )

        cur.execute("""
            INSERT INTO users (first_name, last_name, email, password_hash, phone, age, gender, height, weight, role)
            VALUES (%s, %s, %s, %s, %s, 22, 'erkek', 180.0, 75.2, %s)
            RETURNING id, first_name, last_name, email, phone, role
        """, (data.first_name, data.last_name, data.email, hashed, data.phone, data.role))
        
        new_user = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success", 
            "message": "Kayıt başarıyla tamamlandı.", 
            "user": new_user
        }


@router.post("/login")
def login_user(data: UserLoginInput, response: Response, conn = Depends(get_db_connection)):
    """Neon DB üzerinden kullanıcıyı doğrular, maksimum güvenlik için HttpOnly Cookie set eder."""
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
        
        # 🛡️ XSS Korumalı HttpOnly Cookie (path="/" eklendi)
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
    """Oturum çerezini imha ederek çıkış sağlar."""
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
    """Oturum açan kullanıcının güncel kimlik ve profil bilgilerini (profile_photo dahil) Neon DB'den döner."""
    if isinstance(current_user, dict) or hasattr(current_user, "get"):
        return {
            "id": current_user.get("id"),
            "first_name": current_user.get("first_name"),
            "last_name": current_user.get("last_name"),
            "email": current_user.get("email"),
            "phone": current_user.get("phone"),
            "age": current_user.get("age"),
            "gender": current_user.get("gender"),
            "height": current_user.get("height"),
            "weight": current_user.get("weight"),
            "profile_photo": current_user.get("profile_photo"),
            "role": current_user.get("role"),
            "created_at": current_user.get("created_at")
        }
    elif isinstance(current_user, (tuple, list)):
        return {
            "id": current_user[0],
            "first_name": current_user[1],
            "last_name": current_user[2],
            "email": current_user[3],
            "phone": current_user[4] if len(current_user) > 4 else None,
            "age": current_user[5] if len(current_user) > 5 else None,
            "gender": current_user[6] if len(current_user) > 6 else None,
            "height": current_user[7] if len(current_user) > 7 else None,
            "weight": current_user[8] if len(current_user) > 8 else None,
            "profile_photo": current_user[9] if len(current_user) > 9 else None,
            "role": current_user[10] if len(current_user) > 10 else "client",
            "created_at": current_user[11] if len(current_user) > 11 else None
        }
    return current_user