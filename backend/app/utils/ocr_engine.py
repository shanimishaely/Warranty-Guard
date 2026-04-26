import pytesseract
from PIL import Image
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def extract_text_from_image(image_path: str) -> str:
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang='heb+eng')
        return text.strip()
    except Exception as e:
        return f"שגיאה: {str(e)}"


if __name__ == "__main__":
    my_image_path = r'C:\Users\user1\Desktop\shaniProject\test_receipt.png'

    print("מפענח את התמונה, נא להמתין...")
    result = extract_text_from_image(my_image_path)
    print("--- הטקסט שנמצא ---")
    print(result)
    print("--------------------")