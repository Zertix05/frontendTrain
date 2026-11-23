from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PaymentWebhook(BaseModel):
    order_id: str
    order_num: str
    product_name: str
    product_id: str
    payment_id: str
    payment_status: str
    payment_date: str
    customer_email: str
    customer_phone: Optional[str] = None
    sum: float
    currency: str
    commission: Optional[float] = None
    profit: Optional[float] = None

class PaymentStatus(BaseModel):
    order_id: str
    status: str
    amount: float
    currency: str
    created_at: datetime
    paid_at: Optional[datetime] = None