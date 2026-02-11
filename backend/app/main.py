"""
Synkro - AI-Powered Workspace Orchestration System
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, close_db
from app.routers import auth, tasks, meetings, chat, integrations, analytics

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print(f"[*] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"[*] Environment: {settings.ENVIRONMENT}")

    # Check critical configuration
    print("\n[*] Configuration Check:")

    # OpenAI API Key (required for meeting transcription)
    if settings.OPENAI_API_KEY:
        print("    ✓ OpenAI API Key: Configured")
    else:
        print("    ✗ OpenAI API Key: MISSING")
        print("      WARNING: Meeting transcription will not work!")
        print("      Get your key at: https://platform.openai.com/api-keys")

    # Storage configuration
    if settings.use_s3:
        print("    ✓ Storage: AWS S3")
    elif settings.use_cloudinary:
        print("    ✓ Storage: Cloudinary")
    else:
        print("    ⚠ Storage: Local filesystem (development only)")

    # Database
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
    print(f"    ✓ Database: {db_type}")

    # Redis/Celery
    if settings.REDIS_URL:
        print("    ✓ Redis: Configured")
    else:
        print("    ✗ Redis: Not configured (background tasks disabled)")

    print("")

    # Initialize database (uncomment if you want to create tables on startup)
    # await init_db()

    yield

    # Shutdown
    print("[*] Shutting down application")
    await close_db()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Workspace Orchestration System for Software Development Teams",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(meetings.router)
app.include_router(chat.router)
app.include_router(integrations.router)
app.include_router(analytics.router)

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-Powered Workspace Orchestration System",
        "docs": "/api/docs",
        "status": "operational"
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION
    }


# API status endpoint
@app.get("/api/status", tags=["Status"])
async def api_status():
    """
    API status endpoint with feature availability
    """
    return {
        "status": "operational",
        "features": {
            "authentication": True,
            "task_management": True,
            "meeting_transcription": bool(settings.OPENAI_API_KEY),
            "file_storage": settings.use_s3 or settings.use_cloudinary,
            "integrations": {
                "gmail": bool(settings.GOOGLE_CLIENT_ID),
                "slack": bool(settings.SLACK_CLIENT_ID)
            }
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development"
    )
