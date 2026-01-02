# Data Model: Phase I - In-Memory Python Console Todo App

**Date**: 2025-12-29
**Phase**: 1 - Design

## Entity Definitions

### Task Entity

The Task entity represents a single todo item in the application.

```python
@dataclass
class Task:
    """
    Represents a single todo task.

    Attributes:
        id: Unique numeric identifier (auto-assigned, immutable)
        title: Brief description of what needs to be done (required, 1-200 chars)
        description: Detailed information about the task (optional, 0-1000 chars)
        completed: Whether the task is done (default: False)
        created_at: Timestamp of task creation (auto-assigned)
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

### Field Specifications

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | `int` | Yes | Auto-assigned | Positive integer, unique, immutable |
| `title` | `str` | Yes | N/A | 1-200 characters, non-empty |
| `description` | `str` | No | `""` | 0-1000 characters |
| `completed` | `bool` | No | `False` | True/False |
| `created_at` | `datetime` | Yes | Auto-assigned | Current timestamp at creation |

### Validation Rules

#### Title Validation
- **Required**: Cannot be empty or whitespace-only
- **Length**: Minimum 1 character, maximum 200 characters
- **Trim**: Leading/trailing whitespace should be stripped
- **Characters**: Any Unicode characters allowed (including special chars)

```python
def validate_title(title: str) -> tuple[bool, str]:
    """
    Validate task title.

    Args:
        title: The title string to validate

    Returns:
        Tuple of (is_valid, error_message)
        error_message is empty string if valid
    """
    stripped = title.strip()
    if not stripped:
        return False, "Title cannot be empty"
    if len(stripped) > 200:
        return False, "Title cannot exceed 200 characters"
    return True, ""
```

#### Description Validation
- **Optional**: Empty string is valid
- **Length**: Maximum 1000 characters
- **Characters**: Any Unicode characters allowed

```python
def validate_description(description: str) -> str:
    """
    Sanitize and validate description.

    Args:
        description: The description string

    Returns:
        Sanitized description (truncated if necessary)
    """
    return description[:1000] if description else ""
```

#### Task ID Validation
- **Format**: Must be a positive integer
- **Existence**: Must correspond to an existing task (for operations)

```python
def validate_task_id(id_str: str) -> tuple[int | None, str]:
    """
    Validate and parse task ID from string input.

    Args:
        id_str: String representation of task ID

    Returns:
        Tuple of (parsed_id, error_message)
        parsed_id is None if invalid
    """
    stripped = id_str.strip()
    if not stripped:
        return None, "Task ID cannot be empty"
    try:
        task_id = int(stripped)
        if task_id <= 0:
            return None, "Task ID must be a positive number"
        return task_id, ""
    except ValueError:
        return None, "Task ID must be a valid number"
```

## Storage Model

### TaskStorage Class

In-memory storage using a dictionary for O(1) lookups.

```python
class TaskStorage:
    """
    In-memory storage for tasks with CRUD operations.

    Attributes:
        _tasks: Dictionary mapping task ID to Task object
        _next_id: Counter for auto-incrementing task IDs
    """

    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1
```

### Storage Operations

| Operation | Method | Input | Output | Notes |
|-----------|--------|-------|--------|-------|
| Create | `add_task(title, description)` | title: str, description: str | Task | Returns created task |
| Read All | `get_all_tasks()` | None | list[Task] | Sorted by ID ascending |
| Read One | `get_task(task_id)` | task_id: int | Task \| None | None if not found |
| Update | `update_task(task_id, title, description)` | task_id: int, title: str?, desc: str? | Task \| None | Partial updates allowed |
| Delete | `delete_task(task_id)` | task_id: int | bool | True if deleted |
| Toggle | `toggle_complete(task_id)` | task_id: int | Task \| None | Flips completed status |

### ID Management

- IDs start at 1 and auto-increment
- Deleted IDs are **NOT** reused
- `_next_id` always points to next available ID

```python
def add_task(self, title: str, description: str = "") -> Task:
    task = Task(
        id=self._next_id,
        title=title,
        description=description
    )
    self._tasks[self._next_id] = task
    self._next_id += 1
    return task
```

## State Transitions

### Task Lifecycle

```
                    ┌─────────────┐
                    │   Created   │
                    │ completed=  │
                    │   False     │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │  Updated  │  │ Completed │  │  Deleted  │
     │(title/desc)│  │completed= │  │(removed)  │
     └───────────┘  │   True    │  └───────────┘
            │       └─────┬─────┘
            │             │
            │      toggle │
            │             ▼
            │       ┌───────────┐
            │       │Incomplete │
            └──────▶│completed= │
                    │   False   │
                    └───────────┘
```

### State Invariants

1. **ID Uniqueness**: No two tasks share the same ID
2. **ID Immutability**: Task ID cannot change after creation
3. **ID Monotonicity**: IDs always increase (never decrease or reuse)
4. **Timestamp Immutability**: `created_at` never changes after creation
5. **Title Required**: Task always has non-empty title

## Data Display Format

### Task List Display

```
╔══════════════════════════════════════════════════════════════╗
║                       YOUR TASKS                              ║
╠══════════════════════════════════════════════════════════════╣
║ [ ] 1. Buy groceries                                          ║
║       Description: Milk, eggs, bread                          ║
║ [X] 2. Call mom                                               ║
║       Description: Wish happy birthday                        ║
║ [ ] 3. Finish report                                          ║
║       Description:                                            ║
╚══════════════════════════════════════════════════════════════╝
```

### Single Task Display

```
Task #1
Status: Incomplete
Title: Buy groceries
Description: Milk, eggs, bread
Created: 2025-12-29 10:30:00
```

### Empty List Display

```
╔══════════════════════════════════════════════════════════════╗
║                       YOUR TASKS                              ║
╠══════════════════════════════════════════════════════════════╣
║                  No tasks yet. Add one!                       ║
╚══════════════════════════════════════════════════════════════╝
```

## Error Messages

| Error Condition | Message |
|-----------------|---------|
| Empty title | "Error: Title cannot be empty" |
| Title too long | "Error: Title cannot exceed 200 characters" |
| Invalid ID format | "Error: Task ID must be a valid number" |
| Task not found | "Error: Task #{id} not found" |
| Empty input | "Error: Please enter a value" |

## Memory Considerations

- **Expected Scale**: Up to 100 tasks per session
- **Memory per Task**: ~500 bytes (estimated)
- **Total Memory**: ~50KB for 100 tasks (negligible)
- **No Persistence**: All data cleared on application exit
