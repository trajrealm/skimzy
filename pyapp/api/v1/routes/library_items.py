from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pyapp.utils.auth import get_current_user
from pyapp.db.session import get_db
from pyapp.models.library_item import LibraryItem
from pyapp.models.user import User  # for typing

router = APIRouter()

@router.get("/library")
def get_library_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = (
        db.query(LibraryItem)
        .filter(LibraryItem.user_id == current_user.id)
        .order_by(LibraryItem.created_at.desc())
        .all()
    )

    response = [
        {
            "id": item.id,
            "title": item.title or "Untitled",
            "source": item.url_or_path,
            "created_at": item.created_at.isoformat(),
        }
        for item in items
    ]

    return response

@router.get("/library/{item_id}")
def get_library_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = (
        db.query(LibraryItem)
        .filter(LibraryItem.id == item_id, LibraryItem.user_id == current_user.id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "id": item.id,
        "title": item.title,
        "source": item.url_or_path,
        "created_at": item.created_at.isoformat(),
        "summary": item.summary,
        "flashcards": item.flashcards,
        "mcqs": item.mcqs,
    }


@router.delete("/library/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_library_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(LibraryItem).filter(
        LibraryItem.id == item_id,
        LibraryItem.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return None  # 204 No Content means successful delete, no response body
