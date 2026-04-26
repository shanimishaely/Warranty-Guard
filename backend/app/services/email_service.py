import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv() # טוען את הסיסמה מהקובץ הנסתר

class EmailService:
    @staticmethod
    def send_reminder(to_email, item_name, expiration_date):
        msg = EmailMessage()
        # תוכן המייל
        msg.set_content(f"היי! תזכורת מהמערכת: האחריות על '{item_name}' עומדת להסתיים בתאריך {expiration_date}. אל תשכח/י לבדוק שהכל תקין!")
        msg['Subject'] = f"⚠️ תזכורת סיום אחריות: {item_name}"
        msg['From'] = os.getenv("EMAIL_USER")
        msg['To'] = to_email

        try:
            # מתחברים לשרת המייל של גוגל בפורט המאובטח 465
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
                smtp.send_message(msg)
            print(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False