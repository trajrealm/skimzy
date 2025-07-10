import os
from qdrant_client import QdrantClient

def get_qdrant_client():
    host = os.getenv("QDRANT_HOST", "localhost")
    port = int(os.getenv("QDRANT_PORT", 6333))
    api_key = os.getenv("QDRANT_API_KEY", None)
    use_https = os.getenv("QDRANT_USE_HTTPS", "false").lower() == "true"

    if api_key:
        return QdrantClient(
            host=host,
            port=port,
            api_key=api_key,
            https=use_https,
        )
    else:
        return QdrantClient(host=host, port=port)
