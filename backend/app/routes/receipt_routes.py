from bson import ObjectId
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile
from app.database.mongo_config import receipts_collection
from app.services.ai_service import AIService
from app.auth.auth_bearer import get_current_user
import shutil
import os
import uuid
from datetime import datetime
from fastapi import Form

router = APIRouter()
UPLOAD_DIR = "static/receipts"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_receipt(
        file: UploadFile = File(...),
        warranty_months: int = Form(12),
        current_user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
        raise HTTPException(status_code=400, detail="Only images and PDF allowed")

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        raw_text = await AIService.process_receipt_image(file_path)
        extracted = AIService.extract_data(raw_text)

        # חישוב תאריך תפוגה אמין לפי מה שהמשתמש בחר
        p_date = datetime.strptime(extracted.get("purchase_date"), "%Y-%m-%d")
        warranty_expiration = (p_date + relativedelta(months=warranty_months)).strftime("%Y-%m-%d")

        current_uid = current_user.get("user_id") or current_user.get("sub")

        receipt_document = {
            "user_id": str(current_uid),
            "image_url": file_path,
            "store_name": extracted.get("store_name"),
            "total_amount": extracted.get("total_amount"),
            "purchase_date": datetime.strptime(extracted.get("purchase_date"), "%Y-%m-%d"),
            "warranty_period": warranty_months,  # שומרים את התקופה שנבחרה
            "warranty_expiration": datetime.strptime(warranty_expiration, "%Y-%m-%d"),
            "is_processed": True,
            "upload_date": datetime.now(),
            "notification_sent": False
        }

        result = await receipts_collection.insert_one(receipt_document)
        return {
            "status": "Success",
            "receipt_id": str(result.inserted_id),
            "analyzed_data": {**extracted, "warranty_expiration": warranty_expiration}
        }
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Error processing receipt")

@router.get("/my-receipts")
async def get_user_receipts(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id") or current_user.get("sub")

    if not user_id:
        raise HTTPException(status_code=403, detail="User ID not found in token")

    # חיפוש במונגו לפי ה-ID
    cursor = receipts_collection.find({"user_id": str(user_id)})
    receipts = await cursor.to_list(length=100)

    for r in receipts:
        r["_id"] = str(r["_id"])

    return {"total": len(receipts), "receipts": receipts}


@router.delete("/{receipt_id}")
async def delete_receipt(
        receipt_id: str,
        current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id") or current_user.get("sub")

    # מחיקה רק אם הקבלה שייכת למשתמש הנוכחי
    result = await receipts_collection.delete_one({
        "_id": ObjectId(receipt_id),
        "user_id": str(user_id)
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Receipt not found or unauthorized")

    return {"status": "Success", "message": "Receipt deleted"}