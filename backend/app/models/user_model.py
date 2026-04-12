from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    created_at: datetime = Field(default_factory=datetime.now)
    # תיקון: מחרוזת (str) ולא רשימה, עם ערך ברירת מחדל None כדי שלא יהיה חובה בלוגין
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$", description="מספר טלפון נייד (10 ספרות)")

    class Config:
        from_attributes = True