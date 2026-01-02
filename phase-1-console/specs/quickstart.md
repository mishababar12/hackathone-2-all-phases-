# Quickstart Guide: Phase I - Todo Console App

**Date**: 2025-12-29

## Prerequisites

- Python 3.13 or higher
- UV package manager

### Install UV (if not installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or with pip
pip install uv
```

### Verify Python Version

```bash
python --version
# Should show Python 3.13.x or higher
```

## Setup

### 1. Navigate to Phase 1 Directory

```bash
cd phase-1-console
```

### 2. Initialize Project with UV

```bash
# Initialize the project (creates virtual environment)
uv sync

# Or if starting fresh
uv init
uv add --dev pytest pytest-cov ruff black
```

### 3. Activate Virtual Environment

```bash
# macOS/Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat
```

## Running the Application

### Option 1: Run as Module

```bash
python -m todo
```

### Option 2: Run Entry Script

```bash
python src/todo/cli.py
```

### Option 3: Use UV Run (no activation needed)

```bash
uv run python -m todo
```

## Using the Application

### Main Menu

When you start the application, you'll see:

```
╔══════════════════════════════════════╗
║         TODO APPLICATION             ║
╠══════════════════════════════════════╣
║  1. Add Task                         ║
║  2. View All Tasks                   ║
║  3. Mark Task Complete/Incomplete    ║
║  4. Update Task                      ║
║  5. Delete Task                      ║
║  6. Exit                             ║
╚══════════════════════════════════════╝

Enter your choice (1-6):
```

### Example Workflow

#### 1. Add a Task

```
Enter your choice (1-6): 1

=== ADD NEW TASK ===
Enter task title: Buy groceries
Enter description (optional): Milk, eggs, bread

✓ Task #1 created successfully!
```

#### 2. View Tasks

```
Enter your choice (1-6): 2

╔══════════════════════════════════════════════════════════════╗
║                       YOUR TASKS                              ║
╠══════════════════════════════════════════════════════════════╣
║ [ ] 1. Buy groceries                                          ║
║       Description: Milk, eggs, bread                          ║
╚══════════════════════════════════════════════════════════════╝
```

#### 3. Mark Complete

```
Enter your choice (1-6): 3

Enter task ID to toggle: 1

✓ Task #1 marked as complete!
```

#### 4. Update Task

```
Enter your choice (1-6): 4

Enter task ID to update: 1
Enter new title (or press Enter to keep current): Buy groceries and fruits
Enter new description (or press Enter to keep current):

✓ Task #1 updated successfully!
```

#### 5. Delete Task

```
Enter your choice (1-6): 5

Enter task ID to delete: 1

✓ Task #1 deleted successfully!
```

#### 6. Exit

```
Enter your choice (1-6): 6

Thank you for using Todo App. Goodbye!
```

## Running Tests

### Run All Tests

```bash
# With UV
uv run pytest

# Or with activated venv
pytest
```

### Run with Coverage

```bash
uv run pytest --cov=src/todo --cov-report=term-missing
```

### Run Specific Test File

```bash
uv run pytest tests/unit/test_storage.py -v
```

### Run Tests Matching Pattern

```bash
uv run pytest -k "add_task" -v
```

## Code Quality

### Run Linter (Ruff)

```bash
uv run ruff check src/ tests/
```

### Fix Linter Issues

```bash
uv run ruff check src/ tests/ --fix
```

### Format Code (Black)

```bash
uv run black src/ tests/
```

### Check Formatting

```bash
uv run black src/ tests/ --check
```

## Project Structure

```
phase-1-console/
├── pyproject.toml       # Project configuration
├── src/
│   └── todo/
│       ├── __init__.py  # Package init
│       ├── __main__.py  # Entry point
│       ├── models.py    # Task dataclass
│       ├── storage.py   # TaskStorage class
│       ├── validators.py # Input validation
│       └── cli.py       # CLI interface
└── tests/
    ├── conftest.py      # Shared fixtures
    ├── unit/
    │   ├── test_models.py
    │   ├── test_storage.py
    │   └── test_validators.py
    └── integration/
        └── test_cli.py
```

## Troubleshooting

### "Python not found"

Ensure Python 3.13+ is installed and in your PATH:
```bash
python3.13 --version
```

### "UV not found"

Install UV following the instructions above, then restart your terminal.

### "Module not found" Error

Ensure you're in the `phase-1-console` directory and virtual environment is activated.

### Tests Failing

1. Check Python version: `python --version`
2. Reinstall dependencies: `uv sync`
3. Run with verbose: `uv run pytest -v`

## Important Notes

- **No Persistence**: All tasks are stored in memory. Exiting the application will clear all tasks.
- **Single User**: This is a single-user application with no authentication.
- **Phase I Only**: Advanced features (priorities, due dates, etc.) are not available in this phase.
