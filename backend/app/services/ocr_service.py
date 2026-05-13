import io
import hashlib
from PIL import Image, ImageFilter, ImageEnhance
import pytesseract
from app.core.config import settings


def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocess image for better OCR results."""
    # Convert to grayscale
    img = image.convert("L")
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    # Threshold to binary
    img = img.point(lambda x: 0 if x < 128 else 255, "1")
    return img


def extract_text_from_image(image_bytes: bytes) -> dict:
    """
    Extract text from image bytes using pytesseract.

    Returns dict with extracted_text, confidence, word_count.
    """
    image = Image.open(io.BytesIO(image_bytes))
    processed = preprocess_image(image)

    # Configure tesseract
    if settings.TESSERACT_CMD:
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    # Get detailed data for confidence calculation
    data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)
    confidences = [int(c) for c in data["conf"] if int(c) > 0]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    # Extract text
    text = pytesseract.image_to_string(processed).strip()

    return {
        "extracted_text": text,
        "confidence": round(avg_confidence, 2),
        "word_count": len(text.split()) if text else 0,
    }


def compute_image_hash(image_bytes: bytes) -> str:
    """Compute SHA-256 hash for deduplication."""
    return hashlib.sha256(image_bytes).hexdigest()


def validate_extracted_text(text: str) -> bool:
    """Validate that extracted text is usable for analysis."""
    if not text or not text.strip():
        return False
    # At least 3 characters of actual content
    clean = text.strip()
    return len(clean) >= 3
