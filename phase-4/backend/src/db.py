import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    from .models.user import User
    from .models.task import Task
    # Create tables only if they don't exist (serverless-safe)
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
