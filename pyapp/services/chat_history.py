"""
Chat history management service.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from pyapp.models.chat_history import ChatHistory


class ChatHistoryService:
    """Service for managing chat history."""
    
    def get_chat_history(
        self,
        library_item_id: int,
        user_id: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Retrieve chat history for a library item.
        
        Args:
            library_item_id: ID of the library item
            user_id: ID of the user
            db: Database session
            
        Returns:
            List of chat history records
        """
        history = (
            db.query(ChatHistory)
            .filter_by(user_id=user_id, library_item_id=library_item_id)
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