import os
from dotenv import load_dotenv
from pyapp.config.settings import settings

def get_openai_api_key():
    return settings.OPENAI_API_KEY
