import fitz  # PyMuPDF
import io
import pytesseract
from PIL import Image
import os
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta

# ודאי שהנתיב הזה נכון למחשב שלך
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class AIService:
    @staticmethod
    async def process_receipt_image(file_path: str) -> str:
        try:
            ext = os.path.splitext(file_path)[1].lower()
            text = ""
            if ext == '.pdf':
                doc = fitz.open(file_path)
                for page in doc:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_data = Image.open(io.BytesIO(pix.tobytes()))
                    text += pytesseract.image_to_string(img_data, lang='heb+eng') + "\n"
                doc.close()
            else:
                img = Image.open(file_path)
                text = pytesseract.image_to_string(img, lang='heb+eng')
            return text.strip()
        except Exception as e:
            return f"Error: {str(e)}"

    @staticmethod
    def extract_data(text: str):
        # סינון שורות ריקות
        lines = [line.strip() for line in text.split('\n') if len(line.strip()) > 2]

        # 1. אסטרטגיה גלובלית לשם חנות:
        # השורה הראשונה (שלא מכילה מספרים/תאריכים) היא כמעט תמיד שם החנות
        store_name = lines[0] if lines else "Unknown Store"

        # 2. חילוץ סכום (Total) - מחפש מילות מפתח או את המספר הכי גבוה
        total = 0.0
        # מחפש מילים כמו סה"כ או total
        pattern = r'(?:סה"כ|total|לתשלום|amount)\s*[:=-]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            total = float(match.group(1).replace(',', ''))
        else:
            # Fallback: המספר הכי גדול בטווח ריאלי הוא כנראה הטוטאל
            prices = re.findall(r'\b\d{1,4}\.\d{2}\b', text)
            if prices:
                total = max([float(p) for p in prices if 10.0 < float(p) < 10000.0])

        # 3. תאריכים
        dates = re.findall(r'\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b', text)
        purchase_date = datetime.now()
        if dates:
            try:
                date_str = dates[0].replace('.', '/').replace('-', '/')
                purchase_date = datetime.strptime(date_str, '%d/%m/%Y' if len(date_str) > 8 else '%d/%m/%y')
            except: pass

        return {
            "total_amount": total,
            "store_name": store_name,
            "purchase_date": purchase_date.strftime("%Y-%m-%d"),
            # אנחנו כבר לא מחשבים פה warranty_end כי נחשב אותו ב-Route לפי בחירת המשתמש
        }