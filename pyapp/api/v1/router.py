from fastapi import APIRouter

# Import all route modules
from pyapp.api.v1.routes import auth
from pyapp.api.v1.routes import library_items as lib
from pyapp.api.v1.routes import pdf_upload
from pyapp.api.v1.routes import main

# Create the main v1 router
v1_router = APIRouter(prefix="/v1")

# Include all route modules
v1_router.include_router(auth.router, prefix="/auth", tags=["v1-auth"])
v1_router.include_router(lib.router, tags=["v1-library"])
v1_router.include_router(pdf_upload.router, tags=["v1-pdf"])
v1_router.include_router(main.router, tags=["v1-main"])