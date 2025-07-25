"""
Library management service for handling content generation and storage.
"""
import json
import uuid
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from pyapp.models.library_item import LibraryItem
from pyapp.utils.parser import extract_main_content
from pyapp.utils.text_chunker import chunk_text
from pyapp.utils.embedding import get_openai_embeddings
from pyapp.services.content_generator import generate_summary_and_flashcards
from pyapp.services.qdrant_client import get_qdrant_client
from pyapp.config.settings import settings
from pyapp.utils.logging import get_logger

logger = get_logger(__name__)


class LibraryManagementService:
    """Service for managing library items and content processing."""
    
    async def create_library_item_from_url(
        self, 
        url: str, 
        user_id: int, 
        db: Session
    ) -> Dict[str, Any]:
        """
        Create a new library item from URL with AI-generated content.
        
        Args:
            url: The URL to process
            user_id: ID of the user creating the item
            db: Database session
            
        Returns:
            Dictionary with created item details
            
        Raises:
            HTTPException: If processing fails
        """
        logger.info(f"Creating library item from URL for user {user_id}: {url}")
        
        try:
            # Extract content from URL
            text = extract_main_content(url)
            if not text:
                logger.warning(f"No content extracted from URL: {url}")
                raise HTTPException(status_code=400, detail="Could not extract content from URL")
            
            logger.info(f"Extracted {len(text)} characters from URL")
            
            # Generate chunks for embedding
            chunks = chunk_text(text, chunk_size=500)
            logger.info(f"Generated {len(chunks)} text chunks")
            
            # Generate summary and flashcards
            logger.info("Generating AI content...")
            result = generate_summary_and_flashcards(text)
            
            # Parse the AI-generated content
            try:
                result_dict = json.loads(result["output"])
            except (KeyError, json.JSONDecodeError) as e:
                logger.error(f"Failed to parse AI generation result: {e}")
                raise HTTPException(status_code=500, detail="Invalid generation output format")

            if "summary" not in result_dict:
                logger.error("AI generation missing summary")
                raise HTTPException(status_code=500, detail="Content generation failed")

            # Create library item
            now = datetime.utcnow()
            new_item = LibraryItem(
                user_id=user_id,
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
            
            logger.info(f"Created library item with ID: {new_item.id}")

            # Generate and store embeddings
            await self._store_embeddings(chunks, user_id, new_item.id)

            result_data = {
                "id": new_item.id,
                "title": new_item.title,
                "source": new_item.url_or_path,
                "created_at": new_item.created_at.isoformat(),
                "has_summary": bool(new_item.summary),
                "has_flashcards": bool(new_item.flashcards),
                "has_mcqs": bool(new_item.mcqs),
            }
            
            logger.info(f"Successfully created library item for user {user_id}")
            return result_data

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating library item: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _store_embeddings(
        self, 
        chunks: list, 
        user_id: int, 
        library_item_id: int
    ) -> None:
        """
        Generate embeddings for text chunks and store in vector database.
        
        Args:
            chunks: List of text chunks
            user_id: ID of the user
            library_item_id: ID of the library item
        """
        logger.info(f"Generating embeddings for {len(chunks)} chunks")
        embeddings = await get_openai_embeddings(chunks)
        client = get_qdrant_client()

        points = [
            {
                "id": str(uuid.uuid4()),
                "vector": emb,
                "payload": {
                    "user_id": int(user_id),
                    "library_item_id": int(library_item_id),
                    "text_chunk": chunk,
                },
            }
            for chunk, emb in zip(chunks, embeddings)
        ]

        client.upsert(collection_name=settings.QDRANT_APP_VECTOR, points=points)
        logger.info(f"Stored {len(points)} embeddings in vector database")