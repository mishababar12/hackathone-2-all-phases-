---
title: Phase 3 AI Chatbot Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Todo Web App Backend API

FastAPI backend for the Todo Web Application with authentication and task management.

## Features

- JWT-based authentication
- RESTful API for CRUD operations on tasks
- PostgreSQL database integration
- CORS support for frontend integration

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Tasks
- `GET /api/v1/tasks/` - Get all user tasks
- `POST /api/v1/tasks/` - Create new task
- `GET /api/v1/tasks/{task_id}` - Get specific task
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task

## Configuration

Set these environment variables in the Spaces settings:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (use a strong random string)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time (default: 30)

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

## License

MIT
