from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from app.database.mongo_config import items_collection
from app.models.warranty_model import WarrantyItem
from bson import ObjectId
from typing import List

router = APIRouter()

# 1. הוספה (POST)
@router.post("/", response_description="Add new warranty item")
async def add_item(item: WarrantyItem = Body(...)):
    item_data = jsonable_encoder(item)
    new_item = await items_collection.insert_one(item_data)
    return {"id": str(new_item.inserted_id), "message": "Item added successfully!"}

# 2. הצגת כל המוצרים (GET) - זה הכפתור שחסר לך!
@router.get("/", response_description="List all items", response_model=List[dict])
async def list_items():
    items = await items_collection.find().to_list(1000)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

# 3. עדכון (PATCH)
@router.patch("/{id}", response_description="Update an item")
async def update_item(id: str, update_data: dict = Body(...)):
    update_data = {k: v for k, v in update_data.items() if v is not None}
    if len(update_data) >= 1:
        update_result = await items_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": update_data}
        )
        if update_result.modified_count == 1:
            return {"message": "Item updated successfully"}
    return {"message": "Nothing to update or item not found"}

# 4. מחיקה (DELETE)
@router.delete("/{id}", response_description="Delete an item")
async def delete_item(id: str):
    delete_result = await items_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"message": "Item deleted successfully"}
    raise HTTPException(status_code=404, detail=f"Item with id {id} not found")