"""
Chat-related API routes.
"""
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from pyapp.db.session import get_db
from pyapp.utils.auth import get_current_user
from pyapp.services.question_answering import QuestionAnsweringService
from pyapp.services.chat_history import ChatHistoryService

router = APIRouter()

# Service instances (could be dependency injected later)
question_answering_service = QuestionAnsweringService()
chat_history_service = ChatHistoryService()


@router.post("/ask-question")
async def ask_question(
    request: Request,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)    
):
    """Ask a question about a library item using RAG."""
    body = await request.json()
    question = body.get("question")
    library_item_id = body.get("library_item_id")

    if not question or not library_item_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Missing question or library_item_id")

    answer = await question_answering_service.answer_question(
        question=question,
        library_item_id=library_item_id,
        user_id=user.id,
        db=db
    )

    return {"answer": answer}


@router.get("/chat-history/{library_item_id}")
def get_chat_history(
    library_item_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get chat history for a library item."""
    return chat_history_service.get_chat_history(
        library_item_id=library_item_id,
        user_id=user.id,
        db=db
    )