import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Geliştirdiğimiz tüm router'ları eksiksiz içeri aktarıyoruz
from backend.routers import auth, shared, user, footer, dietitian, meals, clientprofile, body_analysis, nutrition
from backend.routers.water import router as water_router
from backend.routers import expertprofile
from backend.routers import expertclient
from backend.routers import expertmarketplace
from backend.routers import clientmarketplace

from backend.routers import expertprograms
from backend.routers import expertatama

# ==========================================
# 1. FASTAPI UYGULAMA YAPILANDIRMASI
# ==========================================
app = FastAPI(
    title="Vitalis-OS Enterprise API Engine",
    description="Vitalis-OS Sağlık, Beslenme, Antrenman ve Analiz Yönetim Sistemi Çekirdek API Katmanı",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI dokümantasyon yolu
    redoc_url="/redoc"      # ReDoc alternatif dokümantasyon yolu
)

# ==========================================
# 2. STATİK DOSYA SUNUCUSU (PROFİL FOTOĞRAFLARI VB.)
# ==========================================
# Yüklenen profil fotoğraflarının tarayıcıda /fotos/resim.jpg şeklinde erişilebilmesi için
public_fotos_dir = os.path.join(os.getcwd(), "public", "fotos")
os.makedirs(public_fotos_dir, exist_ok=True)
app.mount("/fotos", StaticFiles(directory=public_fotos_dir), name="fotos")

# ==========================================
# 3. CORS (CROSS-ORIGIN RESOURCE SHARING) GÜVENLİK AYARI
# ==========================================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, OPTIONS vb. tüm metodlar
    allow_headers=["*"],  # Authorization (JWT Bearer Token), Content-Type vb. tüm header'lar
)

# ==========================================
# 4. TÜM ROUTER'LARIN (UÇ NOKTALARIN) BAĞLANMASI
# ==========================================

# 🔑 Kimlik Doğrulama, Kayıt, Giriş ve Oturum Yönetim Motoru
app.include_router(auth.router)

# 👤 Kullanıcı Profil İşlemleri, Vücut Analizleri ve Hesaplama Algoritmaları
app.include_router(user.router)

# 📊 Vücut Analizi ve Geçmiş Takibi Router'ı (Eksik olan bağlantı eklendi)
app.include_router(body_analysis.router)

# 👤 Dinamik Danışan Profil Yönetimi ve Fotoğraf Yükleme Motoru
app.include_router(clientprofile.router)

# 🍏 Diyetisyen Hedefleri, Atamaları ve Danışan Takip Sistemleri
app.include_router(dietitian.router)

# 🍲 Öğün Kayıtları, Su Tüketim Logları ve Makro/Kalori Hesaplama Sistemleri
app.include_router(meals.router)

# 💧 Su Tüketim Takip Router'ı
app.include_router(water_router)

# 📊 Entegre Ortak Danışan ve Uzman İzleme Paneli (Shared Dashboard Integration API)
app.include_router(shared.router)

app.include_router(nutrition.router)

# 🌐 Footer ve Genel Bilgilendirme Servisleri
app.include_router(footer.router)

app.include_router(expertprofile.router)

app.include_router(expertclient.router) # <-- YENİ EKLENDİ

app.include_router(expertmarketplace.router)

app.include_router(clientmarketplace.router)

app.include_router(expertprograms.router)
app.include_router(expertatama.router)

# ==========================================
# 5. SAĞLIK KONTROLÜ (HEALTH CHECK) VE ANA SAYFA
# ==========================================
@app.get("/", tags=["Health Check"])
def read_root():
    """
    Sistemin ayakta ve stabil çalışıp çalışmadığını kontrol eden 
    ve uygulamanın ana sürüm bilgilerini dönen kök uç noktası.
    """
    return {
        "status": "active",
        "message": "Vitalis-OS Backend Engine is running successfully!",
        "version": "1.0.0",
        "environment": os.getenv("ENV_MODE", "development"),
        "active_modules": [
            "Authentication (Unified OAuth2/JWT)",
            "User Management & Anthropometric Analysis",
            "Body Analysis History Tracking",
            "Client Profile Dynamic Management & Avatar Upload",
            "Dietitian Target Control",
            "Hydration & Meal Tracking",
            "Shared Specialist-Client Dashboard",
            "Footer Services"
        ]
    }