"""
Content-related API routes.
"""
from fastapi import APIRouter, Request, Depends, Query
from sqlalchemy.orm import Session

from pyapp.db.session import get_db
from pyapp.utils.auth import get_current_user
from pyapp.services.content_extraction import ContentExtractionService
from pyapp.services.content_generator import generate_summary_and_flashcards
from pyapp.services.library_management import LibraryManagementService

router = APIRouter()

# Service instances (could be dependency injected later)
content_extraction_service = ContentExtractionService()
library_management_service = LibraryManagementService()


@router.get("/extract")
def extract_content(url: str = Query(...)):
    """Extract main content from a URL."""
    return content_extraction_service.extract_url_content(url)


@router.post("/generate")
async def generate_content(request: Request):
    """Generate summary and flashcards from text."""
    body = await request.json()
    text = body.get("text", "")
    return generate_summary_and_flashcards(text)


@router.post("/generate-from-url")
async def generate_from_url(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Generate content from URL and create library item."""
    body = await request.json()
    url = body.get("url")
    
    if not url:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="URL is required")
    
    return await library_management_service.create_library_item_from_url(
        url=url,
        user_id=user.id,
        db=db
    )