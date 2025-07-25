"""
Question answering service using RAG (Retrieval Augmented Generation).
"""
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

from pyapp.models.chat_history import ChatHistory
from pyapp.utils.embedding import get_openai_embeddings
from pyapp.utils.llm_answering import ask_llm
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.config.settings import settings


class QuestionAnsweringService:
    """Service for handling RAG-based question answering."""
    
    async def answer_question(
        self,
        question: str,
        library_item_id: int,
        user_id: int,
        db: Session
    ) -> str:
        """
        Answer a question using relevant content from a library item.
        
        Args:
            question: The user's question
            library_item_id: ID of the library item to search in
            user_id: ID of the user asking the question
            db: Database session
            
        Returns:
            The AI-generated answer
            
        Raises:
            HTTPException: If question answering fails
        """
        try:
            # Generate embedding for the question
            query_embedding = (await get_openai_embeddings([question]))[0]
            
            # Search for relevant chunks
            relevant_chunks = await self._search_relevant_chunks(
                query_embedding, user_id, library_item_id
            )
            
            if not relevant_chunks:
                return "No relevant content found"
            
            # Generate answer using LLM
            answer = ask_llm(question=question, context_chunks=relevant_chunks)
            
            # Store chat history
            self._store_chat_history(
                user_id=user_id,
                library_item_id=library_item_id,
                question=question,
                answer=answer,
                db=db
            )
            
            return answer
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _search_relevant_chunks(
        self,
        query_embedding: List[float],
        user_id: int,
        library_item_id: int
    ) -> List[str]:
        """
        Search for relevant text chunks using vector similarity.
        
        Args:
            query_embedding: The question embedding
            user_id: ID of the user
            library_item_id: ID of the library item
            
        Returns:
            List of relevant text chunks
        """
        client = get_qdrant_client()
        
        qdrant_filter = Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=int(user_id))),
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

        return [
            pt.payload["text_chunk"] 
            for pt in search_results 
            if "text_chunk" in pt.payload
        ]
    
    def _store_chat_history(
        self,
        user_id: int,
        library_item_id: int,
        question: str,
        answer: str,
        db: Session
    ) -> None:
        """
        Store chat interaction in database.
        
        Args:
            user_id: ID of the user
            library_item_id: ID of the library item
            question: The user's question
            answer: The AI-generated answer
            db: Database session
        """
        chat_record = ChatHistory(
            user_id=user_id,
            library_item_id=library_item_id,
            question=question,
            answer=answer
        )
        
        db.add(chat_record)
        db.commit()