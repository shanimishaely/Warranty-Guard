from fastapi import APIRouter, Body, HTTPException, Depends
from fastapi.encoders import jsonable_encoder

from app.auth.auth_bearer import get_current_user
from app.database.mongo_config import items_collection
from app.models.warranty_model import WarrantyItem
from bson import ObjectId
from typing import List

router = APIRouter()


@router.post("/", response_description="Add new warranty item")
async def add_item(
        item: WarrantyItem = Body(...),
        current_user: dict = Depends(get_current_user)  # הוספת הגנה וזיהוי
):
    item_data = jsonable_encoder(item)

    # חילוץ ה-ID מהטוקן והזרקה לנתונים
    user_id = current_user.get("user_id") or current_user.get("sub")
    item_data["user_id"] = str(user_id)

    new_item = await items_collection.insert_one(item_data)
    return {"id": str(new_item.inserted_id), "message": "Item added successfully!"}


@router.patch("/{id}", response_description="Update an item")
async def update_item(
        id: str,
        update_data: dict = Body(...),
        current_user: dict = Depends(get_current_user)  # אבטחה
):
    user_id = current_user.get("user_id") or current_user.get("sub")
    update_data = {k: v for k, v in update_data.items() if v is not None}

    if len(update_data) >= 1:
        # עדכון רק אם ה-ID מתאים וגם המשתמש הוא הבעלים
        update_result = await items_collection.update_one(
            {"_id": ObjectId(id), "user_id": str(user_id)},
            {"$set": update_data}
        )
        if update_result.modified_count == 1:
            return {"message": "Item updated successfully"}

    raise HTTPException(status_code=404, detail="Item not found or unauthorized")


@router.delete("/{id}", response_description="Delete an item")
async def delete_item(
        id: str,
        current_user: dict = Depends(get_current_user)  # אבטחה
):
    user_id = current_user.get("user_id") or current_user.get("sub")

    # מחיקה רק אם המשתמש הוא הבעלים
    delete_result = await items_collection.delete_one({
        "_id": ObjectId(id),
        "user_id": str(user_id)
    })

    if delete_result.deleted_count == 1:
        return {"message": "Item deleted successfully"}
    raise HTTPException(status_code=404, detail="Item not found or unauthorized")