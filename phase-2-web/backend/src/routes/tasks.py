from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..db import get_session
from ..models.task import Task, TaskCreate, TaskRead, TaskUpdate
from ..services.auth_service import SECRET_KEY, ALGORITHM
from jose import jwt

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Dependency to get current user from JWT
def get_current_user_id(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=TaskRead)
def create_task(
    task_in: TaskCreate,
    token: str,
    session: Session = Depends(get_session)
):
    user_id = get_current_user_id(token)
    db_task = Task(**task_in.dict(), user_id=user_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/", response_model=List[TaskRead])
def read_tasks(
    token: str,
    session: Session = Depends(get_session)
):
    user_id = get_current_user_id(token)
    # Order by priority (high first) then by created_at
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    return session.exec(statement).all()

@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    token: str,
    session: Session = Depends(get_session)
):
    user_id = get_current_user_id(token)
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

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

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    token: str,
    session: Session = Depends(get_session)
):
    user_id = get_current_user_id(token)
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(db_task)
    session.commit()
    return {"ok": True}
