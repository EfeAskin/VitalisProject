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
    target_weight: Optional[float] = None
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
    target_weight: Optional[float] = None
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
# 9. SPECIALIST_PROFILES TABLE SCHEMA
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
# 10. MARKETPLACE_LISTINGS TABLE SCHEMA
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
# 11. SPECIALIST_SUBSCRIPTIONS TABLE SCHEMA
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
    program_name: Optional[List[str]] = []
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
# 13. WORKOUT & EXERCISE LIBRARY SCHEMAS
# ==========================================

class ExerciseBase(BaseModel):
    name: str
    muscle_group: str                         # Örn: 'Göğüs', 'Kol', 'Sırt'
    target_muscles: List[str] = []            # Örn: ['Üst Göğüs', 'Orta Göğüs', 'Triceps']
    difficulty_level: str                     # 'Başlangıç', 'Orta', 'İleri'
    video_url: Optional[str] = None           # YouTube Linki
    description: Optional[str] = None         # Egzersiz Açıklaması / Form Notları


class ExerciseCreate(ExerciseBase):
    pass


class Exercise(ExerciseBase):
    id: int
    trainer_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkoutTemplateExerciseItem(BaseModel):
    exercise_id: int
    sets: int = 3
    reps: str = "10-12"
    notes: Optional[str] = None               # Egzersize özel ek eğitmen notu
    order_index: Optional[int] = 0


class WorkoutTemplateCreate(BaseModel):
    name: str
    difficulty_level: str                     # 'Başlangıç', 'Orta', 'İleri'
    target_muscles: List[str] = []            # Şablonun içerdiği tüm kas grupları rozetleri
    duration_minutes: Optional[int] = 60
    estimated_calories: Optional[int] = 0     # Koçun antrenman için belirlediği tahmini kalori
    description: Optional[str] = None
    exercises: List[WorkoutTemplateExerciseItem] = []


class WorkoutTemplateResponse(BaseModel):
    id: int
    trainer_id: int
    name: str
    difficulty_level: str
    target_muscles: List[str] = []            # Filtreleme için hedef kas rozet dizisi
    duration_minutes: Optional[int] = 60
    estimated_calories: Optional[int] = 0     # Koçun antrenman için belirlediği tahmini kalori
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    exercises: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class WorkoutProgram(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    template_id: Optional[int] = None
    program_details: Dict[str, Any] = {}
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None
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
    step_count: Optional[int] = 0             # Günlük atılan adım sayısı
    step_calories: Optional[int] = 0          # Adımdan kazanılan kalori
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StepLogRequest(BaseModel):
    steps: int


# ==========================================
# 17. EXPERT ACTION & RESPONSE SCHEMAS
# ==========================================
class SubscriptionActionRequest(BaseModel):
    request_id: int
    action: str                               # 'accept' veya 'reject'
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
    program_name: Optional[List[str]] = []
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


# ==========================================
# 18. TICKETS TABLE SCHEMA
# ==========================================
class Ticket(BaseModel):
    id: Optional[int] = None
    ticket_code: str
    user_id: Optional[int] = None
    subject: str
    category: str
    priority: Optional[str] = "normal"
    status: Optional[str] = "processing"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 19. TICKET_MESSAGES TABLE SCHEMA
# ==========================================
class TicketMessage(BaseModel):
    id: Optional[int] = None
    ticket_id: Optional[int] = None
    sender_id: Optional[int] = None
    message_text: str
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 20. CHAT_ROOMS TABLE SCHEMA
# ==========================================
class ChatRoom(BaseModel):
    id: Optional[int] = None
    client_id: Optional[int] = None
    expert_id: Optional[int] = None
    is_ai_chat: Optional[bool] = False
    openai_thread_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 21. CHAT_MESSAGES TABLE SCHEMA
# ==========================================
class ChatMessage(BaseModel):
    id: Optional[int] = None
    room_id: Optional[int] = None
    sender_id: Optional[int] = None
    is_from_ai: Optional[bool] = False
    message_text: str
    is_read: Optional[bool] = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# 22. APPOINTMENTS TABLE SCHEMAS
# ==========================================
class AppointmentBase(BaseModel):
    title: Optional[str] = "Birebir Görüşme"
    appointment_date: str                     # YYYY-MM-DD
    time_slot: str                            # '14:00 - 14:45'
    appointment_type: str                     # 'online' veya 'in_person'
    notes: Optional[str] = None


class AppointmentCreateByClient(AppointmentBase):
    expert_id: int


class AppointmentCreateByExpert(AppointmentBase):
    client_id: int
    meeting_link: Optional[str] = None        # Online ise Zoom/Teams linki
    location_link: Optional[str] = None       # Yüz yüze ise Harita linki


class AppointmentStatusUpdate(BaseModel):
    status: str                               # 'approved', 'rejected', 'cancelled'
    rejection_reason: Optional[str] = None    # Reddetme durumunda açıklama sebebi
    meeting_link: Optional[str] = None        # Onaylarken online link eklenebilir
    location_link: Optional[str] = None       # Onaylarken harita linki eklenebilir


class AppointmentLinkUpdate(BaseModel):
    meeting_link: Optional[str] = None
    location_link: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    client_id: int
    expert_id: int
    duration_minutes: int
    status: str
    rejection_reason: Optional[str] = None
    meeting_link: Optional[str] = None
    location_link: Optional[str] = None
    created_by_role: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    client_name: Optional[str] = None
    expert_name: Optional[str] = None
    expert_title: Optional[str] = None

    class Config:
        from_attributes = True