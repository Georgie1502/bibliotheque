# Bibliotheque API - Copilot Instructions

## Project Overview

Bibliotheque is a FastAPI backend for an online library management system. It provides REST endpoints for user authentication, book management, and author tracking with JWT-based security.

**Key Tech Stack**: FastAPI, SQLAlchemy (ORM), SQLite, Pydantic, Python-Jose (JWT), bcrypt

## Architecture & Data Flow

### Core Components

- **[app/routes/](../server/app/routes/)**: API endpoints organized by resource (users, books, authors)
- **[app/models.py](../server/app/models.py)**: SQLAlchemy ORM models with relationships
- **[app/schemas.py](../server/app/schemas.py)**: Pydantic schemas for request/response validation
- **[app/security.py](../server/app/security.py)**: Authentication (JWT + bcrypt) and token verification
- **[app/database.py](../server/app/database.py)**: SQLAlchemy session management and DB initialization

### Data Model Relationships

```
User (1) ──→ (M) Book (M) ──→ (M) Author
              ↓
          (owner_id)          (book_author table)
```

Users own books; books reference authors via `book_author_association` table (many-to-many). Books cascade-delete when user is deleted.

## Critical Patterns

### 1. Authentication Flow

All protected endpoints use `Depends(verify_token)` which:

1. Extracts JWT from `Authorization: Bearer TOKEN` header using HTTPBearer
2. Decodes token and extracts email (subject claim)
3. Returns email string for route handler

**Example** ([app/routes/books.py](../server/app/routes/books.py#L15)):

```python
def create_book(
    book: BookCreate,
    email: str = Depends(verify_token),  # Auth decorator
    db: Session = Depends(get_db)        # DB session
):
```

### 2. Database Session Management

- `Depends(get_db)` provides session context that auto-closes
- Always query User by email to get the owner: `db.query(User).filter(User.email == email).first()`
- For book/author access, validate ownership: `Book.owner_id == user.id`

### 3. Response Status Codes

- `201`: Created endpoints (register, create_book, create_author)
- `204`: Delete endpoints (no content)
- `200`: Default for GET/PUT/login
- `400`: Validation/business logic errors (duplicate email, ISBN)
- `401`: Authentication failures (invalid token)
- `404`: Resource not found

### 4. Error Handling

Use `HTTPException` with explicit status code:

```python
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Email already registered"
)
```

### 5. Input Validation Pattern

Pydantic schemas handle basic validation; add business logic checks in route handlers:

- Email uniqueness for users ([users.py](../server/app/routes/users.py#L18))
- ISBN uniqueness for books ([books.py](../server/app/routes/books.py#L28))
- Author name uniqueness ([authors.py](../server/app/routes/authors.py#L20))

### 6. Update Operations

Partial updates check `if field is not None` before applying changes ([books.py](../server/app/routes/books.py#L82-L88)), allowing selective updates.

## Development Workflow

1. **Start server**: `cd server && python main.py` (runs with auto-reload)
2. **Interactive docs**: http://localhost:8000/docs (FastAPI Swagger)
3. **Database reset**: Delete `server/bibliotheque.db` and restart server
4. **Testing**: Run `python test_api.py` after server is running

## Project Conventions

- Routes prefixed with `/api/resources` (e.g., `/api/books/`, `/api/authors/`)
- All schemas in [app/schemas.py](../server/app/schemas.py) grouped by resource with Base/Create/Update/Read variants
- Many-to-many via `author_ids: List[int]` in BookCreate/BookUpdate - agents resolve to Author records
- Timestamp fields (`created_at`, `updated_at`) auto-managed by SQLAlchemy
- Password never returned in responses; schemas use `from_attributes = True` for ORM conversion

## Integration Points

### Adding a New Resource

1. Create SQLAlchemy model in [models.py](../server/app/models.py)
2. Add Pydantic schemas in [schemas.py](../server/app/schemas.py) (Base, Create, Update, Read)
3. Create route file in [routes/](../server/app/routes/) with CRUD operations
4. Include router in [main.py](../server/main.py#L18) with `app.include_router()`
5. Update [DEVELOPMENT.md](../server/DEVELOPMENT.md) with API examples

### Modifying Authentication

- Token expiry: Change `ACCESS_TOKEN_EXPIRE_MINUTES` in [security.py](../server/app/security.py#L9)
- SECRET_KEY (MUST change for production): [security.py](../server/app/security.py#L8)
- HTTPBearer scheme is fixed; don't use other auth methods

## Key Files for Reference

| File                                                     | Purpose                   | Key Pattern                                 |
| -------------------------------------------------------- | ------------------------- | ------------------------------------------- |
| [app/routes/users.py](../server/app/routes/users.py)     | User registration & login | JWT creation, password hashing              |
| [app/routes/books.py](../server/app/routes/books.py)     | Book CRUD                 | User ownership checks, many-to-many authors |
| [app/routes/authors.py](../server/app/routes/authors.py) | Author CRUD               | Global resource (not user-scoped)           |
| [app/models.py](../server/app/models.py)                 | Data model definitions    | ORM relationships, cascade behavior         |
| [app/security.py](../server/app/security.py)             | Auth utilities            | JWT token lifecycle, bcrypt                 |

## Security Notes for Agents

- **Do not hardcode** SECRET_KEY or token expiry in routes; use [security.py](../server/app/security.py) constants
- Books are user-scoped; always validate `book.owner_id == current_user.id` before operations
- Authors are global; no ownership check needed
- Passwords must be hashed before DB storage; use `hash_password()` from security module
- CORS is permissive (`allow_origins=["*"]`); this is development-only

## Common Modification Patterns

**Extending Book model**: Add column in [models.py](../server/app/models.py#L45), schema field in [schemas.py](../server/app/schemas.py#L33-L45), and update route handlers.

**Restricting author access**: Modify [authors.py](../server/app/routes/authors.py) to add `email: str = Depends(verify_token)` and track author.creator_id.

**Adding query filters**: Use SQLAlchemy `.filter()` chains (see [books.py](../server/app/routes/books.py#L57-L60) for example).

**Testing changes**: Run test_api.py workflow manually or write pytest tests based on [test_api.py](../server/test_api.py) pattern.
