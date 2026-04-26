from fastapi import APIRouter, HTTPException, status, Depends, Body
from app.models.user_model import User
from app.utils.security import hash_password, verify_password
from app.database.mongo_config import users_collection
from app.auth.auth_handler import sign_jwt
from app.auth.auth_bearer import JWTBearer

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: User):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user.password)
    result = await users_collection.insert_one(user_dict)

    return {"status": "User created successfully", "user_id": str(result.inserted_id)}


@router.post("/login")
async def login(user: dict = Body(...)):
    db_user = await users_collection.find_one({"email": user.get("email")})
    if not db_user or not verify_password(user.get("password"), db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = sign_jwt(
        user_id=str(db_user["_id"]),
        email=db_user["email"],
        phone=db_user.get("phone")
    )

    return {
        "status": "Login Successful",
        "user": {
            "email": db_user["email"],
            "username": db_user.get("username"),
            "phone": db_user.get("phone")
        },
        **token_data
    }


@router.get("/me")
async def get_me(payload: dict = Depends(JWTBearer())):
    user_email = payload.get("email")
    db_user = await users_collection.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": db_user.get("username"),
        "email": db_user.get("email"),
        "phone": db_user.get("phone")
    }


@router.put("/update")
async def update_user(update_data: dict, payload: dict = Depends(JWTBearer())):
    user_email = payload.get("email")
    update_fields = {k: v for k, v in update_data.items() if k in ["username", "phone"]}

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    await users_collection.update_one({"email": user_email}, {"$set": update_fields})
    return {"status": "User updated successfully"}