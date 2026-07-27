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
# 9. SPECIALIST_SUBSCRIPTIONS TABLE SCHEMA
# ==========================================
class SpecialistSubscription(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    specialist_id: Optional[int] = None
    specialist_type: str  
    status: Optional[str] = "active"
    subscribed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 10. NUTRITION_PROGRAMS TABLE SCHEMA
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
# 11. WORKOUT_PROGRAMS TABLE SCHEMA
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
# 12. SHARED DASHBOARD INTEGRATION SCHEMA
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