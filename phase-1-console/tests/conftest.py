"""Shared pytest fixtures for Todo Console Application tests."""

import pytest
from io import StringIO
import sys


@pytest.fixture
def storage():
    """Provide a fresh TaskStorage instance for each test."""
    from todo.storage import TaskStorage
    return TaskStorage()


@pytest.fixture
def sample_task(storage):
    """Create a sample task and return it along with storage."""
    task = storage.add_task("Sample Task", "Sample description")
    return task, storage


@pytest.fixture
def multiple_tasks(storage):
    """Create multiple tasks for list testing."""
    tasks = [
        storage.add_task("Task 1", "Description 1"),
        storage.add_task("Task 2", "Description 2"),
        storage.add_task("Task 3", "Description 3"),
    ]
    return tasks, storage


@pytest.fixture
def capture_stdout():
    """Capture stdout for testing print output."""
    captured = StringIO()
    old_stdout = sys.stdout
    sys.stdout = captured
    yield captured
    sys.stdout = old_stdout


@pytest.fixture
def mock_input(monkeypatch):
    """Create a mock for user input."""
    inputs = []

    def set_inputs(input_list):
        nonlocal inputs
        inputs = iter(input_list)

    def mock_input_func(prompt=""):
        return next(inputs)

    monkeypatch.setattr("builtins.input", mock_input_func)
    return set_inputs
