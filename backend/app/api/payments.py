from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment

router = APIRouter()


@router.get("")
def get_payments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Pasiyent və ya psixoloqun ödəniş tarixçəsi"""
    payments = db.query(Payment).filter(
        (Payment.patient_id == current_user.id) | (Payment.psychologist_id == current_user.id)
    ).order_by(Payment.created_at.desc()).all()

    return [
        {
            "id": str(p.id),
            "amount": p.amount,
            "status": p.status,
            "created_at": str(p.created_at),
        }
        for p in payments
    ]
