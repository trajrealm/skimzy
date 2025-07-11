import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    B2_APPLICATION_KEY: str = os.getenv("B2_APPLICATION_KEY")
    B2_APPLICATION_KEY_ID: str = os.getenv("B2_APPLICATION_KEY_ID")
    B2_S3_REGION: str = os.getenv("B2_S3_REGION")
    B2_S3_ENDPOINT: str = os.getenv("B2_S3_ENDPOINT")
    B2_BUCKET_NAME: str = os.getenv("B2_BUCKET_NAME")
    B2_USERS_FOLDER: str = os.getenv("B2_USERS_FOLDER")

settings = Settings()
