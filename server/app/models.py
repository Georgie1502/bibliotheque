from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Association table for many-to-many relationship between books and authors
book_author_association = Table(
    'book_author',
    Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id', ondelete='CASCADE')),
    Column('author_id', Integer, ForeignKey('authors.id', ondelete='CASCADE'))
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    books = relationship("Book", back_populates="owner", cascade="all, delete-orphan")


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    biography = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    books = relationship(
        "Book",
        secondary=book_author_association,
        back_populates="authors"
    )


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    isbn = Column(String(20), unique=True, index=True, nullable=True)
    published_year = Column(Integer, nullable=True)
    owner_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="books")
    authors = relationship(
        "Author",
        secondary=book_author_association,
        back_populates="books"
    )
