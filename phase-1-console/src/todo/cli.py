"""Enhanced command-line interface for Todo Console Application."""

from todo.storage import TaskStorage
from todo.validators import (
    validate_title,
    validate_task_id,
    validate_description,
)
from todo.ui import (
    console,
    print_banner,
    print_menu,
    display_tasks_table,
    display_task_detail,
    display_deleted_task,
    display_updated_task,
    display_grouped_tasks,
    print_success,
    print_error,
    print_warning,
    print_info,
    get_input,
    get_confirmation,
    clear_screen,
    print_section_header,
)


class TodoCLI:
    """Enhanced interactive command-line interface for todo application."""

    def __init__(self) -> None:
        """Initialize CLI with fresh storage."""
        self.storage = TaskStorage()
        self.running = True

    def run(self) -> None:
        """Main application loop."""
        clear_screen()
        print_banner()
        print_info("Your tasks are stored in memory. Data will be lost when you exit.\n")

        while self.running:
            print_menu()
            choice = get_input("Enter your choice (1-6)").strip()

            if choice == "1":
                self.add_task()
            elif choice == "2":
                self.view_tasks()
            elif choice == "3":
                self.toggle_complete()
            elif choice == "4":
                self.update_task()
            elif choice == "5":
                self.delete_task()
            elif choice == "6":
                self.quit_app()
            else:
                print_error("Invalid choice. Please enter a number between 1 and 6.")

            if self.running:
                console.print()
                get_input("[dim]Press Enter to continue...[/dim]")
                clear_screen()

    def add_task(self) -> None:
        """Handle add task flow."""
        print_section_header("Add New Task")

        # Title (required)
        while True:
            title = get_input("Task title (required)")
            is_valid, error = validate_title(title)
            if is_valid:
                break
            print_error(error)

        # Description (optional)
        description = get_input("Description (optional, Enter to skip)")
        description = validate_description(description)

        # Create task
        task = self.storage.add_task(title=title, description=description)

        print_success(f"Task #{task.id} created successfully!")
        display_task_detail(task)

    def view_tasks(self) -> None:
        """Display all tasks grouped by status."""
        print_section_header("All Tasks")

        tasks = self.storage.get_all_tasks()
        if not tasks:
            print_warning("No tasks found. Add a task to get started!")
            return

        # Show grouped view (pending first, then completed)
        display_grouped_tasks(tasks)

    def toggle_complete(self) -> None:
        """Handle mark complete/incomplete flow."""
        print_section_header("Mark Task Complete/Incomplete")

        tasks = self.storage.get_all_tasks()
        if not tasks:
            print_warning("No tasks to mark. Add a task first!")
            return

        # Show current tasks
        display_tasks_table(tasks, "Current Tasks", 1, 20)

        # Get task ID with retry
        while True:
            id_str = get_input("Enter task ID to toggle (or 'q' to cancel)")
            if id_str.lower() == "q":
                print_info("Cancelled.")
                return

            task_id, error = validate_task_id(id_str)
            if task_id is None:
                print_error(error)
                continue

            task = self.storage.toggle_complete(task_id)
            if task is None:
                print_error(f"Task #{task_id} not found.")
                continue

            status = "complete" if task.completed else "incomplete"
            print_success(f"Task #{task_id} marked as {status}!")
            display_task_detail(task)
            break

    def update_task(self) -> None:
        """Handle update task flow."""
        print_section_header("Update Task")

        tasks = self.storage.get_all_tasks()
        if not tasks:
            print_warning("No tasks to update. Add a task first!")
            return

        display_tasks_table(tasks, "Current Tasks", 1, 20)

        # Get task ID
        while True:
            id_str = get_input("Enter task ID to update (or 'q' to cancel)")
            if id_str.lower() == "q":
                print_info("Cancelled.")
                return

            task_id, error = validate_task_id(id_str)
            if task_id is None:
                print_error(error)
                continue

            task = self.storage.get_task(task_id)
            if task is None:
                print_error(f"Task #{task_id} not found.")
                continue
            break

        # Show current task
        display_task_detail(task)
        print_info("Leave field empty to keep current value.")

        # Store old values for comparison
        from copy import deepcopy
        old_task = deepcopy(task)

        # Get updates
        new_title = get_input(f"New title [{task.title}]")
        if new_title:
            is_valid, error = validate_title(new_title)
            if not is_valid:
                print_error(error)
                new_title = None
        else:
            new_title = None

        new_desc = get_input(f"New description [{task.description or '(none)'}]")
        new_desc = validate_description(new_desc) if new_desc else None

        # Apply updates
        updated = self.storage.update_task(
            task_id,
            title=new_title,
            description=new_desc,
        )

        print_success(f"Task #{task_id} updated successfully!")
        display_updated_task(old_task, updated)

    def delete_task(self) -> None:
        """Handle delete task flow with confirmation."""
        print_section_header("Delete Task")

        tasks = self.storage.get_all_tasks()
        if not tasks:
            print_warning("No tasks to delete. Add a task first!")
            return

        display_tasks_table(tasks, "Current Tasks", 1, 20)

        # Get task ID
        while True:
            id_str = get_input("Enter task ID to delete (or 'q' to cancel)")
            if id_str.lower() == "q":
                print_info("Cancelled.")
                return

            task_id, error = validate_task_id(id_str)
            if task_id is None:
                print_error(error)
                continue

            task = self.storage.get_task(task_id)
            if task is None:
                print_error(f"Task #{task_id} not found.")
                continue

            # Confirm deletion
            display_task_detail(task)
            if get_confirmation(f"Are you sure you want to delete task #{task_id}?"):
                self.storage.delete_task(task_id)
                print_success(f"Task #{task_id} deleted successfully!")
                display_deleted_task(task)
            else:
                print_info("Deletion cancelled.")
            break

    def quit_app(self) -> None:
        """Quit the application."""
        console.print("\n[bold blue]Goodbye! Thanks for using Todo App.[/bold blue]\n")
        self.running = False


def main() -> None:
    """Entry point for the todo application."""
    cli = TodoCLI()
    try:
        cli.run()
    except KeyboardInterrupt:
        console.print("\n\n[bold blue]Exiting... Goodbye![/bold blue]")


if __name__ == "__main__":
    main()
