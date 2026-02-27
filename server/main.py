from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes import users, books, authors, preferences

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Bibliotheque API",
    description="A clean API for managing books, authors, and users with authentication",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(users.router)
app.include_router(books.router)
app.include_router(authors.router)
app.include_router(preferences.router)


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "Bibliotheque API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
