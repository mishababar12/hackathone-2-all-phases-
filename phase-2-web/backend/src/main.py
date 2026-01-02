from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .routes import auth, tasks

app = FastAPI(title="Todo Web App API", version="0.1.0")

# CORS Configuration - Allow all origins for development
origins = [
    "http://localhost:3000",
    "http://localhost:3001",  # Alternate port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://todo-hackathone-frontend.vercel.app",  # Production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "backend"}

@app.get("/")
def read_root():
    return {"message": "Welcome to Phase 2 Todo API"}
