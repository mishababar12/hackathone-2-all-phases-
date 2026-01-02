"""In-memory task storage for Todo Console Application."""

import json
from datetime import datetime
from pathlib import Path
from todo.models import Task, Priority, TaskStatus


class TaskStorage:
    """In-memory storage for tasks with CRUD operations and advanced features."""

    def __init__(self) -> None:
        """Initialize empty task storage."""
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1
        self._undo_stack: list[tuple[str, Task | None, dict | None]] = []
        self._max_undo: int = 10

    def _save_undo(self, action: str, task: Task | None = None, old_data: dict | None = None) -> None:
        """Save action to undo stack."""
        if len(self._undo_stack) >= self._max_undo:
            self._undo_stack.pop(0)
        self._undo_stack.append((action, task, old_data))

    def add_task(
        self,
        title: str,
        description: str = "",
        priority: Priority = Priority.MEDIUM,
        category: str = "",
        tags: list[str] | None = None,
        due_date: datetime | None = None,
    ) -> Task:
        """Create and store a new task.

        Args:
            title: The task title (required).
            description: The task description (optional).
            priority: Task priority level.
            category: Task category.
            tags: List of tags.
            due_date: Due date for the task.

        Returns:
            The created Task object with assigned ID.
        """
        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description.strip() if description else "",
            priority=priority,
            category=category.strip() if category else "",
            tags=tags if tags else [],
            due_date=due_date,
        )
        self._tasks[task.id] = task
        self._next_id += 1
        self._save_undo("add", task)
        return task

    def get_all_tasks(self) -> list[Task]:
        """Return all tasks sorted by ID ascending.

        Returns:
            List of all tasks, sorted by ID.
        """
        return sorted(self._tasks.values(), key=lambda t: t.id)

    def get_task(self, task_id: int) -> Task | None:
        """Return task by ID or None if not found.

        Args:
            task_id: The ID of the task to retrieve.

        Returns:
            The Task object if found, None otherwise.
        """
        return self._tasks.get(task_id)

    def update_task(
        self,
        task_id: int,
        title: str | None = None,
        description: str | None = None,
        priority: Priority | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
        due_date: datetime | None = None,
        clear_due_date: bool = False,
    ) -> Task | None:
        """Update task fields.

        Args:
            task_id: The ID of the task to update.
            title: New title (optional, None means no change).
            description: New description (optional, None means no change).
            priority: New priority (optional).
            category: New category (optional).
            tags: New tags (optional).
            due_date: New due date (optional).
            clear_due_date: If True, clears the due date.

        Returns:
            The updated Task object if found, None otherwise.
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None

        # Save old state for undo
        old_data = task.to_dict()
        self._save_undo("update", None, old_data)

        if title is not None:
            task.title = title.strip()
        if description is not None:
            task.description = description.strip()
        if priority is not None:
            task.priority = priority
        if category is not None:
            task.category = category.strip()
        if tags is not None:
            task.tags = tags
        if due_date is not None:
            task.due_date = due_date
        if clear_due_date:
            task.due_date = None

        return task

    def delete_task(self, task_id: int) -> bool:
        """Delete task by ID.

        Args:
            task_id: The ID of the task to delete.

        Returns:
            True if task was deleted, False if not found.
        """
        if task_id in self._tasks:
            task = self._tasks[task_id]
            self._save_undo("delete", task)
            del self._tasks[task_id]
            return True
        return False

    def toggle_complete(self, task_id: int) -> Task | None:
        """Toggle task completion status.

        Args:
            task_id: The ID of the task to toggle.

        Returns:
            The updated Task object if found, None otherwise.
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None

        old_data = task.to_dict()
        self._save_undo("toggle", None, old_data)
        task.completed = not task.completed
        return task

    def search_tasks(self, query: str) -> list[Task]:
        """Search tasks by keyword in title, description, category, or tags.

        Args:
            query: Search keyword (case-insensitive).

        Returns:
            List of matching tasks.
        """
        query = query.lower()
        results = []
        for task in self._tasks.values():
            if (
                query in task.title.lower()
                or query in task.description.lower()
                or query in task.category.lower()
                or any(query in tag for tag in task.tags)
            ):
                results.append(task)
        return sorted(results, key=lambda t: t.id)

    def filter_tasks(self, status: str = "all", category: str = "") -> list[Task]:
        """Filter tasks by status and/or category.

        Args:
            status: Filter by status (all/completed/pending/overdue).
            category: Filter by category (optional).

        Returns:
            List of filtered tasks.
        """
        tasks = list(self._tasks.values())

        # Filter by status
        if status == "completed":
            tasks = [t for t in tasks if t.completed]
        elif status == "pending":
            tasks = [t for t in tasks if not t.completed and not t.is_overdue]
        elif status == "overdue":
            tasks = [t for t in tasks if t.is_overdue]

        # Filter by category
        if category:
            tasks = [t for t in tasks if t.category.lower() == category.lower()]

        return sorted(tasks, key=lambda t: t.id)

    def sort_tasks(self, tasks: list[Task], sort_by: str = "date", reverse: bool = False) -> list[Task]:
        """Sort tasks by specified field.

        Args:
            tasks: List of tasks to sort.
            sort_by: Field to sort by (date/priority/title/status/due_date).
            reverse: If True, sort in descending order.

        Returns:
            Sorted list of tasks.
        """
        if sort_by == "date":
            key = lambda t: t.created_at
        elif sort_by == "priority":
            key = lambda t: t.priority.value
            reverse = not reverse  # Higher priority first by default
        elif sort_by == "title":
            key = lambda t: t.title.lower()
        elif sort_by == "status":
            key = lambda t: (t.completed, not t.is_overdue)
        elif sort_by == "due_date":
            key = lambda t: t.due_date if t.due_date else datetime.max
        else:
            key = lambda t: t.id

        return sorted(tasks, key=key, reverse=reverse)

    def get_statistics(self) -> dict:
        """Get task statistics.

        Returns:
            Dictionary with task statistics.
        """
        tasks = list(self._tasks.values())
        total = len(tasks)

        if total == 0:
            return {
                "total": 0,
                "completed": 0,
                "pending": 0,
                "overdue": 0,
                "completion_rate": 0.0,
                "by_priority": {"high": 0, "medium": 0, "low": 0},
                "by_category": {},
                "by_tag": {},
            }

        completed = sum(1 for t in tasks if t.completed)
        overdue = sum(1 for t in tasks if t.is_overdue)
        pending = total - completed

        # By priority
        by_priority = {
            "high": sum(1 for t in tasks if t.priority == Priority.HIGH),
            "medium": sum(1 for t in tasks if t.priority == Priority.MEDIUM),
            "low": sum(1 for t in tasks if t.priority == Priority.LOW),
        }

        # By category
        by_category: dict[str, int] = {}
        for task in tasks:
            cat = task.category or "Uncategorized"
            by_category[cat] = by_category.get(cat, 0) + 1

        # By tag
        by_tag: dict[str, int] = {}
        for task in tasks:
            for tag in task.tags:
                by_tag[tag] = by_tag.get(tag, 0) + 1

        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "overdue": overdue,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0.0,
            "by_priority": by_priority,
            "by_category": by_category,
            "by_tag": by_tag,
        }

    def get_categories(self) -> list[str]:
        """Get list of all unique categories.

        Returns:
            List of category names.
        """
        categories = set()
        for task in self._tasks.values():
            if task.category:
                categories.add(task.category)
        return sorted(categories)

    def get_tags(self) -> list[str]:
        """Get list of all unique tags.

        Returns:
            List of tag names.
        """
        tags = set()
        for task in self._tasks.values():
            tags.update(task.tags)
        return sorted(tags)

    def undo_last_action(self) -> tuple[bool, str]:
        """Undo the last action.

        Returns:
            Tuple of (success, message).
        """
        if not self._undo_stack:
            return False, "Nothing to undo."

        action, task, old_data = self._undo_stack.pop()

        if action == "add" and task:
            # Undo add = delete the task
            if task.id in self._tasks:
                del self._tasks[task.id]
                return True, f"Undid add: Removed task '{task.title}'"

        elif action == "delete" and task:
            # Undo delete = restore the task
            self._tasks[task.id] = task
            return True, f"Undid delete: Restored task '{task.title}'"

        elif action in ("update", "toggle") and old_data:
            # Undo update/toggle = restore old data
            task_id = old_data["id"]
            if task_id in self._tasks:
                restored = Task.from_dict(old_data, task_id)
                self._tasks[task_id] = restored
                return True, f"Undid {action}: Restored task '{restored.title}'"

        return False, "Could not undo action."

    def export_to_file(self, filepath: str) -> tuple[bool, str]:
        """Export tasks to JSON file.

        Args:
            filepath: Path to export file.

        Returns:
            Tuple of (success, message).
        """
        try:
            tasks_data = [task.to_dict() for task in self.get_all_tasks()]
            export_data = {
                "version": "1.0",
                "exported_at": datetime.now().isoformat(),
                "task_count": len(tasks_data),
                "tasks": tasks_data,
            }

            path = Path(filepath)
            if not path.suffix:
                path = path.with_suffix(".json")

            with open(path, "w", encoding="utf-8") as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)

            return True, f"Exported {len(tasks_data)} tasks to {path}"

        except Exception as e:
            return False, f"Export failed: {str(e)}"

    def import_from_file(self, filepath: str, merge: bool = True) -> tuple[bool, str]:
        """Import tasks from JSON file.

        Args:
            filepath: Path to import file.
            merge: If True, add to existing tasks. If False, replace all.

        Returns:
            Tuple of (success, message).
        """
        try:
            path = Path(filepath)
            if not path.exists():
                return False, f"File not found: {filepath}"

            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if "tasks" not in data:
                return False, "Invalid file format: missing 'tasks' key"

            if not merge:
                self._tasks.clear()
                self._next_id = 1

            imported_count = 0
            for task_data in data["tasks"]:
                try:
                    task = Task.from_dict(task_data, self._next_id)
                    self._tasks[task.id] = task
                    self._next_id += 1
                    imported_count += 1
                except Exception:
                    continue  # Skip invalid tasks

            return True, f"Imported {imported_count} tasks from {path}"

        except json.JSONDecodeError:
            return False, "Invalid JSON file format"
        except Exception as e:
            return False, f"Import failed: {str(e)}"

    def export_to_text(self, filepath: str) -> tuple[bool, str]:
        """Export tasks to plain text file.

        Args:
            filepath: Path to export file.

        Returns:
            Tuple of (success, message).
        """
        try:
            path = Path(filepath)
            if not path.suffix:
                path = path.with_suffix(".txt")

            lines = [
                "=" * 50,
                "TODO LIST EXPORT",
                f"Exported: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
                "=" * 50,
                "",
            ]

            tasks = self.get_all_tasks()
            if not tasks:
                lines.append("No tasks to export.")
            else:
                for task in tasks:
                    status = "[X]" if task.completed else "[ ]"
                    lines.append(f"{status} {task.id}. {task.title}")
                    if task.description:
                        lines.append(f"    Description: {task.description}")
                    if task.category:
                        lines.append(f"    Category: {task.category}")
                    if task.tags:
                        lines.append(f"    Tags: {', '.join(task.tags)}")
                    if task.due_date:
                        lines.append(f"    Due: {task.formatted_due_date()}")
                    lines.append(f"    Priority: {task.priority}")
                    lines.append(f"    Created: {task.formatted_date()}")
                    lines.append("")

            lines.append("=" * 50)
            lines.append(f"Total: {len(tasks)} tasks")

            with open(path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))

            return True, f"Exported {len(tasks)} tasks to {path}"

        except Exception as e:
            return False, f"Export failed: {str(e)}"
