import os
from qdrant_client import QdrantClient
from pyapp.config.settings import settings

def get_qdrant_client():
    host = settings.QDRANT_HOST
    port = settings.QDRANT_PORT
    api_key = settings.QDRANT_API_KEY
    use_https = settings.QDRANT_USE_HTTPS
    
    if api_key:
        return QdrantClient(
            host=host,
            port=port,
            api_key=api_key,
            https=use_https,
        )
    else:
        return QdrantClient(host=host, port=port)
