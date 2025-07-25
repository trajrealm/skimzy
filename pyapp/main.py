from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Import versioned API routers
from pyapp.api.v1.router import v1_router

# Import legacy routes for backward compatibility
from pyapp.api.routes import auth
from pyapp.api.routes import library_items as lib
from pyapp.api.routes import pdf_upload
from pyapp.api.legacy import legacy_router

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "webapp", "dist")

# --- Initialize App ---
app = FastAPI()

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ restrict this in prod
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Versioned API Routers ---
app.include_router(v1_router, prefix="/api")

# --- Include Legacy Routers for Backward Compatibility ---
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(lib.router, prefix="/api", tags=["library"])
app.include_router(pdf_upload.router, prefix="/api", tags=["pdf"])
app.include_router(legacy_router, prefix="/api", tags=["legacy"])

# Both versioned and legacy endpoints are now available

# # --- Static frontend (React/Vite) ---
# Serve /assets folder inside dist/assets at /assets URL
app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

# Serve vite.svg at root
@app.get("/vite.svg")
async def serve_vite_svg():
    return FileResponse(os.path.join(DIST_DIR, "vite.svg"))

# Serve index.html for SPA routes
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(DIST_DIR, "index.html"))

@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    return FileResponse(os.path.join(DIST_DIR, "index.html"))