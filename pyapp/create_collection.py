from qdrant_client.models import VectorParams, Distance
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.config.settings import settings

client = get_qdrant_client()

client.recreate_collection(
    collection_name=settings.QDRANT_APP_VECTOR,
    vectors_config=VectorParams(
        size=1536,  # embedding size from OpenAI
        distance=Distance.COSINE,
    )
)
