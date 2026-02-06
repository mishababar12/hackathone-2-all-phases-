from fastapi import APIRouter, Depends, Header, HTTPException, status
import os
from fastapi.responses import StreamingResponse
import json
from typing import AsyncGenerator, Dict, Any
import cohere
from sqlmodel import Session, select
from datetime import datetime
from ..db import get_session
from ..models.task import Task, Priority
from jose import jwt, JWTError
from ..services.auth_service import SECRET_KEY, ALGORITHM

def search_task_by_name(session: Session, user_id: str, task_name: str) -> Task:
    """
    Search for a task by name among user's tasks.
    """
    stmt = select(Task).where(
        Task.user_id == user_id,
        Task.title.ilike(f"%{task_name.lower()}%"),
        Task.completed == False  # Only search for active tasks
    )
    task = session.exec(stmt).first()

    if not task:
        # If not found in active tasks, search in completed tasks
        stmt = select(Task).where(
            Task.user_id == user_id,
            Task.title.ilike(f"%{task_name.lower()}%")
        )
        task = session.exec(stmt).first()

    return task

router = APIRouter(prefix="/api/chat", tags=["chat"])

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

@router.post("/")
async def chat_stream(
    request: Dict[str, Any],
    authorization: str = Header(...),
    session: Session = Depends(get_session)
) -> StreamingResponse:
    user_id = get_current_user_id(authorization)
    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Cohere API key not configured")

    client = cohere.Client(api_key)

    # Define tools in Cohere format
    tools = [
        {
            "name": "create_task",
            "description": "Create a new task for the user",
            "parameter_definitions": {
                "title": {"type": "str", "required": True, "description": "The task title"},
                "description": {"type": "str", "required": False, "description": "Optional description"},
                "priority": {"type": "str", "required": False, "description": "Task priority (low, medium, high)"}
            }
        },
        {
            "name": "list_tasks",
            "description": "List the user's current tasks with their IDs",
            "parameter_definitions": {}
        },
        {
            "name": "complete_task",
            "description": "Mark a specific task as completed by ID or name",
            "parameter_definitions": {
                "task_id": {"type": "int", "required": False, "description": "The ID of the task to complete"},
                "task_name": {"type": "str", "required": False, "description": "The name/title of the task to complete"}
            }
        },
        {
            "name": "delete_task",
            "description": "Delete a specific task by ID or name",
            "parameter_definitions": {
                "task_id": {"type": "int", "required": False, "description": "The ID of the task to delete"},
                "task_name": {"type": "str", "required": False, "description": "The name/title of the task to delete"}
            }
        }
    ]

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            messages = request.get("messages", [])

            # Build chat history from messages
            chat_history = []
            current_message = ""

            for msg in messages:
                role = msg.get("role")
                content = msg.get("content", "")

                if role == "user":
                    current_message = content
                elif role == "assistant":
                    chat_history.append({"role": "CHATBOT", "message": content})
                elif role == "tool":
                    chat_history.append({"role": "TOOL_RESULT", "message": content})

            # Call Cohere chat endpoint
            response = client.chat(
                message=current_message,
                chat_history=chat_history,
                tools=tools,
                model="command-r-plus-08-2024",
                temperature=0.3
            )

            # Stream the response text if available
            if response.text:
                yield f"data: {json.dumps({'choices': [{'delta': {'content': response.text}}]})}\n\n"

            # Handle tool calls if any
            if hasattr(response, 'tool_calls') and response.tool_calls:
                tool_results = []

                for tool_call in response.tool_calls:
                    function_name = tool_call.name
                    parameters = tool_call.parameters

                    # Execute the tool based on its name
                    try:
                        if function_name == "create_task":
                            title = parameters["title"]
                            description = parameters.get("description", "")
                            priority_str = parameters.get("priority", "medium")

                            # Validate priority
                            try:
                                priority = Priority(priority_str)
                            except ValueError:
                                priority = Priority.medium

                            db_task = Task(
                                title=title,
                                description=description,
                                priority=priority,
                                user_id=user_id
                            )
                            session.add(db_task)
                            session.commit()
                            session.refresh(db_task)

                            tool_result = {
                                "call": {"name": function_name, "parameters": parameters},
                                "outputs": [{"result": f"Created task '{title}' with ID {db_task.id}"}]
                            }

                        elif function_name == "list_tasks":
                            stmt = select(Task).where(Task.user_id == user_id).order_by(
                                Task.priority.desc(), Task.created_at.desc()
                            )
                            tasks = session.exec(stmt).all()

                            task_list = []
                            active_tasks = []
                            completed_tasks = []

                            for t in tasks:
                                task_info = {
                                    "id": t.id,
                                    "title": t.title,
                                    "completed": t.completed,
                                    "priority": t.priority.value,
                                    "description": t.description
                                }

                                if t.completed:
                                    completed_tasks.append(task_info)
                                else:
                                    active_tasks.append(task_info)
                                task_list.append(task_info)

                            active_list = [f"- {t['title']} (ID: {t['id']})" for t in active_tasks]
                            completed_list = [f"- {t['title']} (ID: {t['id']})" for t in completed_tasks]

                            active_text = "\n".join(active_list) if active_list else "No active tasks"
                            completed_text = "\n".join(completed_list) if completed_list else "No completed tasks"

                            result_text = f"You have {len(active_tasks)} active tasks:\n{active_text}\n\nCompleted tasks:\n{completed_text}"

                            tool_result = {
                                "call": {"name": function_name, "parameters": parameters},
                                "outputs": [{"result": result_text}]
                            }

                        elif function_name == "complete_task":
                            task_id = parameters.get("task_id")
                            task_name = parameters.get("task_name")

                            db_task = None

                            if task_id:
                                # Complete by ID
                                db_task = session.get(Task, task_id)
                            elif task_name:
                                # Complete by name
                                db_task = search_task_by_name(session, user_id, task_name)

                            if db_task and db_task.user_id == user_id:
                                if db_task.completed:
                                    tool_result = {
                                        "call": {"name": function_name, "parameters": parameters},
                                        "outputs": [{"result": f"Task '{db_task.title}' (ID: {db_task.id}) is already completed"}]
                                    }
                                else:
                                    db_task.completed = True
                                    session.add(db_task)
                                    session.commit()

                                    tool_result = {
                                        "call": {"name": function_name, "parameters": parameters},
                                        "outputs": [{"result": f"Completed task '{db_task.title}' (ID: {db_task.id})"}]
                                    }
                            else:
                                # Show available tasks when completion fails
                                stmt = select(Task).where(Task.user_id == user_id)
                                all_tasks = session.exec(stmt).all()

                                available_tasks = [f"{t.title} (ID: {t.id})" for t in all_tasks]

                                if available_tasks:
                                    task_list_str = ", ".join(available_tasks)
                                    error_msg = f"Task not found. Available tasks: {task_list_str}"
                                else:
                                    error_msg = "No tasks found for this user."

                                tool_result = {
                                    "call": {"name": function_name, "parameters": parameters},
                                    "outputs": [{"result": error_msg}]
                                }

                        elif function_name == "delete_task":
                            task_id = parameters.get("task_id")
                            task_name = parameters.get("task_name")

                            db_task = None

                            if task_id:
                                # Delete by ID
                                db_task = session.get(Task, task_id)
                            elif task_name:
                                # Delete by name
                                db_task = search_task_by_name(session, user_id, task_name)

                            if db_task and db_task.user_id == user_id:
                                task_title = db_task.title
                                task_id = db_task.id
                                session.delete(db_task)
                                session.commit()

                                tool_result = {
                                    "call": {"name": function_name, "parameters": parameters},
                                    "outputs": [{"result": f"Deleted task '{task_title}' (ID: {task_id})"}]
                                }
                            else:
                                # Show available tasks when deletion fails
                                stmt = select(Task).where(Task.user_id == user_id)
                                all_tasks = session.exec(stmt).all()

                                available_tasks = [f"{t.title} (ID: {t.id})" for t in all_tasks]

                                if available_tasks:
                                    task_list_str = ", ".join(available_tasks)
                                    error_msg = f"Task not found. Available tasks: {task_list_str}"
                                else:
                                    error_msg = "No tasks found for this user."

                                tool_result = {
                                    "call": {"name": function_name, "parameters": parameters},
                                    "outputs": [{"result": error_msg}]
                                }
                        else:
                            tool_result = {
                                "call": {"name": function_name, "parameters": parameters},
                                "outputs": [{"result": "Unknown function called"}]
                            }

                    except Exception as e:
                        tool_result = {
                            "call": {"name": function_name, "parameters": parameters},
                            "outputs": [{"result": f"Error executing tool: {str(e)}"}]
                        }

                    tool_results.append(tool_result)

                # If there were tool calls, make a follow-up request with tool results
                if tool_results:
                    follow_up_response = client.chat(
                        message="",
                        chat_history=chat_history + ([{"role": "CHATBOT", "message": response.text}] if response.text else []),
                        tools=tools,
                        tool_results=tool_results,
                        model="command-r-plus-08-2024",
                        temperature=0.3
                    )

                    if follow_up_response.text:
                        yield f"data: {json.dumps({'choices': [{'delta': {'content': follow_up_response.text}}]})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': f'API error: {str(e)}'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

