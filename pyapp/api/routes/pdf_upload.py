from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from pyapp.services.b2_s3 import upload_pdf_to_b2
from pyapp.utils.auth import get_current_user
from pyapp.db.session import get_db

router = APIRouter()

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        pdf_url = upload_pdf_to_b2(file_bytes, file.filename, user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    return {"url": pdf_url, "filename": file.filename}


from pyapp.services.b2_s3 import download_file_from_s3
from pyapp.utils.pdf_utils import extract_text_from_pdf
from pyapp.utils.text_chunker import chunk_text
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.utils.text_chunker import chunk_text
from pyapp.utils.embedding import get_openai_embeddings
from pyapp.services.content_generator import generate_summary_and_flashcards
import json
from datetime import datetime
from pyapp.models.library_item import LibraryItem
from uuid import uuid4
import os

@router.post("/upload_pdf/process", status_code=201)
async def upload_and_process_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    try:
        file_bytes = await file.read()
        original_filename = file.filename or "uploaded.pdf"

        # Step 1: Upload to S3
        s3_url = upload_pdf_to_b2(file_bytes, original_filename, user.id)

        # Step 2: Download from S3 to temp file
        temp_path = download_file_from_s3(s3_url)

        # Step 3: Extract text
        text = extract_text_from_pdf(temp_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Empty or unreadable PDF")

        # Step 4: Chunk and embed
        chunks = chunk_text(text, chunk_size=500)
        embeddings = await get_openai_embeddings(chunks)

        # Step 5: Generate summary, flashcards, mcqs
        result = generate_summary_and_flashcards(text)
        result_dict = json.loads(result["output"])
        summary = result_dict.get("summary", "")
        flashcards = result_dict.get("flashcards", [])
        mcqs = result_dict.get("mcqs", [])

        # Step 6: Save library item to DB
        now = datetime.utcnow()
        new_item = LibraryItem(
            user_id=user.id,
            url_or_path=s3_url,
            content_type="pdf",
            title=result_dict.get("title", original_filename),
            created_at=now,
            updated_at=now,
            summary=summary,
            flashcards=flashcards,
            mcqs=mcqs
        )
        db.add(new_item)
        db.flush()

        # Step 7: Store in Qdrant
        client = get_qdrant_client()
        points = []
        for chunk, embedding in zip(chunks, embeddings):
            points.append({
                "id": str(uuid4()),
                "vector": embedding,
                "payload": {
                    "user_id": str(user.id),
                    "library_item_id": str(new_item.id),
                    "text_chunk": chunk
                }
            })

        client.upsert(collection_name="skimzy_vectors", points=points)
        db.commit()

        return {"success": True, "library_item_id": new_item.id}

    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload & Processing failed: {str(e)}")

    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)