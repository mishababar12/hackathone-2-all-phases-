# Tasks: Phase I - In-Memory Python Console Todo App

**Input**: Design documents from `phase-1-console/specs/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md (available)

**Tests**: Following TDD approach as mandated by Constitution Principle II. Tests written FIRST, must FAIL before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure and configuration

- [x] T001 Create project directory structure per plan.md in phase-1-console/
- [x] T002 Create pyproject.toml with UV configuration in phase-1-console/pyproject.toml
- [x] T003 [P] Create src/todo/__init__.py with package metadata
- [x] T004 [P] Create tests/__init__.py for test package
- [x] T005 [P] Create tests/unit/__init__.py for unit test package
- [x] T006 [P] Create tests/integration/__init__.py for integration test package
- [x] T007 Create tests/conftest.py with shared pytest fixtures
- [x] T008 Run `uv sync` to initialize virtual environment and install dev dependencies

**Checkpoint**: Project structure ready, pytest can run (with no tests yet)

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Build foundational components that ALL user stories depend on

**CRITICAL**: Must complete before any user story implementation

### 2.1 Task Model (Foundation for all stories)

- [ ] T009 [P] Write test_task_creation in tests/unit/test_models.py (RED)
- [ ] T010 [P] Write test_task_defaults in tests/unit/test_models.py (RED)
- [ ] T011 [P] Write test_task_str_representation in tests/unit/test_models.py (RED)
- [ ] T012 Implement Task dataclass in src/todo/models.py (GREEN)
- [ ] T013 Verify all model tests pass, refactor if needed (REFACTOR)

### 2.2 Input Validators (Foundation for all user input)

- [ ] T014 [P] Write test_validate_title_valid in tests/unit/test_validators.py (RED)
- [ ] T015 [P] Write test_validate_title_empty in tests/unit/test_validators.py (RED)
- [ ] T016 [P] Write test_validate_title_too_long in tests/unit/test_validators.py (RED)
- [ ] T017 [P] Write test_validate_task_id_valid in tests/unit/test_validators.py (RED)
- [ ] T018 [P] Write test_validate_task_id_invalid in tests/unit/test_validators.py (RED)
- [ ] T019 [P] Write test_validate_task_id_negative in tests/unit/test_validators.py (RED)
- [ ] T020 [P] Write test_validate_description in tests/unit/test_validators.py (RED)
- [ ] T021 Implement validate_title() in src/todo/validators.py (GREEN)
- [ ] T022 Implement validate_task_id() in src/todo/validators.py (GREEN)
- [ ] T023 Implement validate_description() in src/todo/validators.py (GREEN)
- [ ] T024 Verify all validator tests pass, refactor if needed (REFACTOR)

### 2.3 Storage Layer (Foundation for CRUD operations)

- [ ] T025 [P] Write test_storage_init in tests/unit/test_storage.py (RED)
- [ ] T026 Implement TaskStorage.__init__() in src/todo/storage.py (GREEN)

**Checkpoint**: Foundation complete - Task model, validators, and storage initialized. All foundational tests passing.

---

## Phase 3: User Story 1 - Add New Task (Priority: P1) 🎯 MVP

**Goal**: Users can add tasks with title and optional description

**Independent Test**: Run app → Add task with title "Test" → Verify task created with ID 1

### Tests for User Story 1 (TDD - RED Phase)

- [ ] T027 [P] [US1] Write test_add_task_with_title_and_description in tests/unit/test_storage.py
- [ ] T028 [P] [US1] Write test_add_task_title_only in tests/unit/test_storage.py
- [ ] T029 [P] [US1] Write test_add_task_increments_id in tests/unit/test_storage.py
- [ ] T030 [P] [US1] Write test_add_task_sets_created_at in tests/unit/test_storage.py

### Implementation for User Story 1 (TDD - GREEN Phase)

- [ ] T031 [US1] Implement TaskStorage.add_task() in src/todo/storage.py
- [ ] T032 [US1] Verify all US1 storage tests pass (GREEN)

### CLI for User Story 1

- [ ] T033 [US1] Write test_cli_add_task_success in tests/integration/test_cli.py (RED)
- [ ] T034 [US1] Write test_cli_add_task_empty_title_error in tests/integration/test_cli.py (RED)
- [ ] T035 [US1] Create TodoCLI class skeleton in src/todo/cli.py
- [ ] T036 [US1] Implement TodoCLI.add_task() method in src/todo/cli.py (GREEN)
- [ ] T037 [US1] Implement menu display and option 1 handling in src/todo/cli.py
- [ ] T038 [US1] Verify all US1 CLI tests pass, refactor if needed (REFACTOR)

**Checkpoint**: User Story 1 complete. Users can add tasks via CLI. MVP functional!

---

## Phase 4: User Story 2 - View All Tasks (Priority: P2)

**Goal**: Users can see all their tasks with status indicators

**Independent Test**: Add 2 tasks → View all → See both tasks with [ ] status

### Tests for User Story 2 (TDD - RED Phase)

- [ ] T039 [P] [US2] Write test_get_all_tasks_empty in tests/unit/test_storage.py
- [ ] T040 [P] [US2] Write test_get_all_tasks_multiple in tests/unit/test_storage.py
- [ ] T041 [P] [US2] Write test_get_all_tasks_sorted_by_id in tests/unit/test_storage.py

### Implementation for User Story 2 (TDD - GREEN Phase)

- [ ] T042 [US2] Implement TaskStorage.get_all_tasks() in src/todo/storage.py
- [ ] T043 [US2] Verify all US2 storage tests pass (GREEN)

### CLI for User Story 2

- [ ] T044 [US2] Write test_cli_view_tasks_empty in tests/integration/test_cli.py (RED)
- [ ] T045 [US2] Write test_cli_view_tasks_with_items in tests/integration/test_cli.py (RED)
- [ ] T046 [US2] Implement TodoCLI.view_tasks() method in src/todo/cli.py (GREEN)
- [ ] T047 [US2] Implement menu option 2 handling in src/todo/cli.py
- [ ] T048 [US2] Verify all US2 CLI tests pass, refactor if needed (REFACTOR)

**Checkpoint**: User Story 2 complete. Users can view all tasks with status indicators.

---

## Phase 5: User Story 3 - Mark Task Complete/Incomplete (Priority: P3)

**Goal**: Users can toggle task completion status by ID

**Independent Test**: Add task → Mark complete → See [X] status → Mark incomplete → See [ ] status

### Tests for User Story 3 (TDD - RED Phase)

- [ ] T049 [P] [US3] Write test_toggle_complete_incomplete_to_complete in tests/unit/test_storage.py
- [ ] T050 [P] [US3] Write test_toggle_complete_complete_to_incomplete in tests/unit/test_storage.py
- [ ] T051 [P] [US3] Write test_toggle_complete_not_found in tests/unit/test_storage.py

### Implementation for User Story 3 (TDD - GREEN Phase)

- [ ] T052 [US3] Implement TaskStorage.get_task() helper in src/todo/storage.py
- [ ] T053 [US3] Implement TaskStorage.toggle_complete() in src/todo/storage.py
- [ ] T054 [US3] Verify all US3 storage tests pass (GREEN)

### CLI for User Story 3

- [ ] T055 [US3] Write test_cli_toggle_complete_success in tests/integration/test_cli.py (RED)
- [ ] T056 [US3] Write test_cli_toggle_complete_not_found in tests/integration/test_cli.py (RED)
- [ ] T057 [US3] Write test_cli_toggle_complete_invalid_id in tests/integration/test_cli.py (RED)
- [ ] T058 [US3] Implement TodoCLI.toggle_complete() method in src/todo/cli.py (GREEN)
- [ ] T059 [US3] Implement menu option 3 handling in src/todo/cli.py
- [ ] T060 [US3] Verify all US3 CLI tests pass, refactor if needed (REFACTOR)

**Checkpoint**: User Story 3 complete. Users can toggle task completion status.

---

## Phase 6: User Story 4 - Update Task Details (Priority: P4)

**Goal**: Users can modify task title and/or description

**Independent Test**: Add task → Update title → View → See new title

### Tests for User Story 4 (TDD - RED Phase)

- [ ] T061 [P] [US4] Write test_update_task_title_only in tests/unit/test_storage.py
- [ ] T062 [P] [US4] Write test_update_task_description_only in tests/unit/test_storage.py
- [ ] T063 [P] [US4] Write test_update_task_both_fields in tests/unit/test_storage.py
- [ ] T064 [P] [US4] Write test_update_task_not_found in tests/unit/test_storage.py

### Implementation for User Story 4 (TDD - GREEN Phase)

- [ ] T065 [US4] Implement TaskStorage.update_task() in src/todo/storage.py
- [ ] T066 [US4] Verify all US4 storage tests pass (GREEN)

### CLI for User Story 4

- [ ] T067 [US4] Write test_cli_update_task_success in tests/integration/test_cli.py (RED)
- [ ] T068 [US4] Write test_cli_update_task_not_found in tests/integration/test_cli.py (RED)
- [ ] T069 [US4] Write test_cli_update_task_empty_title_error in tests/integration/test_cli.py (RED)
- [ ] T070 [US4] Implement TodoCLI.update_task() method in src/todo/cli.py (GREEN)
- [ ] T071 [US4] Implement menu option 4 handling in src/todo/cli.py
- [ ] T072 [US4] Verify all US4 CLI tests pass, refactor if needed (REFACTOR)

**Checkpoint**: User Story 4 complete. Users can update task details.

---

## Phase 7: User Story 5 - Delete Task (Priority: P5)

**Goal**: Users can remove tasks from the list

**Independent Test**: Add task → Delete by ID → View → Task not in list

### Tests for User Story 5 (TDD - RED Phase)

- [ ] T073 [P] [US5] Write test_delete_task_success in tests/unit/test_storage.py
- [ ] T074 [P] [US5] Write test_delete_task_not_found in tests/unit/test_storage.py
- [ ] T075 [P] [US5] Write test_delete_task_preserves_other_tasks in tests/unit/test_storage.py

### Implementation for User Story 5 (TDD - GREEN Phase)

- [ ] T076 [US5] Implement TaskStorage.delete_task() in src/todo/storage.py
- [ ] T077 [US5] Verify all US5 storage tests pass (GREEN)

### CLI for User Story 5

- [ ] T078 [US5] Write test_cli_delete_task_success in tests/integration/test_cli.py (RED)
- [ ] T079 [US5] Write test_cli_delete_task_not_found in tests/integration/test_cli.py (RED)
- [ ] T080 [US5] Implement TodoCLI.delete_task() method in src/todo/cli.py (GREEN)
- [ ] T081 [US5] Implement menu option 5 handling in src/todo/cli.py
- [ ] T082 [US5] Verify all US5 CLI tests pass, refactor if needed (REFACTOR)

**Checkpoint**: User Story 5 complete. Users can delete tasks.

---

## Phase 8: Application Integration & Polish

**Purpose**: Complete application loop and cross-cutting concerns

### Main Application Loop

- [ ] T083 Write test_cli_main_loop_exit in tests/integration/test_cli.py (RED)
- [ ] T084 Write test_cli_invalid_menu_choice in tests/integration/test_cli.py (RED)
- [ ] T085 Implement TodoCLI.run() main loop in src/todo/cli.py (GREEN)
- [ ] T086 Implement menu option 6 (Exit) handling in src/todo/cli.py
- [ ] T087 Create src/todo/__main__.py entry point for `python -m todo`
- [ ] T088 Add main() function to src/todo/cli.py for script entry

### End-to-End Integration Tests

- [ ] T089 Write test_full_workflow_add_view_complete_delete in tests/integration/test_cli.py
- [ ] T090 Write test_multiple_tasks_workflow in tests/integration/test_cli.py
- [ ] T091 Verify all integration tests pass

### Quality & Documentation

- [ ] T092 [P] Run ruff linter and fix any issues
- [ ] T093 [P] Run black formatter on all source files
- [ ] T094 [P] Verify test coverage >= 80% with pytest-cov
- [ ] T095 [P] Add docstrings to all public functions/classes
- [ ] T096 Update phase-1-console/README.md with final status

**Checkpoint**: Application complete! All features working, tests passing, quality gates met.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─── BLOCKS ALL USER STORIES
    │
    ├──────────────────────────────────────────────┐
    │                                              │
    ▼                                              ▼
Phase 3 (US1: Add) ──► Phase 4 (US2: View) ──► Phase 5 (US3: Complete)
                                                   │
                                                   ▼
                           Phase 6 (US4: Update) ──► Phase 7 (US5: Delete)
                                                           │
                                                           ▼
                                                   Phase 8 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|----------------------|
| US1 (Add) | Phase 2 Foundation | None (first story) |
| US2 (View) | US1 (needs tasks to view) | None |
| US3 (Complete) | US2 (needs to see results) | None |
| US4 (Update) | US3 (shares get_task helper) | None |
| US5 (Delete) | US4 (final CRUD operation) | None |

### Within Each Phase: TDD Cycle

1. **RED**: Write all tests marked [P] in parallel (they're independent)
2. **GREEN**: Implement code to pass tests (sequential)
3. **REFACTOR**: Clean up while keeping tests green

---

## Parallel Execution Examples

### Phase 2 Parallel Tests (Foundation)

```bash
# Launch all model tests in parallel:
pytest tests/unit/test_models.py -v

# Launch all validator tests in parallel:
pytest tests/unit/test_validators.py -v
```

### User Story 1 Parallel Tests

```bash
# All these tests can be written simultaneously:
- test_add_task_with_title_and_description
- test_add_task_title_only
- test_add_task_increments_id
- test_add_task_sets_created_at
```

### Quality Checks (Parallel)

```bash
# These can all run in parallel:
uv run ruff check src/ tests/
uv run black src/ tests/ --check
uv run pytest --cov=src/todo --cov-fail-under=80
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Add Task)
4. Complete Phase 4: User Story 2 (View Tasks)
5. **STOP and DEMO**: Basic todo app is functional!

### Incremental Delivery

| Checkpoint | Features | Demo Value |
|------------|----------|------------|
| After US1 | Add tasks | Can create tasks |
| After US2 | Add + View | Can see what was added |
| After US3 | Add + View + Complete | Track progress |
| After US4 | + Update | Fix mistakes |
| After US5 | + Delete | Full CRUD |
| After Phase 8 | Polish | Production-ready |

### TDD Commands

```bash
# Run specific test file
uv run pytest tests/unit/test_models.py -v

# Run with coverage
uv run pytest --cov=src/todo --cov-report=term-missing

# Run only failing tests
uv run pytest --lf

# Run tests matching pattern
uv run pytest -k "add_task" -v
```

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 96 |
| **Setup Tasks** | 8 |
| **Foundational Tasks** | 18 |
| **US1 Tasks** | 12 |
| **US2 Tasks** | 10 |
| **US3 Tasks** | 12 |
| **US4 Tasks** | 12 |
| **US5 Tasks** | 10 |
| **Polish Tasks** | 14 |
| **Parallel Opportunities** | 35+ tasks marked [P] |

### Notes

- All tasks follow TDD: Write test (RED) → Implement (GREEN) → Refactor
- [P] tasks can run in parallel within their phase
- Each user story is independently testable after completion
- MVP is achieved after Phase 4 (US1 + US2)
- Constitution compliance: SDD + TDD workflow followed throughout
