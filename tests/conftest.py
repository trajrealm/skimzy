"""
Test configuration and fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

from pyapp.app_factory import create_app
from pyapp.db.base import Base
from pyapp.db.session import get_db

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """Create test client with overridden dependencies."""
    # Set up test environment
    os.environ.update({
        "OPENAI_API_KEY": "test_key",
        "DATABASE_URL": SQLALCHEMY_DATABASE_URL,
        "QDRANT_API_KEY": "test_key",
        "B2_APPLICATION_KEY": "test_key",
        "B2_APPLICATION_KEY_ID": "test_key",
        "B2_S3_REGION": "us-east-1",
        "B2_S3_ENDPOINT": "test_endpoint",
        "B2_BUCKET_NAME": "test_bucket",
        "B2_USERS_FOLDER": "test_folder"
    })
    
    # Create test database schema - skip for now due to JSONB/SQLite incompatibility
    # We'd need to modify the models to use JSON instead of JSONB for testing
    # Base.metadata.create_all(bind=engine)
    
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    # Base.metadata.drop_all(bind=engine)