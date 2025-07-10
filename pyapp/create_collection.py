from qdrant_client.models import VectorParams, Distance
from pyapp.services.qdrant_client import get_qdrant_client

client = get_qdrant_client()

client.recreate_collection(
    collection_name="skimzy_vectors",
    vectors_config=VectorParams(
        size=1536,  # embedding size from OpenAI
        distance=Distance.COSINE,
    )
)
