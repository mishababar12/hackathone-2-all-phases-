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

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health_check():
    """Liveness probe - checks if the service is running"""
    return {"status": "healthy", "service": "todo-backend"}

@app.get("/ready")
def readiness_check():
    """Readiness probe - checks if the service can accept traffic"""
    # In production, this would check database connectivity
    return {"status": "ready", "service": "todo-backend"}

@app.get("/")
def read_root():
    return {"message": "Welcome to Todo Chatbot API - Phase IV"}
