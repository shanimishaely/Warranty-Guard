import smtplib, requests, asyncio
from email.mime.text import MIMEText
from datetime import datetime, timedelta
# שימי לב: אני משנה את הייבוא ל-db, שהוא האובייקט של motor
from app.database.mongo_config import db

# הגדרות - אל תשכחי לעדכן לפרטים האמיתיים שלך
EMAIL_USER = "your_email@gmail.com"
EMAIL_PASS = "your_app_password"
WA_TOKEN = "your_ultramsg_token"
WA_INSTANCE = "instance_id"

async def send_notifications_task():
    while True:
        try:
            # חישוב תאריך היעד (בדיוק 30 יום מהיום)
            now = datetime.now()
            target_date_start = (now + timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
            target_date_end = target_date_start + timedelta(days=1)

            # חיפוש קבלות
            # כאן התיקון: ניגשים ל-db["receipts"] ולא ל-MONGO_DETAILS
            cursor = db["receipts"].find({
                "warranty_expiration": {
                    "$gte": target_date_start,
                    "$lt": target_date_end
                },
                "notification_sent": {"$ne": True}
            })

            receipts = await cursor.to_list(length=1000)

            for r in receipts:
                # חיפוש המשתמש לפי user_id
                user = await db["users"].find_one({"_id": r["user_id"]})
                if not user:
                    continue

                msg = f"היי {user.get('username', 'חבר')}, האחריות על {r.get('store_name', 'מוצר')} בסך ₪{r.get('total_amount', 0)} מסתיימת בעוד 30 יום! לבדיקתך. Smart-W 🛡️"

                # 1. שליחת מייל
                try:
                    msg_mail = MIMEText(msg, 'plain', 'utf-8')
                    msg_mail['Subject'] = "התראת אחריות - Smart-W"
                    msg_mail['From'] = EMAIL_USER
                    msg_mail['To'] = user["email"]

                    server = smtplib.SMTP("smtp.gmail.com", 587)
                    server.starttls()
                    server.login(EMAIL_USER, EMAIL_PASS)
                    server.send_message(msg_mail)
                    server.quit()
                except Exception as e:
                    print(f"Email failed: {e}")

                # 2. שליחת וואטסאפ (בדיקה למספרים כשרים/קוויים)
                phone = user.get("phone")
                if phone and phone.startswith("05"):
                    try:
                        requests.post(
                            f"https://api.ultramsg.com/{WA_INSTANCE}/messages/chat",
                            data={
                                "token": WA_TOKEN,
                                "to": f"+972{phone[1:]}",
                                "body": msg
                            },
                            timeout=10
                        )
                    except Exception as e:
                        print(f"WhatsApp failed: {e}")

                # סימון ב-DB שלא נשלח שוב מחר
                await db["receipts"].update_one(
                    {"_id": r["_id"]},
                    {"$set": {"notification_sent": True}}
                )

        except Exception as e:
            print(f"General error in notification task: {e}")

        # מחכה 24 שעות לסבב הבא
        await asyncio.sleep(86400)