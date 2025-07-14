import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    EMBEDDINGS_MODEL: str = os.getenv("EMBEDDINGS_MODEL", "text-embedding-3-small")

    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", 6333))
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", None)
    QDRANT_USE_HTTPS: bool = os.getenv("QDRANT_USE_HTTPS", "false").lower() == "true"
    QDRANT_APP_VECTOR: str = os.getenv("QDRANT_APP_VECTOR", "skimzy_vectors")

    B2_APPLICATION_KEY: str = os.getenv("B2_APPLICATION_KEY")
    B2_APPLICATION_KEY_ID: str = os.getenv("B2_APPLICATION_KEY_ID")
    B2_S3_REGION: str = os.getenv("B2_S3_REGION")
    B2_S3_ENDPOINT: str = os.getenv("B2_S3_ENDPOINT")
    B2_BUCKET_NAME: str = os.getenv("B2_BUCKET_NAME")
    B2_USERS_FOLDER: str = os.getenv("B2_USERS_FOLDER")

settings = Settings()
