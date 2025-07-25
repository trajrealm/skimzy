"""
Main entry point for the Skimzy application.
"""
from pyapp.app_factory import create_app

# Create the FastAPI application using the factory pattern
app = create_app()