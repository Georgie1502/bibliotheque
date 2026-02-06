# Bibliotheque API

A clean, secure FastAPI application for managing books, authors, and users with JWT authentication.

## Features

- ✅ User registration and authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Email validation
- ✅ SQLite database with SQLAlchemy ORM
- ✅ Full CRUD operations for books
- ✅ Author management
- ✅ User-specific book collections
- ✅ CORS support

## Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── database.py         # SQLAlchemy configuration
│   ├── models.py           # Database models (User, Book, Author)
│   ├── schemas.py          # Pydantic schemas for validation
│   ├── security.py         # JWT & password hashing utilities
│   └── routes/
│       ├── __init__.py
│       ├── users.py        # User registration & authentication
│       ├── books.py        # Book CRUD operations
│       └── authors.py      # Author management
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

## API Endpoints

### Users

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/me` - Get current user profile (requires auth)
- `GET /api/users/{user_id}` - Get user by ID

### Books

- `POST /api/books/` - Create a new book (requires auth)
- `GET /api/books/` - List user's books (requires auth)
- `GET /api/books/{book_id}` - Get a specific book (requires auth)
- `PUT /api/books/{book_id}` - Update a book (requires auth)
- `DELETE /api/books/{book_id}` - Delete a book (requires auth)

### Authors

- `POST /api/authors/` - Create a new author (requires auth)
- `GET /api/authors/` - List all authors (requires auth)
- `GET /api/authors/{author_id}` - Get a specific author (requires auth)
- `PUT /api/authors/{author_id}` - Update an author (requires auth)
- `DELETE /api/authors/{author_id}` - Delete an author (requires auth)

## Example Usage

### Register a new user

```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secure_password"}'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secure_password"}'
```

### Create an author

```bash
curl -X POST "http://localhost:8000/api/authors/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "author name", "biography": "author biography"}'
```

### Create a book

```bash
curl -X POST "http://localhost:8000/api/books/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Book Title",
    "description": "Book description",
    "isbn": "978-0-123456-78-9",
    "published_year": 2024,
    "author_ids": [1]
  }'
```

### Get user's books

```bash
curl -X GET "http://localhost:8000/api/books/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

⚠️ **Important for production:**

- Change the `SECRET_KEY` in `app/security.py` to a strong, random value
- Use environment variables for sensitive configuration
- Set `allow_origins` in CORS middleware to specific domains instead of "\*"
- Use HTTPS in production
- Store sensitive data in environment variables, not in code

## Database

The application uses SQLite with SQLAlchemy ORM. The database file (`bibliotheque.db`) will be created automatically in the server directory on first run.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in and receives an access token
2. Include the token in the `Authorization: Bearer TOKEN` header for protected endpoints
3. Tokens expire after 30 minutes (configurable)

## License

See the root LICENSE file for details.
