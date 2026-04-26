from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class WarrantyItem(BaseModel):
    name: str
    price: float = Field(..., gt=0)
    purchase_date: datetime
    warranty_months: int
    category: Optional[str] = "General"
    receipt_url: Optional[str] = None  # הלינק לתמונה
    receipt_id: Optional[str] = None  # הקישור למודל הקבלה ב-DB
    store_name: Optional[str] = None
    user_id: str
    warranty_expiration: Optional[datetime] = None
    class Config:
        from_attributes = True
