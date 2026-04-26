import os

import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.warranty_db

# Collections
users_collection = db.get_collection("users")
items_collection = db.get_collection("items_collection")
receipts_collection = db.get_collection("receipts")