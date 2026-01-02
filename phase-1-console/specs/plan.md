# Implementation Plan: Phase I - In-Memory Python Console Todo App

**Branch**: `1-phase-1-console` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `phase-1-console/specs/spec.md`

## Summary

Implement a command-line todo application in Python that stores tasks in memory. The application provides 5 Basic Level CRUD operations (Add, Delete, Update, View, Mark Complete) through an interactive menu-driven interface. All code will be generated via Claude Code following Spec-Driven Development and Test-First Development principles as mandated by the project constitution.

## Technical Context

**Language/Version**: Python 3.13+
**Package Manager**: UV (modern Python package manager)
**Primary Dependencies**: None (pure Python standard library only)
**Storage**: In-memory (Python list/dictionary data structures)
**Testing**: pytest with pytest-cov for coverage reporting
**Target Platform**: Cross-platform CLI (Windows, macOS, Linux)
**Project Type**: Single standalone application
**Performance Goals**: All operations < 2 seconds for up to 100 tasks
**Constraints**: No external dependencies; no persistence; single-user
**Scale/Scope**: Single session, ~100 tasks maximum expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Spec-Driven Development** | ✅ PASS | Complete spec exists at `phase-1-console/specs/spec.md` with 17 functional requirements |
| **II. Test-First Development** | ✅ READY | Will follow Red-Green-Refactor; pytest configured; 80%+ coverage target |
| **III. Progressive Architecture** | ✅ PASS | Phase I scope matches constitution: Python 3.13+, UV, in-memory, CLI, pytest |
| **IV. Cloud-Native Patterns** | ⏸️ N/A | Not applicable to Phase I (console app) |
| **V. Security-First** | ✅ PASS | Input validation specified in FR-012 to FR-014; no auth needed for single-user |
| **VI. API Design Patterns** | ⏸️ N/A | No API in Phase I; CLI menu interface instead |
| **VII. Database Design** | ⏸️ N/A | In-memory storage; no database in Phase I |
| **VIII. Monorepo Organization** | ✅ PASS | Using `phase-1-console/` folder structure as defined |
| **IX. AI-Native Workflow** | ✅ PASS | Following SDD cycle: Specify → Plan → Tasks → Implement |
| **X. Quality Standards** | ✅ READY | Will use ruff (linting), black (formatting), type hints |

**Gate Result**: ✅ ALL APPLICABLE GATES PASS

## Project Structure

### Documentation (this feature)

```text
phase-1-console/specs/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (COMPLETE)
├── research.md          # Phase 0 output (COMPLETE)
├── data-model.md        # Phase 1 output (COMPLETE)
├── quickstart.md        # Phase 1 output (COMPLETE)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code Structure

```text
phase-1-console/
├── README.md                # Project overview (COMPLETE)
├── pyproject.toml           # UV/Python project configuration
├── src/
│   └── todo/
│       ├── __init__.py      # Package initialization
│       ├── __main__.py      # Entry point (python -m todo)
│       ├── models.py        # Task dataclass
│       ├── storage.py       # TaskStorage class (in-memory)
│       ├── cli.py           # CLI menu and user interaction
│       └── validators.py    # Input validation functions
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── test_models.py   # Task model tests
│   │   ├── test_storage.py  # TaskStorage tests
│   │   └── test_validators.py # Validation tests
│   └── integration/
│       ├── __init__.py
│       └── test_cli.py      # End-to-end CLI tests
└── history/                 # PHRs for this phase
```

**Structure Decision**: Single project structure selected as this is a standalone console application with no frontend/backend separation. The `src/todo/` package follows Python best practices for importable modules.

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     cli.py                               │ │
│  │  - display_menu()                                        │ │
│  │  - get_user_input()                                      │ │
│  │  - run() - main loop                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Validation Layer                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  validators.py                           │ │
│  │  - validate_title(title) → bool                          │ │
│  │  - validate_task_id(id_str) → int | None                 │ │
│  │  - validate_description(desc) → str                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   storage.py                             │ │
│  │  class TaskStorage:                                      │ │
│  │    - add_task(title, description) → Task                 │ │
│  │    - get_all_tasks() → List[Task]                        │ │
│  │    - get_task(id) → Task | None                          │ │
│  │    - update_task(id, title, desc) → Task | None          │ │
│  │    - delete_task(id) → bool                              │ │
│  │    - toggle_complete(id) → Task | None                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Model Layer                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    models.py                             │ │
│  │  @dataclass                                              │ │
│  │  class Task:                                             │ │
│  │    - id: int                                             │ │
│  │    - title: str                                          │ │
│  │    - description: str                                    │ │
│  │    - completed: bool                                     │ │
│  │    - created_at: datetime                                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → CLI captures menu choice and required data
2. **Validation** → validators.py validates all input before processing
3. **Business Logic** → storage.py executes the operation
4. **Model** → Task dataclass holds task state
5. **Output** → CLI displays result (confirmation or error)

## Module Specifications

### models.py - Task Model

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Task:
    """Represents a single todo task."""
    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)

    def __str__(self) -> str:
        status = "[X]" if self.completed else "[ ]"
        return f"{status} {self.id}. {self.title}"
```

### storage.py - Task Storage

```python
class TaskStorage:
    """In-memory storage for tasks with CRUD operations."""

    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """Create and store a new task. Returns the created task."""

    def get_all_tasks(self) -> list[Task]:
        """Return all tasks sorted by ID ascending."""

    def get_task(self, task_id: int) -> Task | None:
        """Return task by ID or None if not found."""

    def update_task(self, task_id: int, title: str | None = None,
                    description: str | None = None) -> Task | None:
        """Update task fields. Returns updated task or None if not found."""

    def delete_task(self, task_id: int) -> bool:
        """Delete task by ID. Returns True if deleted, False if not found."""

    def toggle_complete(self, task_id: int) -> Task | None:
        """Toggle task completion status. Returns task or None if not found."""
```

### validators.py - Input Validation

```python
def validate_title(title: str) -> tuple[bool, str]:
    """Validate task title. Returns (is_valid, error_message)."""
    # Rules: 1-200 characters, not empty/whitespace only

def validate_task_id(id_str: str) -> tuple[int | None, str]:
    """Validate and parse task ID. Returns (parsed_id, error_message)."""
    # Rules: positive integer, numeric string

def validate_description(description: str) -> str:
    """Sanitize description. Returns cleaned string (0-1000 chars)."""
```

### cli.py - Command Line Interface

```python
class TodoCLI:
    """Interactive command-line interface for todo application."""

    MENU = """
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
    """

    def __init__(self) -> None:
        self.storage = TaskStorage()

    def run(self) -> None:
        """Main application loop."""

    def add_task(self) -> None:
        """Handle add task flow."""

    def view_tasks(self) -> None:
        """Display all tasks."""

    def toggle_complete(self) -> None:
        """Handle mark complete/incomplete flow."""

    def update_task(self) -> None:
        """Handle update task flow."""

    def delete_task(self) -> None:
        """Handle delete task flow."""
```

## Testing Strategy

### Test Categories

| Category | Location | Coverage Target | Focus |
|----------|----------|-----------------|-------|
| Unit Tests | `tests/unit/` | 90%+ | Individual functions, edge cases |
| Integration Tests | `tests/integration/` | 80%+ | CLI workflows, user scenarios |

### Test Files Mapping

| Source File | Test File | Key Test Cases |
|-------------|-----------|----------------|
| `models.py` | `test_models.py` | Task creation, string representation, defaults |
| `storage.py` | `test_storage.py` | CRUD operations, ID management, not-found cases |
| `validators.py` | `test_validators.py` | Valid/invalid inputs, boundary conditions |
| `cli.py` | `test_cli.py` | Menu navigation, user input handling, error display |

### pytest Configuration

```toml
# In pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --cov=src/todo --cov-report=term-missing --cov-fail-under=80"
```

## Development Workflow

### TDD Cycle for Each Feature

1. **Red**: Write failing test for the feature
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

### Implementation Order

Based on dependency analysis and user story priorities:

1. **Models** (no dependencies) - Task dataclass
2. **Validators** (no dependencies) - Input validation
3. **Storage** (depends on Models) - CRUD operations
4. **CLI** (depends on Storage, Validators) - User interface
5. **Integration** - End-to-end testing

## Configuration Files

### pyproject.toml

```toml
[project]
name = "todo-console"
version = "0.1.0"
description = "Phase I: In-Memory Python Console Todo App"
requires-python = ">=3.13"
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
    "ruff>=0.1.0",
    "black>=24.0.0",
]

[project.scripts]
todo = "todo.cli:main"

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.black]
line-length = 100
target-version = ["py313"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=src/todo --cov-report=term-missing --cov-fail-under=80"
```

## Complexity Tracking

> **No violations detected** - This plan follows all applicable constitution principles.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| No external deps | Standard library only | Constitution Phase I: "pure Python with standard library only" |
| Single module structure | `src/todo/` package | Simplest structure for console app |
| In-memory storage | Python dict | Constitution Phase I: "In-memory data structures" |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss on exit | Medium | Clear warning message at startup; documented behavior |
| Input handling edge cases | Low | Comprehensive validation in validators.py |
| Complex menu navigation | Low | Simple numbered menu with clear options |

## Deliverables Checklist

- [ ] `pyproject.toml` - Project configuration
- [ ] `src/todo/__init__.py` - Package init
- [ ] `src/todo/__main__.py` - Entry point
- [ ] `src/todo/models.py` - Task dataclass
- [ ] `src/todo/storage.py` - TaskStorage class
- [ ] `src/todo/validators.py` - Input validation
- [ ] `src/todo/cli.py` - CLI interface
- [ ] `tests/unit/test_models.py` - Model tests
- [ ] `tests/unit/test_storage.py` - Storage tests
- [ ] `tests/unit/test_validators.py` - Validator tests
- [ ] `tests/integration/test_cli.py` - CLI tests
- [ ] All tests passing with 80%+ coverage
- [ ] Linting (ruff) passing
- [ ] Formatting (black) applied

## Next Steps

After this plan is approved:
1. Run `/sp.tasks` to generate detailed task breakdown
2. Run `/sp.implement` to begin TDD implementation
3. Each task will follow Red-Green-Refactor cycle
