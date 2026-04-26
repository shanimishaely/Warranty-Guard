import fitz  # PyMuPDF
import io
import pytesseract
from PIL import Image
import os
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta

pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

class AIService:
    @staticmethod
    async def process_receipt_image(file_path: str) -> str:
        """הופך תמונה או PDF לטקסט חי"""
        try:
            ext = os.path.splitext(file_path)[1].lower()
            text = ""
            if ext == '.pdf':
                doc = fitz.open(file_path)
                for page in doc:
                    # שימוש במטריצה 2x2 כדי להעלות רזולוציה ל-OCR טוב יותר
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
    def extract_data(text: str, manual_warranty_months: int = 12):
        """מחלץ נתונים מהטקסט ומחשב אחריות"""
        lines = [line.strip() for line in text.split('\n') if len(line.strip()) > 2]

        # 1. שם חנות (שורה ראשונה בדרך כלל)
        store_name = lines[0] if lines else "Unknown Store"

        # 2. חילוץ סכום (המספר הגבוה ביותר בפורמט מטבע)
        all_amounts = re.findall(r'\b\d{1,5}(?:\.\d{2})\b', text)
        try:
            total = max([float(a) for a in all_amounts]) if all_amounts else 0.0
        except ValueError:
            total = 0.0

        # 3. חילוץ תאריך קנייה
        dates = re.findall(r'\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b', text)
        purchase_date = datetime.now()
        if dates:
            try:
                date_str = dates[0].replace('.', '/').replace('-', '/')
                purchase_date = datetime.strptime(date_str, '%d/%m/%Y' if len(date_str) > 8 else '%d/%m/%y')
            except:
                pass

        # 4. חישוב תאריך תפוגה (לפי ההזנה הידנית שלך)
        expiration_date = purchase_date + relativedelta(months=manual_warranty_months)

        return {
            "store_name": store_name,
            "total_amount": total,
            "purchase_date": purchase_date.strftime("%Y-%m-%d"),
            "warranty_expiration": expiration_date.strftime("%Y-%m-%d"),
            "warranty_months": manual_warranty_months
        }