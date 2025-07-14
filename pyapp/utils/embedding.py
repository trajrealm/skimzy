import os
from openai import OpenAI
from typing import List
from pyapp.config.settings import settings

client = OpenAI()

async def get_openai_embeddings(texts: List[str], model: str = settings.EMBEDDINGS_MODEL) -> List[List[float]]:
    embeddings = []
    for text in texts:
        response = client.embeddings.create(input=text, model=model)
        embeddings.append(response.data[0].embedding)
    return embeddings
