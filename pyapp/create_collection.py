from qdrant_client.models import VectorParams, Distance
from pyapp.services.qdrant_client import get_qdrant_client
from qdrant_client.http.models import PayloadSchemaType
from pyapp.config.settings import settings

client = get_qdrant_client()

collection_name = settings.QDRANT_APP_VECTOR

client.recreate_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(
        size=1536,  # embedding size from OpenAI
        distance=Distance.COSINE,
    )
)


client.create_payload_index(
    collection_name=collection_name,
    field_name="user_id",
    field_schema=PayloadSchemaType.INTEGER
)

client.create_payload_index(
    collection_name=collection_name,
    field_name="library_item_id",
    field_schema=PayloadSchemaType.INTEGER
)