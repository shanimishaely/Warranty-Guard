import motor.motor_asyncio

MONGO_DETAILS = "mongodb+srv://shanimisha:shani@cluster0.enszkgs.mongodb.net/?appName=Cluster0"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.warranty_db

# Collections
users_collection = db.get_collection("users")
items_collection = db.get_collection("items_collection")
receipts_collection = db.get_collection("receipts")