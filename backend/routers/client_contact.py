from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/client", tags=["Client Contact & Support"])

class AppointmentCreate(BaseModel.model):
    expert_name: str
    date: str
    time: str
    note: Optional[str] = None

class TicketCreate(BaseModel):
    subject: str
    category: str
    priority: str
    message: str

@router.get("/appointments")
def get_client_appointments():
    # PostgreSQL / Neon DB üzerinden kullanıcının randevularını çekme
    return [{"status": "success", "data": []}]

@router.post("/appointments")
def create_appointment(appt: AppointmentCreate):
    # Neon DB'ye yeni randevu kaydı ekleme
    return {"status": "success", "message": "Randevu talebiniz başarıyla oluşturuldu."}

@router.post("/tickets")
def create_support_ticket(ticket: TicketCreate):
    # CypInvest tarzı ticket oluşturma mantığı
    return {"status": "success", "ticket_id": "VTS-9921", "message": "Destek talebiniz admin ekibine iletildi."}