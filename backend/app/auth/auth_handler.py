import jwt
import time
from typing import Dict, Optional

# סוד מדינה
JWT_SECRET = "secret_shani_2026_top_secret"
JWT_ALGORITHM = "HS256"

def sign_jwt(user_id: str, email: str, phone: Optional[str] = None) -> Dict[str, str]:
    """
    מייצר טוקן JWT חתום.
    הטלפון מוגדר כ-Optional כדי למנוע קריסה אם הוא לא קיים ב-DB.
    """
    try:
        payload = {
            "user_id":str(user_id) ,
            "email": email,
            "phone": phone or "", # אם אין טלפון, נשמור מחרוזת ריקה
            "expires": time.time() + 3600  # תקף לשעה
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"access_token": token}
    except Exception as e:
        # זה ידפיס לך בטרמינל בדיוק למה זה קרס!
        print(f"Error in sign_jwt: {e}")
        raise e
def decode_jwt(token: str) -> Optional[dict]:
    """
    מפענח את הטוקן ובודק תוקף.
    """
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # בדיקה אם הטוקן פג תוקף
        if decoded_token.get("expires", 0) >= time.time():
            return decoded_token
        return None
    except Exception:
        return None