from datetime import datetime
from fastapi import Query, FastAPI
from fastapi import Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from pyapp.db.session import get_db
from pyapp.utils.auth import get_current_user
from pyapp.utils.parser import extract_main_content
from pyapp.services.content_generator import generate_summary_and_flashcards
from pyapp.api.routes import auth
from pyapp.api.routes import library_items as lib
from pyapp.models.library_item import LibraryItem

import json
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ You can restrict this later to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(lib.router)

@app.get("/extract")
def extract(url: str = Query(...)):
    content = extract_main_content(url)
    return {"length": len(content), "snippet": content}


@app.post("/generate")
async def generate(request: Request):
    body = await request.json()
    text = body.get("text", "")
    return generate_summary_and_flashcards(text)

from pyapp.utils.parser import extract_main_content

@app.post("/generate-from-url")
async def generate_from_url(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    try:
        body = await request.json()
        url = body.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")

        # Step 1: Extract content
        text = extract_main_content(url)

        # Step 2: Generate summary + flashcards + mcqs
        result = generate_summary_and_flashcards(text)

        try:
            result_json = json.loads(result["output"])
        except (KeyError, json.JSONDecodeError) as e:
            print("Failed to parse result['output']:", e)
            raise HTTPException(status_code=500, detail="Invalid response format from generation")

        # Now parsed is a dict like { "summary": ..., "flashcards": ..., ... }
        if "summary" not in result_json:
            raise HTTPException(status_code=500, detail="Content generation failed")
        # Step 3: Create DB record
        now = datetime.utcnow()
        new_item = LibraryItem(
            user_id=user.id,
            url_or_path=url,
            content_type="url",  # or enum/str depending on your definition
            title=result_json.get("title", "Untitled"),
            summary=result_json.get("summary"),
            flashcards=result_json.get("flashcards", []),
            mcqs=result_json.get("mcqs", []),
            created_at=now,
            updated_at=now
        )

        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        return {
            "id": new_item.id,
            "title": new_item.title,
            "source": new_item.url_or_path,
            "created_at": new_item.created_at.isoformat(),
            "has_summary": bool(new_item.summary),
            "has_flashcards": bool(new_item.flashcards),
            "has_mcqs": bool(new_item.mcqs),
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))