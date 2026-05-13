from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/cybersafe_gh"
    CORS_ORIGINS: str = "http://localhost:3000"

    # OCR settings
    TESSERACT_CMD: str = ""
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_IMAGE_TYPES: str = "image/png,image/jpeg,image/webp"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_STORAGE_BUCKET: str = "screenshots"

    class Config:
        env_file = ".env"


settings = Settings()
