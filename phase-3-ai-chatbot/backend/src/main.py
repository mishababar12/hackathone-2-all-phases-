from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .routes import auth, tasks, chat

app = FastAPI(title="Todo Web App API", version="0.1.0")

# CORS Configuration - Allow Vercel frontend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://hackathone-2-all-phases.vercel.app",  # Your production frontend
    "https://*.vercel.app",  # All Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for serverless
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(chat.router)

# Removed startup event for serverless compatibility
# Database tables should be created manually or via migrations

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "backend"}

@app.get("/")
def read_root():
    return {"message": "Welcome to Phase 2 Todo API"}
