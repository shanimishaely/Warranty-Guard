import smtplib, requests, asyncio,os
from email.message import EmailMessage
from datetime import datetime, timedelta

from bson import ObjectId
from dotenv import load_dotenv
from app.database.mongo_config import db
from app.services.email_service import EmailService

load_dotenv()



async def send_notifications_task():
    print("🚀 שירות ההתראות הופעל ורץ ברקע...")
    while True:
        try:
            now = datetime.now()
            limit_date = now + timedelta(days=30)

            # חיפוש קבלות שפגות ב-30 הימים הקרובים ולא קיבלו התראה
            cursor = db["receipts"].find({
                "warranty_expiration": {"$lte": limit_date},
                "notification_sent": {"$ne": True}
            })

            receipts = await cursor.to_list(length=1000)

            for r in receipts:
                user = await db["users"].find_one({"_id": ObjectId(r["user_id"])})
                if not user or not user.get("email"):
                    continue

                item_name = r.get('store_name', 'מוצר')
                exp_date_val = r.get('warranty_expiration')
                if isinstance(exp_date_val, str):
                    # אם זה סטרינג, נהפוך אותו לתצוגה יפה למייל
                    display_date = datetime.strptime(exp_date_val, "%Y-%m-%d").strftime('%d/%m/%Y')
                else:
                    display_date = exp_date_val.strftime('%d/%m/%Y')
                EmailService.send_reminder(
                    to_email=user["email"],
                    item_name=item_name,
                    expiration_date=display_date
                )

                if os.getenv("WA_TOKEN") and user.get("phone"):
                    send_whatsapp_notification(user["phone"], item_name, display_date)

                # עדכון ה-DB
                await db["receipts"].update_one(
                    {"_id": r["_id"]},
                    {"$set": {"notification_sent": True}}
                )

        except Exception as e:
            print(f"❌ שגיאה כללית במשימת ההתראות: {e}")

        await asyncio.sleep(86400)  # ריצה פעם ביום


def send_whatsapp_notification(phone, item_name, exp_date):
    url = f"https://api.ultramsg.com/{os.getenv('WA_INSTANCE')}/messages/chat"
    msg = f"היי! תזכורת מ-Smart-W: האחריות על {item_name} מסתיימת ב-{exp_date}. כדאי לבדוק שהכל תקין! 🛡️"

    payload = {
        "token": os.getenv("WA_TOKEN"),
        "to": f"+972{phone[1:]}" if phone.startswith("0") else phone,
        "body": msg
    }
    try:
        requests.post(url, data=payload, timeout=10)
    except Exception as e:
        print(f"📱 WhatsApp failed: {e}")