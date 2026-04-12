from fastapi import FastAPI
from app.routes.user_routes import router as UserRouter
from app.routes.receipt_routes import router as ReceiptRouter
from app.routes.item_routes import router as ItemRouter
from fastapi.middleware.cors import CORSMiddleware
from app.services.notifications import send_notifications_task
import asyncio
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: מפעיל את משימת ההתראות ברקע
    print("🚀 Starting Background Notification Task...")
    task = asyncio.create_task(send_notifications_task())
    yield
    # Shutdown
    task.cancel()

print("########################################")
print("SHANI!, THE SERVER IS STARTING NOW!!!!!!")
print("########################################")

app = FastAPI(title="Smart Warranty Manager API", lifespan=lifespan)

# CORS - פתוח להכל כרגע כדי למנוע שגיאות התחברות מהפרונט
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers - שימי לב לקידומות (Prefix)
app.include_router(UserRouter, tags=["Users"], prefix="/users")
app.include_router(ReceiptRouter, tags=["Receipts"], prefix="/receipts")
app.include_router(ItemRouter, tags=["Items"], prefix="/items")

@app.get("/")
def home():
    return {"message": "Warranty Guard API is running", "status": "online"}

# הנגשת קבצים סטטיים (לתמונות של הקבלות)
app.mount("/static", StaticFiles(directory="static"), name="static")