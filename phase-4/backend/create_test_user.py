#!/usr/bin/env python3
"""
Script to create a test user in the database for development purposes.
"""
import os
import sys
from dotenv import load_dotenv

# Add the src directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Import models in the correct order to avoid circular imports
from src.models.user import User
from src.models.task import Task
from src.db import engine
from sqlmodel import Session, select
from src.services.auth_service import get_password_hash

load_dotenv()

def create_test_user():
    """Create a test user if one doesn't already exist."""

    # Test user credentials
    test_email = "test@example.com"
    test_password = "testpassword123"
    test_name = "Test User"

    with Session(engine) as session:
        # Check if test user already exists
        existing_user = session.exec(select(User).where(User.email == test_email)).first()

        if existing_user:
            print(f"Test user ({test_email}) already exists in the database.")
            print(f"User ID: {existing_user.id}")
            return existing_user

        # Create new test user
        hashed_password = get_password_hash(test_password)
        test_user = User(
            email=test_email,
            name=test_name,
            hashed_password=hashed_password
        )

        session.add(test_user)
        session.commit()
        session.refresh(test_user)

        print(f"Created test user: {test_email}")
        print(f"User ID: {test_user.id}")
        print(f"Credentials: {test_email} / {test_password}")

        return test_user

if __name__ == "__main__":
    create_test_user()