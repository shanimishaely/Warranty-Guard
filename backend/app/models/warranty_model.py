from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class WarrantyItem(BaseModel):
    name: str = Field(..., example="מכונת כביסה LG")
    price: float = Field(..., gt=0)
    purchase_date: datetime
    warranty_months: int
    category: Optional[str] = "General"
    receipt_url: Optional[str] = None  # הלינק לתמונה
    receipt_id: Optional[str] = None  # הקישור למודל הקבלה ב-DB
    store_name: Optional[str] = None
    user_id: str = Field(..., example="user_12345")  # חובה כדי לשייך למשתמש

    class Config:
        from_attributes = True