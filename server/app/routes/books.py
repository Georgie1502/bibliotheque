from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Book, Author, User
from app.schemas import BookCreate, BookRead, BookUpdate
from app.security import verify_token
from app.exceptions import (
    DuplicateResourceError,
    ResourceNotFoundError,
    PermissionError as AppPermissionError
)
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/books", tags=["books"])


@router.post("/", response_model=BookRead, status_code=status.HTTP_201_CREATED)
def create_book(
    book: BookCreate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a new book"""
    # Get current user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ResourceNotFoundError("User", email)
    
    # Validate ISBN uniqueness if provided
    if book.isbn:
        existing_book = db.query(Book).filter(Book.isbn == book.isbn).first()
        if existing_book:
            logger.warning(f"Attempt to create book with existing ISBN: {book.isbn}")
            raise DuplicateResourceError(
                message="Book with this ISBN already exists",
                details={"isbn": book.isbn}
            )
    
    # Create book
    db_book = Book(
        title=book.title,
        description=book.description,
        isbn=book.isbn,
        published_year=book.published_year,
        owner_id=user.id
    )
    
    # Add authors if provided
    if book.author_ids:
        authors = db.query(Author).filter(Author.id.in_(book.author_ids)).all()
        db_book.authors = authors
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    logger.info(f"Book created: {db_book.id} by user {email}")
    return db_book


@router.get("/", response_model=List[BookRead])
def list_books(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """List all books for the current user"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ResourceNotFoundError("User", email)
    
    books = db.query(Book).filter(
        Book.owner_id == user.id
    ).offset(skip).limit(limit).all()
    return books


@router.get("/{book_id}", response_model=BookRead)
def get_book(
    book_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get a specific book"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ResourceNotFoundError("User", email)
    
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.owner_id == user.id
    ).first()
    
    if not book:
        raise ResourceNotFoundError("Book", book_id)
    return book


@router.put("/{book_id}", response_model=BookRead)
def update_book(
    book_id: int,
    book_update: BookUpdate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Update a book"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ResourceNotFoundError("User", email)
    
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.owner_id == user.id
    ).first()
    
    if not book:
        raise ResourceNotFoundError("Book", book_id)
    
    # Update fields if provided
    if book_update.title is not None:
        book.title = book_update.title
    if book_update.description is not None:
        book.description = book_update.description
    if book_update.isbn is not None:
        # Validate ISBN uniqueness
        existing = db.query(Book).filter(
            Book.isbn == book_update.isbn,
            Book.id != book_id
        ).first()
        if existing:
            logger.warning(f"Attempt to update book with existing ISBN: {book_update.isbn}")
            raise DuplicateResourceError(
                message="Book with this ISBN already exists",
                details={"isbn": book_update.isbn}
            )
        book.isbn = book_update.isbn
    if book_update.published_year is not None:
        book.published_year = book_update.published_year
    
    # Update authors if provided
    if book_update.author_ids is not None:
        authors = db.query(Author).filter(Author.id.in_(book_update.author_ids)).all()
        book.authors = authors
    
    db.commit()
    db.refresh(book)
    logger.info(f"Book updated: {book_id} by user {email}")
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Delete a book"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ResourceNotFoundError("User", email)
    
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.owner_id == user.id
    ).first()
    
    if not book:
        raise ResourceNotFoundError("Book", book_id)
    
    db.delete(book)
    db.commit()
    logger.info(f"Book deleted: {book_id} by user {email}")
