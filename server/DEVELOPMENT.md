# Development Guide for Bibliotheque API

## Quick Start

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python main.py
```

or the development version with auto-reload:

```bash
uvicorn main:app --reload
```

The server will start on `http://localhost:8000`

- **API Documentation**: http://localhost:8000/docs (interactive Swagger UI)

## Project Structure

```
server/
├── app/
│   ├── __init__.py                # Package init
│   ├── database.py                # SQLAlchemy setup & DB initialization
│   ├── models.py                  # SQLAlchemy models (User, Book, Author)
│   ├── schemas.py                 # Pydantic schemas for validation
│   ├── security.py                # Password hashing & JWT handling
│   └── routes/
│       ├── __init__.py
│       ├── users.py               # User registration, login, profile
│       ├── books.py               # Book CRUD operations
│       └── authors.py             # Author management
├── main.py                        # FastAPI application entry point
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
└── README.md                      # API documentation
```

## Database Models

### User

- `id`: Primary key
- `email`: Unique email address
- `hashed_password`: Bcrypt hashed password
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `books`: Relationship to books (one-to-many)

### Book

- `id`: Primary key
- `title`: Book title
- `description`: Long description
- `isbn`: Unique ISBN (optional)
- `published_year`: Year of publication
- `owner_id`: FK to User
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `authors`: Relationship to authors (many-to-many)

### Author

- `id`: Primary key
- `name`: Author name
- `biography`: Author biography (optional)
- `created_at`: Timestamp
- `books`: Relationship to books (many-to-many)

## API Endpoints

### Authentication

#### Register New User

```bash
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response (201):

```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2024-02-06T10:00:00",
  "updated_at": "2024-02-06T10:00:00",
  "books": []
}
```

#### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response (200):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": { ... }
}
```

#### Get Current User Profile

```bash
GET /api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Get User by ID

```bash
GET /api/users/{user_id}
```

### Authors

#### Create Author

```bash
POST /api/authors/
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Stephen King",
  "biography": "American author of horror and supernatural fiction"
}
```

#### List Authors

```bash
GET /api/authors/?skip=0&limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Get Author

```bash
GET /api/authors/{author_id}
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Update Author

```bash
PUT /api/authors/{author_id}
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Stephen King",
  "biography": "Updated biography"
}
```

#### Delete Author

```bash
DELETE /api/authors/{author_id}
Authorization: Bearer YOUR_TOKEN_HERE
```

### Books

#### Create Book

```bash
POST /api/books/
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "The Shining",
  "description": "A psychological horror novel",
  "isbn": "978-0-385-12167-5",
  "published_year": 1977,
  "author_ids": [1, 2]
}
```

#### List User's Books

```bash
GET /api/books/?skip=0&limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Get Specific Book

```bash
GET /api/books/{book_id}
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Update Book

```bash
PUT /api/books/{book_id}
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "author_ids": [1]
}
```

#### Delete Book

```bash
DELETE /api/books/{book_id}
Authorization: Bearer YOUR_TOKEN_HERE
```

## Testing with cURL

### 1. Register

```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'
```

Save the `access_token` from the response.

### 3. Create Author

```bash
TOKEN="your_token_here"
curl -X POST "http://localhost:8000/api/authors/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "J.K. Rowling", "biography": "British author"}'
```

### 4. Create Book

```bash
TOKEN="your_token_here"
curl -X POST "http://localhost:8000/api/books/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Harry Potter and the Sorcerer'\''s Stone",
    "description": "A young wizard'\''s first year",
    "isbn": "978-0-439-13959-0",
    "published_year": 1998,
    "author_ids": [1]
  }'
```

### 5. List Books

```bash
TOKEN="your_token_here"
curl -X GET "http://localhost:8000/api/books/" \
  -H "Authorization: Bearer $TOKEN"
```

## Security Considerations

### Current Setup (Development Only)

- JWT tokens expire after 30 minutes
- Passwords are hashed with bcrypt
- HTTPBearer authentication scheme

### Production Recommendations

1. **Change SECRET_KEY** in `app/security.py`:

   ```python
   SECRET_KEY = "generate-a-secure-random-string"
   ```

   Use: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`

2. **Use Environment Variables**:

   ```python
   from dotenv import load_dotenv
   import os

   load_dotenv()
   SECRET_KEY = os.getenv("SECRET_KEY")
   ```

3. **Use HTTPS**:
   - Deploy behind a reverse proxy (Nginx, Caddy)
   - Use SSL certificates (Let's Encrypt)

4. **CORS Configuration**:
   - Replace `allow_origins=["*"]` with specific domains
   - Example: `allow_origins=["https://example.com", "https://app.example.com"]`

5. **Database Security**:
   - Use a production database (PostgreSQL, MySQL)
   - Enable database encryption
   - Regular backups

6. **Rate Limiting**:
   - Implement rate limiting on login/register endpoints
   - Use `slowapi` package

7. **Password Policy**:
   - Enforce strong passwords
   - Add minimum length requirement
   - Require special characters

## Troubleshooting

### Module Not Found Errors

If you get import errors, ensure:

1. You're running from the `server` directory
2. Dependencies are installed: `pip install -r requirements.txt`
3. Python version is 3.8+: `python3 --version`

### Port Already in Use

If port 8000 is already in use, edit `main.py`:

```python
uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8001,  # Change port here
    reload=True
)
```

### Database Issues

The SQLite database file `bibliotheque.db` is created automatically. To reset:

```bash
rm bibliotheque.db
python main.py  # Restart to recreate empty database
```

## Dependencies Explained

- **fastapi**: Modern web framework for building APIs
- **uvicorn**: ASGI web server
- **sqlalchemy**: SQL toolkit and ORM
- **pydantic**: Data validation using Python type hints
- **python-jose**: JWT implementation
- **passlib**: Password hashing abstraction
- **bcrypt**: Secure password hashing
- **email-validator**: Email format validation
- **python-multipart**: Multipart form parsing

## Next Steps

1. Add request logging
2. Implement email verification for new users
3. Add password reset functionality
4. Implement user roles and permissions
5. Add book ratings and reviews
6. Implement full-text search for books
7. Add API versioning
8. Create comprehensive test suite
9. Add monitoring and alerting
10. Implement API rate limiting
11. Database seeding with initial data
