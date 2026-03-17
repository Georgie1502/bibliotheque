from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Author
from app.schemas import AuthorCreate, AuthorRead, AuthorUpdate
from app.security import verify_token
from app.exceptions import DuplicateResourceError, ResourceNotFoundError
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/authors", tags=["authors"])


@router.post("/", response_model=AuthorRead, status_code=status.HTTP_201_CREATED)
def create_author(
    author: AuthorCreate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a new author"""
    # Check if author with same name already exists
    existing_author = db.query(Author).filter(Author.name == author.name).first()
    if existing_author:
        logger.warning(f"Attempt to create author with existing name: {author.name}")
        raise DuplicateResourceError(
            message="Author already exists",
            details={"name": author.name}
        )
    
    db_author = Author(
        name=author.name,
        biography=author.biography
    )
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    logger.info(f"Author created: {db_author.id} - {author.name}")
    return db_author


@router.get("/", response_model=List[AuthorRead])
def list_authors(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """List all authors"""
    authors = db.query(Author).offset(skip).limit(limit).all()
    return authors


@router.get("/{author_id}", response_model=AuthorRead)
def get_author(
    author_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get a specific author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise ResourceNotFoundError("Author", author_id)
    return author


@router.put("/{author_id}", response_model=AuthorRead)
def update_author(
    author_id: int,
    author_update: AuthorUpdate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Update an author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise ResourceNotFoundError("Author", author_id)
    
    if author_update.name is not None:
        author.name = author_update.name
    if author_update.biography is not None:
        author.biography = author_update.biography
    
    db.commit()
    db.refresh(author)
    logger.info(f"Author updated: {author_id}")
    return author


@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author(
    author_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Delete an author"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise ResourceNotFoundError("Author", author_id)
    
    db.delete(author)
    db.commit()
    logger.info(f"Author deleted: {author_id}")
