from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import init_db
from app.routes import users, books, authors, preferences
from app.logging_config import setup_logging, get_logger
from app.exception_handlers import register_exception_handlers
from app.middleware import RequestIDMiddleware, LoggingMiddleware, CorrelationIDMiddleware

# Setup logging
log_level = os.getenv("LOG_LEVEL", "INFO")
setup_logging(log_level)
logger = get_logger(__name__)

# Initialize database
logger.info("Initializing database...")
init_db()
logger.info("Database initialized successfully")

# Create FastAPI app
app = FastAPI(
    title="Bibliotheque API",
    description="A clean API for managing books, authors, and users with authentication",
    version="1.0.0"
)

# Register exception handlers
register_exception_handlers(app)

# Add middlewares (order matters - they execute in reverse order)
app.add_middleware(CorrelationIDMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

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
