from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class Receipt(BaseModel):
    user_id: str = Field(..., description="ID of the user who uploaded the receipt")
    image_url: str = Field(..., description="The path or URL to the stored image file")

    store_name: Optional[str] = Field(None)
    total_amount: Optional[float] = Field(None)
    purchase_date: Optional[datetime] = Field(None)
    warranty_expiration: Optional[datetime] = Field(None)
    notification_sent: bool = Field(default=False)
    raw_text: Optional[str] = Field(None)
    upload_date: datetime = Field(default_factory=datetime.now)
    is_processed: bool = Field(default=False)

    class Config:
        populate_by_name = True