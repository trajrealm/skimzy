from fastapi import APIRouter, Request, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
import traceback
import uuid
import json

from pyapp.db.session import get_db
from pyapp.utils.auth import get_current_user
from pyapp.utils.parser import extract_main_content
from pyapp.utils.embedding import get_openai_embeddings
from pyapp.utils.llm_answering import ask_llm
from pyapp.utils.text_chunker import chunk_text
from pyapp.services.content_generator import generate_summary_and_flashcards
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.models.library_item import LibraryItem
from pyapp.models.chat_history import ChatHistory
from pyapp.config.settings import settings
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

# Legacy router for backwards compatibility
legacy_router = APIRouter()

@legacy_router.get("/extract")
def extract(url: str = Query(...)):
    content = extract_main_content(url)
    return {"length": len(content), "snippet": content}

@legacy_router.post("/generate")
async def generate(request: Request):
    body = await request.json()
    text = body.get("text", "")
    return generate_summary_and_flashcards(text)

@legacy_router.post("/generate-from-url")
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

        text = extract_main_content(url)
        chunks = chunk_text(text, chunk_size=500)
        result = generate_summary_and_flashcards(text)

        try:
            result_dict = json.loads(result["output"])
        except (KeyError, json.JSONDecodeError):
            raise HTTPException(status_code=500, detail="Invalid generation output format")

        if "summary" not in result_dict:
            raise HTTPException(status_code=500, detail="Content generation failed")

        now = datetime.utcnow()
        new_item = LibraryItem(
            user_id=user.id,
            url_or_path=url,
            content_type="url",
            title=result_dict.get("title", "Untitled"),
            summary=result_dict.get("summary"),
            flashcards=result_dict.get("flashcards", []),
            mcqs=result_dict.get("mcqs", []),
            created_at=now,
            updated_at=now
        )

        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        embeddings = await get_openai_embeddings(chunks)
        client = get_qdrant_client()

        points = [
            {
                "id": str(uuid.uuid4()),
                "vector": emb,
                "payload": {
                    "user_id": int(user.id),
                    "library_item_id": int(new_item.id),
                    "text_chunk": chunk,
                },
            }
            for chunk, emb in zip(chunks, embeddings)
        ]

        client.upsert(collection_name=settings.QDRANT_APP_VECTOR, points=points)

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


@legacy_router.post("/ask-question")
async def ask_question(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)    
):
    try:
        body = await request.json()
        question = body.get("question")
        library_item_id = body.get("library_item_id")

        if not question or not library_item_id:
            raise HTTPException(status_code=400, detail="Missing question or library_item_id")

        query_embedding = (await get_openai_embeddings([question]))[0]
        client = get_qdrant_client()

        qdrant_filter = Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=int(user.id))),
                FieldCondition(key="library_item_id", match=MatchValue(value=int(library_item_id)))
            ]
        )

        search_results = client.search(
            collection_name=settings.QDRANT_APP_VECTOR,
            query_vector=query_embedding,
            limit=5,
            query_filter=qdrant_filter,
            with_payload=True,
            with_vectors=True
        )

        relevant_chunks = [pt.payload["text_chunk"] for pt in search_results if "text_chunk" in pt.payload]

        if not relevant_chunks:
            return {"answer": "No relevant content found"}

        answer = ask_llm(question=question, context_chunks=relevant_chunks)

        chat_record = ChatHistory(
            user_id=user.id,
            library_item_id=library_item_id,
            question=question,
            answer=answer
        )

        db.add(chat_record)
        db.commit()

        return {"answer": answer}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@legacy_router.get("/chat-history/{library_item_id}")
def get_chat_history(
    library_item_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    history = (
        db.query(ChatHistory)
        .filter_by(user_id=user.id, library_item_id=library_item_id)
        .order_by(ChatHistory.created_at.asc())
        .all()
    )
    return [
        {
            "id": chat.id,
            "question": chat.question,
            "answer": chat.answer,
            "timestamp": chat.created_at.isoformat()
        }
        for chat in history
    ]