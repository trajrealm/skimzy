"""
Application factory for creating and configuring the FastAPI app.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from pyapp.api.routes import auth, library_items, pdf_upload, content, chat
from pyapp.utils.logging import setup_logging, get_logger
from pyapp.utils.error_handling import setup_exception_handlers

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "webapp", "dist")

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    # Setup logging first
    setup_logging()
    logger.info("Initializing Skimzy application...")
    
    # Initialize FastAPI app
    app = FastAPI(
        title="Skimzy API",
        description="AI-powered content summarization and Q&A platform",
        version="1.0.0"
    )
    
    # Setup global error handling
    setup_exception_handlers(app)
    
    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # ⚠️ restrict this in prod
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Register API routes
    _register_api_routes(app)
    
    # Setup static file serving
    _setup_static_files(app)
    
    logger.info("Skimzy application initialized successfully")
    return app


def _register_api_routes(app: FastAPI) -> None:
    """Register all API routes with the application."""
    logger.info("Registering API routes...")
    
    # External routes with prefixes
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(library_items.router, prefix="/api", tags=["library"])
    app.include_router(pdf_upload.router, prefix="/api", tags=["pdf"])
    
    # New structured routes
    app.include_router(content.router, prefix="/api", tags=["content"])
    app.include_router(chat.router, prefix="/api", tags=["chat"])
    
    logger.info("API routes registered successfully")


def _setup_static_files(app: FastAPI) -> None:
    """Setup static file serving for the frontend."""
    logger.info("Setting up static file serving...")
    
    # Serve /assets folder inside dist/assets at /assets URL
    assets_path = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
        logger.info(f"Mounted assets directory: {assets_path}")
    else:
        logger.warning(f"Assets directory not found: {assets_path}")

    # Serve vite.svg at root
    @app.get("/vite.svg")
    async def serve_vite_svg():
        vite_svg_path = os.path.join(DIST_DIR, "vite.svg")
        if os.path.exists(vite_svg_path):
            return FileResponse(vite_svg_path)
        return {"error": "File not found"}

    # Serve index.html for SPA routes
    @app.get("/")
    async def serve_index():
        index_path = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend not built"}

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        index_path = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend not built"}
        
    logger.info("Static file serving configured")