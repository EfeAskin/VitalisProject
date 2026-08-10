from pydantic import BaseModel, Field, EmailStr
from typing import Any, Dict, List, Optional
from datetime import date, datetime

# ==========================================
# 1. USERS TABLE SCHEMA
# ==========================================
class User(BaseModel):
    id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password_hash: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    profile_photo: Optional[str] = None
    role: Optional[str] = "client"
    target_kcal: Optional[int] = 2250
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    profile_photo: Optional[str] = None


# ==========================================
# 2. BODY_ANALYSES TABLE SCHEMA
# ==========================================
class BodyAnalysis(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    weight: Optional[float] = None  
    neck: Optional[float] = None    
    waist: Optional[float] = None   
    hip: Optional[float] = None    
    body_fat: Optional[float] = None
    bmr: Optional[float] = None
    bmi: Optional[float] = None
    ideal_weight: Optional[float] = None
    lbm: Optional[float] = None
    measured_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 3. WATER_LOGS TABLE SCHEMA
# ==========================================
class WaterLog(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    water_target: Optional[float] = 2000.0
    water_consumed: Optional[float] = 0.0
    log_date: Optional[date] = None

    class Config:
        from_attributes = True


# ==========================================
# 4. DAILY_TASKS TABLE SCHEMA
# ==========================================
class DailyTaskLog(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    text: str
    priority: Optional[str] = "Orta"
    checked: Optional[bool] = False
    task_date: Optional[date] = None

    class Config:
        from_attributes = True


# ==========================================
# 5. WORKOUT_LOGS TABLE SCHEMA
# ==========================================
class WorkoutLog(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    day_name: str
    completed: Optional[bool] = False
    log_date: Optional[date] = None

    class Config:
        from_attributes = True


# ==========================================
# 6. ONBOARDING_ASSESSMENTS TABLE SCHEMA
# ==========================================
class OnboardingAssessment(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None  
    gender: str
    activity_level: str
    goal: str
    age: int
    height: float
    weight: float
    neck: Optional[float] = None
    waist: Optional[float] = None
    hip: Optional[float] = None
    body_fat: Optional[float] = None
    lbm: Optional[float] = None
    bmr: Optional[float] = None
    bmi: Optional[float] = None      
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 7. DIETITIAN_TARGETS TABLE SCHEMA
# ==========================================
class DietitianTarget(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    dietitian_id: Optional[int] = None
    min_kcal: Optional[int] = None
    max_kcal: Optional[int] = None
    min_protein: Optional[int] = None
    max_protein: Optional[int] = None
    min_carbs: Optional[int] = None
    max_carbs: Optional[int] = None
    min_fat: Optional[int] = None
    max_fat: Optional[int] = None
    dietitian_note: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 8. CLIENT_MEAL_LOGS TABLE SCHEMA
# ==========================================
class ClientMealLog(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    meal_text: str
    kcal: Optional[int] = 0
    protein: Optional[float] = 0.0
    carbs: Optional[float] = 0.0
    fat: Optional[float] = 0.0
    logged_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClientMealLogCreate(BaseModel):
    client_id: int
    meal_text: str
    kcal: Optional[int] = 0
    protein: Optional[float] = 0.0
    carbs: Optional[float] = 0.0
    fat: Optional[float] = 0.0


# ==========================================
# 9. SPECIALIST_PROFILES TABLE SCHEMA (YENİ EKLENDİ)
# ==========================================
class SpecialistProfile(BaseModel):
    id: Optional[int] = None
    user_id: int
    title: Optional[str] = "Uzman Koç"
    bio: Optional[str] = ""
    specialties: Optional[List[str]] = []
    is_accepting_clients: Optional[bool] = True
    rating: Optional[float] = 5.0
    review_count: Optional[int] = 0
    profile_views: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 10. MARKETPLACE_LISTINGS TABLE SCHEMA (YENİ EKLENDİ)
# ==========================================
class MarketplaceListing(BaseModel):
    id: Optional[int] = None
    specialist_id: int
    title: str
    price: float
    period: str = "Aylık"
    description: Optional[str] = ""
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 11. SPECIALIST_SUBSCRIPTIONS TABLE SCHEMA (GÜNCELLENDİ)
# ==========================================
class SpecialistSubscription(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    specialist_id: Optional[int] = None
    client_user_id: Optional[int] = None
    specialist_user_id: Optional[int] = None
    specialist_type: Optional[str] = "trainer"
    package_name: Optional[str] = None
    status: Optional[str] = "pending"
    goal: Optional[str] = None
    program_name: Optional[str] = "Henüz Program Atanmadı"
    request_message: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 12. NUTRITION_PROGRAMS TABLE SCHEMA
# ==========================================
class NutritionProgram(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    dietitian_id: Optional[int] = None
    program_details: Dict[str, Any]
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 13. WORKOUT_PROGRAMS TABLE SCHEMA
# ==========================================
class WorkoutProgram(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    program_details: Dict[str, Any]
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 14. SHARED DASHBOARD INTEGRATION SCHEMA
# ==========================================
class SharedClientDashboard(BaseModel):
    client_info: User
    assessment: Optional[OnboardingAssessment] = None
    diet_targets: Optional[DietitianTarget] = None
    logged_meals_today: List[ClientMealLog] = []
    water_log_today: Optional[WaterLog] = None
    daily_tasks_today: List[DailyTaskLog] = []
    workout_progress_week: List[WorkoutLog] = []
    nutrition_program: Optional[NutritionProgram] = None
    workout_program: Optional[WorkoutProgram] = None

    class Config:
        from_attributes = True


# ==========================================
# 15. EXPERT_NOTES TABLE SCHEMA
# ==========================================
class ExpertNote(BaseModel):
    id: Optional[int] = None
    specialist_id: int
    client_id: int
    note_text: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExpertNoteCreate(BaseModel):
    specialist_id: int
    note_text: str


# ==========================================
# 16. CLIENT_DAILY_LOGS TABLE SCHEMA
# ==========================================
class ClientDailyLog(BaseModel):
    id: Optional[int] = None
    client_id: int
    log_date: date
    weight: Optional[float] = None
    workout_done: Optional[bool] = False
    diet_done: Optional[bool] = False
    calories_consumed: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 17. EXPERT ACTION & RESPONSE SCHEMAS
# ==========================================
class SubscriptionActionRequest(BaseModel):
    request_id: int
    action: str  # 'accept' veya 'reject'
    package_days: Optional[int] = 90


class ClientSummaryForExpert(BaseModel):
    subscription_id: int
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    current_weight: Optional[float] = None
    daily_calories: Optional[int] = None
    package_name: str
    goal: Optional[str] = None
    program_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str


class PendingRequestForExpert(BaseModel):
    request_id: int
    client_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    requested_package: str
    goal: Optional[str] = None
    message: Optional[str] = None
    request_date: datetime


class MarketplaceProfileUpdate(BaseModel):
    bio: Optional[str] = None
    specialties: Optional[List[str]] = None
    is_accepting_clients: Optional[bool] = None


class MarketplaceListingCreate(BaseModel):
    title: str
    price: float
    period: str
    description: Optional[str] = ""


class MarketplaceListingUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    period: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None