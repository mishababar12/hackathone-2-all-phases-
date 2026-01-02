# Research: Phase I - In-Memory Python Console Todo App

**Date**: 2025-12-29
**Phase**: 0 - Research & Discovery

## Research Summary

Phase I has minimal research requirements due to its simplicity - pure Python with no external dependencies. All technical decisions are straightforward and well-established.

## Technical Decisions

### 1. Python Version: 3.13+

**Decision**: Use Python 3.13 or higher

**Rationale**:
- Constitution mandates Python 3.13+ for Phase I
- Latest stable Python version with best performance
- Full type hint support including `list[T]` and `dict[K, V]` syntax
- Native `dataclass` improvements

**Alternatives Considered**:
- Python 3.11/3.12: Rejected - Constitution specifically requires 3.13+

### 2. Package Manager: UV

**Decision**: Use UV for package management

**Rationale**:
- Constitution mandates UV package manager
- Significantly faster than pip (10-100x)
- Modern replacement for pip, pip-tools, virtualenv
- Simple `uv init` and `uv add` commands

**Alternatives Considered**:
- pip: Rejected - Constitution specifies UV
- poetry: Rejected - Not required, UV is simpler

### 3. Data Structure: Dictionary with Auto-Increment ID

**Decision**: Store tasks in `dict[int, Task]` with separate ID counter

**Rationale**:
- O(1) lookup by ID for get/update/delete operations
- Simple auto-increment counter (`_next_id`)
- Dictionary preserves insertion order in Python 3.7+
- Easy iteration with `.values()` for listing

**Alternatives Considered**:
- `list[Task]`: Rejected - O(n) lookup by ID
- `OrderedDict`: Not needed - regular dict maintains order in modern Python

### 4. Data Model: Python Dataclass

**Decision**: Use `@dataclass` for Task model

**Rationale**:
- Built into Python standard library (no dependencies)
- Automatic `__init__`, `__repr__`, `__eq__`
- Type hints integrated naturally
- `field(default_factory=...)` for mutable defaults

**Alternatives Considered**:
- NamedTuple: Rejected - Immutable, harder to update fields
- Plain class: Rejected - More boilerplate code
- Pydantic: Rejected - External dependency not allowed

### 5. CLI Pattern: Menu-Driven Loop

**Decision**: Interactive menu with numbered options

**Rationale**:
- Most intuitive for console applications
- Clear visual feedback with box-drawing characters
- Easy input validation (single digit)
- Matches user expectations for todo apps

**Alternatives Considered**:
- Command-line arguments (argparse): Rejected - Not interactive enough
- REPL with commands: Rejected - More complex to implement

### 6. Testing Framework: pytest

**Decision**: Use pytest with pytest-cov

**Rationale**:
- Constitution mandates pytest for unit tests
- pytest-cov for coverage reporting
- Simple fixture system with `conftest.py`
- 80% coverage target per constitution

**Alternatives Considered**:
- unittest: Rejected - More verbose, less Pythonic
- nose2: Rejected - pytest is standard

### 7. Input Validation Strategy

**Decision**: Dedicated validators.py module with pure functions

**Rationale**:
- Separation of concerns (validation separate from CLI)
- Easy to unit test validation logic
- Reusable validation functions
- Clear error messages returned with validation results

**Alternatives Considered**:
- Inline validation in CLI: Rejected - Harder to test, code duplication
- Exception-based validation: Rejected - Tuple return clearer for user feedback

## Best Practices Applied

### Python Code Style

1. **Type Hints**: All functions fully typed
2. **Docstrings**: Google-style docstrings for all public functions
3. **Naming**: snake_case for functions/variables, PascalCase for classes
4. **Line Length**: 100 characters (configured in ruff/black)

### Project Structure

1. **src Layout**: `src/todo/` package for proper importing
2. **Tests Parallel**: `tests/unit/` and `tests/integration/` mirror structure
3. **Entry Point**: `__main__.py` enables `python -m todo`

### Testing

1. **Fixtures**: Common setup in `conftest.py`
2. **Naming**: `test_<function>_<scenario>` pattern
3. **Arrange-Act-Assert**: Clear test structure
4. **Edge Cases**: Empty inputs, boundaries, invalid data

## No Unresolved Questions

All technical decisions are clear based on:
- Constitution requirements (Python 3.13+, UV, pytest, pure Python)
- Specification requirements (in-memory, CLI, single-user)
- Python best practices

## Dependencies

### Runtime Dependencies
- None (pure Python standard library)

### Development Dependencies
- pytest >= 8.0.0
- pytest-cov >= 4.1.0
- ruff >= 0.1.0
- black >= 24.0.0

## References

- [Python 3.13 Documentation](https://docs.python.org/3.13/)
- [UV Package Manager](https://github.com/astral-sh/uv)
- [pytest Documentation](https://docs.pytest.org/)
- [Python Dataclasses](https://docs.python.org/3/library/dataclasses.html)
