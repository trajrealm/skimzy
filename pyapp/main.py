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
    allow_credentials=False,
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



import uuid
from fastapi import HTTPException
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.utils.text_chunker import chunk_text
from pyapp.utils.embedding import get_openai_embeddings

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

        # Step 1.5: Chunk the text (e.g., ~500 tokens per chunk)
        chunks = chunk_text(text, chunk_size=500)

        # Step 2: Generate summary + flashcards + mcqs
        result = generate_summary_and_flashcards(text)

        try:
            result_dict = json.loads(result["output"])
        except (KeyError, json.JSONDecodeError) as e:
            print("Failed to parse result['output']:", e)
            raise HTTPException(status_code=500, detail="Invalid response format from generation")

        if "summary" not in result_dict:
            raise HTTPException(status_code=500, detail="Content generation failed")

        # Step 3: Create DB record for the library item
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

        # Step 4: Generate embeddings for each chunk
        embeddings = await get_openai_embeddings(chunks)  # assumes async; adapt if sync

        # Step 5: Store embeddings in Qdrant with metadata
        client = get_qdrant_client()
        points = []
        for chunk, embedding in zip(chunks, embeddings):
            points.append({
                "id": str(uuid.uuid4()),
                "vector": embedding,
                "payload": {
                    "user_id": str(user.id),
                    "library_item_id": str(new_item.id),
                    "text_chunk": chunk,
                }
            })

        client.upsert(collection_name="skimzy_vectors", points=points)

        # Return the created library item info
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


from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.utils.embedding import get_openai_embeddings
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from pyapp.utils.llm_answering import ask_llm
from pyapp.models.chat_history import ChatHistory



@app.post("/ask-question")
async def ask_question(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    body = await request.json()
    question = body.get("question")
    library_item_id = body.get("library_item_id")

    if not question or not library_item_id:
        raise HTTPException(status_code=400, detail="Missing question or library_item_id")

    # Step 1: Get question embedding
    query_embedding = (await get_openai_embeddings([question]))[0]

    # Step 2: Query Qdrant for matching chunks
    client = get_qdrant_client()
    qdrant_filter = Filter(
        must=[
            FieldCondition(key="user_id", match=MatchValue(value=str(user.id))),
            FieldCondition(key="library_item_id", match=MatchValue(value=str(library_item_id)))
        ]
    )

    search_results = client.search(
        collection_name="skimzy_vectors",
        query_vector=query_embedding,
        limit=5,
        query_filter=qdrant_filter,
        with_payload=True
    )

    # Step 3: Extract relevant chunks
    relevant_chunks = [pt.payload["text_chunk"] for pt in search_results if "text_chunk" in pt.payload]

    if not relevant_chunks:
        raise HTTPException(status_code=404, detail="No relevant content found")

    # Step 4: Ask GPT model to answer based on retrieved chunks
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

@app.get("/chat-history/{library_item_id}")
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
