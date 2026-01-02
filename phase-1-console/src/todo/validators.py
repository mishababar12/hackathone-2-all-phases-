"""Input validation functions for Todo Console Application."""

from datetime import datetime
from todo.models import Priority

MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 1000
MAX_CATEGORY_LENGTH = 50
MAX_TAG_LENGTH = 30


def validate_title(title: str) -> tuple[bool, str]:
    """Validate task title.

    Args:
        title: The title string to validate.

    Returns:
        Tuple of (is_valid, error_message).
        If valid, error_message is empty string.
    """
    if not title or not title.strip():
        return False, "Title cannot be empty."

    title = title.strip()
    if len(title) > MAX_TITLE_LENGTH:
        return False, f"Title cannot exceed {MAX_TITLE_LENGTH} characters."

    return True, ""


def validate_task_id(id_str: str) -> tuple[int | None, str]:
    """Validate and parse task ID.

    Args:
        id_str: The ID string to validate and parse.

    Returns:
        Tuple of (parsed_id, error_message).
        If invalid, parsed_id is None.
    """
    if not id_str or not id_str.strip():
        return None, "Task ID cannot be empty."

    try:
        task_id = int(id_str.strip())
        if task_id <= 0:
            return None, "Task ID must be a positive number."
        return task_id, ""
    except ValueError:
        return None, "Task ID must be a valid number."


def validate_description(description: str) -> str:
    """Sanitize and validate description.

    Args:
        description: The description string to sanitize.

    Returns:
        Cleaned description string (truncated if too long).
    """
    if not description:
        return ""

    description = description.strip()
    if len(description) > MAX_DESCRIPTION_LENGTH:
        description = description[:MAX_DESCRIPTION_LENGTH]

    return description


def validate_priority(priority_str: str) -> tuple[Priority | None, str]:
    """Validate and parse priority.

    Args:
        priority_str: The priority string (1=Low, 2=Medium, 3=High or name).

    Returns:
        Tuple of (Priority, error_message).
    """
    if not priority_str or not priority_str.strip():
        return Priority.MEDIUM, ""  # Default to medium

    priority_str = priority_str.strip().upper()

    # Try by number
    if priority_str in ("1", "L", "LOW"):
        return Priority.LOW, ""
    elif priority_str in ("2", "M", "MEDIUM"):
        return Priority.MEDIUM, ""
    elif priority_str in ("3", "H", "HIGH"):
        return Priority.HIGH, ""

    return None, "Priority must be 1 (Low), 2 (Medium), or 3 (High)."


def validate_category(category: str) -> tuple[str, str]:
    """Validate category name.

    Args:
        category: The category string to validate.

    Returns:
        Tuple of (cleaned_category, error_message).
    """
    if not category:
        return "", ""

    category = category.strip()
    if len(category) > MAX_CATEGORY_LENGTH:
        return "", f"Category cannot exceed {MAX_CATEGORY_LENGTH} characters."

    return category, ""


def validate_tags(tags_str: str) -> tuple[list[str], str]:
    """Validate and parse tags.

    Args:
        tags_str: Comma-separated tags string.

    Returns:
        Tuple of (list of tags, error_message).
    """
    if not tags_str or not tags_str.strip():
        return [], ""

    tags = []
    for tag in tags_str.split(","):
        tag = tag.strip().lower()
        if tag:
            if len(tag) > MAX_TAG_LENGTH:
                return [], f"Each tag cannot exceed {MAX_TAG_LENGTH} characters."
            tags.append(tag)

    return list(set(tags)), ""  # Remove duplicates


def validate_due_date(date_str: str) -> tuple[datetime | None, str]:
    """Validate and parse due date.

    Args:
        date_str: Date string in format DD/MM/YYYY or DD/MM/YYYY HH:MM.

    Returns:
        Tuple of (datetime, error_message).
    """
    if not date_str or not date_str.strip():
        return None, ""

    date_str = date_str.strip()

    # Try various formats
    formats = [
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M",
        "%d-%m-%Y",
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # If no time specified, set to end of day
            if "%H" not in fmt:
                dt = dt.replace(hour=23, minute=59, second=59)
            return dt, ""
        except ValueError:
            continue

    return None, "Invalid date format. Use DD/MM/YYYY or DD/MM/YYYY HH:MM."


def validate_search_query(query: str) -> tuple[str, str]:
    """Validate search query.

    Args:
        query: The search query string.

    Returns:
        Tuple of (cleaned_query, error_message).
    """
    if not query or not query.strip():
        return "", "Search query cannot be empty."

    return query.strip().lower(), ""


def validate_filter_status(status_str: str) -> tuple[str | None, str]:
    """Validate filter status.

    Args:
        status_str: Status filter (all/complete/incomplete/overdue).

    Returns:
        Tuple of (status, error_message).
    """
    if not status_str or not status_str.strip():
        return "all", ""

    status_str = status_str.strip().lower()

    valid_statuses = ["all", "complete", "completed", "incomplete", "pending", "overdue"]
    if status_str not in valid_statuses:
        return None, f"Status must be one of: {', '.join(valid_statuses)}."

    # Normalize
    if status_str in ("complete", "completed"):
        return "completed", ""
    elif status_str in ("incomplete", "pending"):
        return "pending", ""

    return status_str, ""


def validate_sort_field(sort_str: str) -> tuple[str | None, str]:
    """Validate sort field.

    Args:
        sort_str: Sort field (date/priority/title/status).

    Returns:
        Tuple of (sort_field, error_message).
    """
    if not sort_str or not sort_str.strip():
        return "date", ""

    sort_str = sort_str.strip().lower()

    valid_fields = ["date", "priority", "title", "status", "due", "created"]
    if sort_str not in valid_fields:
        return None, f"Sort by must be one of: {', '.join(valid_fields)}."

    # Normalize
    if sort_str == "created":
        return "date", ""
    if sort_str == "due":
        return "due_date", ""

    return sort_str, ""


def validate_confirmation(response: str) -> bool:
    """Validate yes/no confirmation.

    Args:
        response: User response string.

    Returns:
        True if confirmed, False otherwise.
    """
    if not response:
        return False

    return response.strip().lower() in ("y", "yes", "1", "true")
