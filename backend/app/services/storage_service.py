import httpx
from app.core.config import settings


async def upload_screenshot(image_bytes: bytes, filename: str) -> str | None:
    """Upload a screenshot to Supabase Storage and return the public URL."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None

    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{filename}"

    # Determine content type from extension
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "png"
    content_types = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
    content_type = content_types.get(ext, "image/png")

    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, content=image_bytes, headers=headers, timeout=30.0)

    if response.status_code in (200, 201):
        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}"

    return None
