from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlmodel import Session, select
from typing import List, Optional
from ..db import get_session
from ..models.task import Task, TaskCreate, TaskRead, TaskUpdate
from ..services.auth_service import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Dependency to get current user from Bearer Token in Header
def get_current_user_id(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.post("/", response_model=TaskRead)
def create_task(
    task_in: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    print(f"DEBUG: Attempting to create task for user {user_id}")
    print(f"DEBUG: Task input: {task_in.dict()}")
    try:
        db_task = Task(**task_in.dict(), user_id=user_id)
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        print("DEBUG: Task created successfully")
        return db_task
    except Exception as e:
        session.rollback()
        print(f"DEBUG Error creating task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/", response_model=List[TaskRead])
def read_tasks(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    try:
        # Order by priority (high first) then by created_at
        statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        return session.exec(statement).all()
    except Exception:
        raise HTTPException(status_code=503, detail="Database service unavailable")

@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        task_data = task_in.dict(exclude_unset=True)
        for key, value in task_data.items():
            setattr(db_task, key, value)

        # Always update updated_at when task is modified
        from datetime import datetime
        db_task.updated_at = datetime.utcnow()

        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task
    except Exception:
        session.rollback()
        raise HTTPException(status_code=503, detail="Database service unavailable")

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        session.delete(db_task)
        session.commit()
        return {"ok": True}
    except Exception:
        session.rollback()
        raise HTTPException(status_code=503, detail="Database service unavailable")
