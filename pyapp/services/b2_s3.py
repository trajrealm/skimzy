import boto3
from uuid import uuid4
from botocore.client import Config
from pyapp.config.settings import settings
from fastapi import HTTPException
from urllib.parse import urlparse
import tempfile


s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.B2_APPLICATION_KEY_ID,
    aws_secret_access_key=settings.B2_APPLICATION_KEY,
    endpoint_url=f"https://{settings.B2_S3_ENDPOINT}",
    region_name=settings.B2_S3_REGION,
    config=Config(signature_version="s3v4"),
)

def upload_pdf_to_b2(file_bytes: bytes, filename: str, user_id: int) -> str:
    """
    Uploads a PDF file to Backblaze B2 (S3-compatible) and returns the public URL.
    """
    object_key = f"{settings.B2_USERS_FOLDER}/{user_id}/{uuid4()}__{filename}"

    s3_client.put_object(
        Bucket=settings.B2_BUCKET_NAME,
        Key=object_key,
        Body=file_bytes,
        ContentType="application/pdf",
    )

    return f"https://{settings.B2_BUCKET_NAME}.{settings.B2_S3_ENDPOINT}/{object_key}"


def download_file_from_s3(s3_url: str) -> str:
    parsed = urlparse(s3_url)    
    bucket = settings.B2_BUCKET_NAME
    key = parsed.path.lstrip('/')

    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")

    s3_client.download_fileobj(Bucket=bucket, Key=key, Fileobj=temp)
    temp.flush()
    return temp.name
