"""Task model for Todo Console Application."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class Priority(Enum):
    """Task priority levels."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3

    def __str__(self) -> str:
        return self.name.capitalize()


class TaskStatus(Enum):
    """Task status types."""
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


@dataclass
class Task:
    """Represents a single todo task with enhanced features."""

    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    due_date: datetime | None = None
    priority: Priority = Priority.MEDIUM
    category: str = ""
    tags: list[str] = field(default_factory=list)

    def __str__(self) -> str:
        """Return string representation with status indicator."""
        status = "[X]" if self.completed else "[ ]"
        return f"{status} {self.id}. {self.title}"

    @property
    def status(self) -> TaskStatus:
        """Get current task status based on completion and due date."""
        if self.completed:
            return TaskStatus.COMPLETED
        if self.due_date and datetime.now() > self.due_date:
            return TaskStatus.OVERDUE
        return TaskStatus.PENDING

    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue."""
        return self.status == TaskStatus.OVERDUE

    def formatted_date(self, dt: datetime | None = None) -> str:
        """Format datetime for display."""
        if dt is None:
            dt = self.created_at
        return dt.strftime("%d/%m/%Y")

    def formatted_due_date(self) -> str:
        """Format due date for display."""
        if self.due_date is None:
            return "No due date"
        return self.due_date.strftime("%d/%m/%Y %H:%M")

    def to_dict(self) -> dict:
        """Convert task to dictionary for export."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat(),
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "priority": self.priority.name,
            "category": self.category,
            "tags": self.tags,
        }

    @classmethod
    def from_dict(cls, data: dict, task_id: int | None = None) -> "Task":
        """Create task from dictionary for import."""
        return cls(
            id=task_id if task_id is not None else data.get("id", 0),
            title=data["title"],
            description=data.get("description", ""),
            completed=data.get("completed", False),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.now(),
            due_date=datetime.fromisoformat(data["due_date"]) if data.get("due_date") else None,
            priority=Priority[data.get("priority", "MEDIUM")],
            category=data.get("category", ""),
            tags=data.get("tags", []),
        )
