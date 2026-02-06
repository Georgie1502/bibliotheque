from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ==================== Author Schemas ====================
class AuthorBase(BaseModel):
    name: str
    biography: Optional[str] = None


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(BaseModel):
    name: Optional[str] = None
    biography: Optional[str] = None


class AuthorRead(AuthorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Book Schemas ====================
class BookBase(BaseModel):
    title: str
    description: Optional[str] = None
    isbn: Optional[str] = None
    published_year: Optional[int] = None


class BookCreate(BookBase):
    author_ids: Optional[List[int]] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    published_year: Optional[int] = None
    author_ids: Optional[List[int]] = None


class BookRead(BookBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    authors: List[AuthorRead] = []

    class Config:
        from_attributes = True


# ==================== User Schemas ====================
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    books: List[BookRead] = []

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
