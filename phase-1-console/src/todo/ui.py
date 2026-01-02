"""Rich UI components for Todo Console Application."""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, BarColumn, TextColumn
from rich.layout import Layout
from rich.align import Align
from rich import box

from todo.models import Task, Priority, TaskStatus

# Create global console instance
console = Console()

# Color scheme
COLORS = {
    "completed": "green",
    "pending": "red",
    "overdue": "bold red",
    "header": "bold blue",
    "menu": "blue",
    "prompt": "cyan",
    "success": "bold magenta",
    "error": "bold red",
    "warning": "yellow",
    "info": "white",
    "priority_high": "red",
    "priority_medium": "yellow",
    "priority_low": "green",
    "category": "cyan",
    "tag": "magenta",
}


BANNER = r"""
[bold magenta]
 __  ____   __  _____ ___  ____   ___
|  \/  \ \ / / |_   _/ _ \|  _ \ / _ \
| |\/| |\ V /    | || | | | | | | | | |
| |  | | | |     | || |_| | |_| | |_| |
|_|  |_| |_|     |_| \___/|____/ \___/
[/bold magenta]
"""


def print_banner() -> None:
    """Display the ASCII art welcome banner."""
    console.print(BANNER)
    console.print()


def print_menu() -> None:
    """Display the main menu with numbers only."""
    menu_items = [
        ("[bold yellow]1[/bold yellow]", "[green]Add Task[/green]"),
        ("[bold yellow]2[/bold yellow]", "[cyan]View All Tasks[/cyan]"),
        ("[bold yellow]3[/bold yellow]", "[magenta]Mark Complete/Incomplete[/magenta]"),
        ("[bold yellow]4[/bold yellow]", "[blue]Update Task[/blue]"),
        ("[bold yellow]5[/bold yellow]", "[red]Delete Task[/red]"),
        ("[bold yellow]6[/bold yellow]", "[white]Exit[/white]"),
    ]

    table = Table(
        show_header=False,
        box=box.ROUNDED,
        border_style="cyan",
        padding=(0, 2),
    )

    table.add_column("Option", style="yellow", justify="center", width=6)
    table.add_column("Action", justify="left")

    for option, action in menu_items:
        table.add_row(option, action)

    console.print()
    console.print(table)
    console.print()


def get_status_icon(task: Task) -> str:
    """Get colored status icon for a task."""
    if task.completed:
        return "[green][OK][/green]"
    elif task.is_overdue:
        return "[bold red][!!][/bold red]"
    else:
        return "[red][  ][/red]"


def get_priority_badge(priority: Priority) -> str:
    """Get colored priority badge."""
    if priority == Priority.HIGH:
        return "[red]*HIGH[/red]"
    elif priority == Priority.MEDIUM:
        return "[yellow]*MED[/yellow]"
    else:
        return "[green]*LOW[/green]"


def format_task_row(task: Task) -> tuple:
    """Format a task for table display."""
    status_icon = get_status_icon(task)

    # Title with appropriate color
    if task.completed:
        title = f"[dim]{task.title}[/dim]"
    else:
        title = task.title

    # Description (truncate if too long)
    desc = task.description if task.description else "[dim]-[/dim]"
    if len(desc) > 30:
        desc = desc[:27] + "..."

    return (str(task.id), status_icon, title, desc)


def display_tasks_table(tasks: list[Task], title: str = "Tasks", page: int = 1, per_page: int = 10) -> int:
    """Display tasks in a formatted table with pagination.

    Returns:
        Total number of pages.
    """
    if not tasks:
        console.print(Panel("[yellow]No tasks found.[/yellow]", title=title, border_style="yellow"))
        return 0

    total_pages = (len(tasks) + per_page - 1) // per_page
    start_idx = (page - 1) * per_page
    end_idx = min(start_idx + per_page, len(tasks))
    page_tasks = tasks[start_idx:end_idx]

    table = Table(
        title=f"[bold cyan]{title}[/bold cyan]",
        title_justify="left",
        box=box.ROUNDED,
        border_style="magenta",
    )

    table.add_column("ID", style="bold yellow", justify="center", width=5)
    table.add_column("Status", justify="center", width=6)
    table.add_column("Title", style="white")
    table.add_column("Description", style="dim cyan")

    for task in page_tasks:
        table.add_row(*format_task_row(task))

    console.print()
    console.print(table)
    console.print(f"[dim magenta]Showing {start_idx+1}-{end_idx} of {len(tasks)} tasks[/dim magenta]")

    return total_pages


def display_task_detail(task: Task) -> None:
    """Display detailed view of a single task."""
    content = Text()
    content.append(f"ID: ", style="bold yellow")
    content.append(f"{task.id}\n", style="cyan")

    content.append(f"Status: ", style="bold yellow")
    if task.completed:
        content.append("[OK] Completed\n", style="bold green")
    else:
        content.append("[..] Pending\n", style="bold yellow")

    content.append(f"Title: ", style="bold yellow")
    content.append(f"{task.title}\n", style="white")

    content.append(f"Description: ", style="bold yellow")
    content.append(f"{task.description or '(none)'}\n", style="dim")

    content.append(f"Created: ", style="bold yellow")
    content.append(f"{task.formatted_date()}", style="magenta")

    console.print(Panel(content, title=f"[bold cyan]Task #{task.id}[/bold cyan]", border_style="cyan"))


def display_deleted_task(task: Task) -> None:
    """Display info about a deleted task."""
    content = Text()
    content.append("[X] DELETED TASK\n", style="bold red")
    content.append(f"ID: ", style="bold yellow")
    content.append(f"{task.id}\n", style="dim strike")
    content.append(f"Title: ", style="bold yellow")
    content.append(f"{task.title}\n", style="dim strike")
    content.append(f"Description: ", style="bold yellow")
    content.append(f"{task.description or '(none)'}", style="dim strike")

    console.print(Panel(content, title="[bold red][X] Task Deleted[/bold red]", border_style="red"))


def display_updated_task(old_task: Task, new_task: Task) -> None:
    """Display what was updated in a task."""
    content = Text()
    content.append(f"Task #{new_task.id} Updated\n\n", style="bold green")

    # Show title change
    if old_task.title != new_task.title:
        content.append("Title: ", style="bold yellow")
        content.append(f"{old_task.title}", style="dim strike red")
        content.append(" >> ", style="bold white")
        content.append(f"{new_task.title}\n", style="bold green")
    else:
        content.append("Title: ", style="bold yellow")
        content.append(f"{new_task.title} (no change)\n", style="dim")

    # Show description change
    old_desc = old_task.description or "(none)"
    new_desc = new_task.description or "(none)"
    if old_desc != new_desc:
        content.append("Description: ", style="bold yellow")
        content.append(f"{old_desc}", style="dim strike red")
        content.append(" >> ", style="bold white")
        content.append(f"{new_desc}\n", style="bold green")
    else:
        content.append("Description: ", style="bold yellow")
        content.append(f"{new_desc} (no change)\n", style="dim")

    # Show status
    content.append("\nStatus: ", style="bold yellow")
    if new_task.completed:
        content.append("[OK] Completed", style="bold green")
    else:
        content.append("[..] Pending", style="bold yellow")

    console.print(Panel(content, title="[bold blue][~] Update Summary[/bold blue]", border_style="blue"))


def display_statistics(stats: dict) -> None:
    """Display statistics dashboard."""
    # Main stats panel
    main_stats = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    main_stats.add_column("Metric", style="bold")
    main_stats.add_column("Value", justify="right")

    main_stats.add_row("Total Tasks", f"[bold]{stats['total']}[/bold]")
    main_stats.add_row("Completed", f"[green]{stats['completed']}[/green]")
    main_stats.add_row("Pending", f"[yellow]{stats['pending']}[/yellow]")
    main_stats.add_row("Overdue", f"[red]{stats['overdue']}[/red]")

    # Completion rate with progress bar
    rate = stats['completion_rate']
    if rate >= 75:
        rate_color = "green"
    elif rate >= 50:
        rate_color = "yellow"
    else:
        rate_color = "red"

    console.print()
    console.print(Panel(main_stats, title="[bold blue]Statistics Dashboard[/bold blue]", border_style="blue"))

    # Completion rate bar
    console.print(f"\n[bold]Completion Rate:[/bold] [{rate_color}]{rate}%[/{rate_color}]")
    bar_filled = int(rate / 5)
    bar_empty = 20 - bar_filled
    bar = f"[{rate_color}]{'#' * bar_filled}[/{rate_color}][dim]{'-' * bar_empty}[/dim]"
    console.print(f"[{bar}]")

    # Priority breakdown
    if stats['total'] > 0:
        priority_table = Table(title="[bold]By Priority[/bold]", box=box.SIMPLE)
        priority_table.add_column("Priority", style="bold")
        priority_table.add_column("Count", justify="right")
        priority_table.add_row("[red]High[/red]", str(stats['by_priority']['high']))
        priority_table.add_row("[yellow]Medium[/yellow]", str(stats['by_priority']['medium']))
        priority_table.add_row("[green]Low[/green]", str(stats['by_priority']['low']))
        console.print()
        console.print(priority_table)

    # Categories
    if stats['by_category']:
        cat_table = Table(title="[bold]By Category[/bold]", box=box.SIMPLE)
        cat_table.add_column("Category", style="cyan")
        cat_table.add_column("Count", justify="right")
        for cat, count in sorted(stats['by_category'].items(), key=lambda x: -x[1]):
            cat_table.add_row(cat, str(count))
        console.print()
        console.print(cat_table)

    # Tags
    if stats['by_tag']:
        tag_table = Table(title="[bold]By Tag[/bold]", box=box.SIMPLE)
        tag_table.add_column("Tag", style="magenta")
        tag_table.add_column("Count", justify="right")
        for tag, count in sorted(stats['by_tag'].items(), key=lambda x: -x[1])[:10]:
            tag_table.add_row(f"#{tag}", str(count))
        console.print()
        console.print(tag_table)


def print_success(message: str) -> None:
    """Print success message."""
    console.print(f"[bold green][OK] {message}[/bold green]")


def print_error(message: str) -> None:
    """Print error message."""
    console.print(f"[bold red][X] Error: {message}[/bold red]")


def print_warning(message: str) -> None:
    """Print warning message."""
    console.print(f"[yellow][!] {message}[/yellow]")


def print_info(message: str) -> None:
    """Print info message."""
    console.print(f"[dim]{message}[/dim]")


def get_input(prompt: str, default: str = "") -> str:
    """Get input with colored prompt."""
    return Prompt.ask(f"[cyan]{prompt}[/cyan]", default=default)


def get_confirmation(prompt: str, default: bool = False) -> bool:
    """Get yes/no confirmation."""
    return Confirm.ask(f"[yellow]{prompt}[/yellow]", default=default)


def clear_screen() -> None:
    """Clear the console screen."""
    console.clear()


def print_section_header(title: str) -> None:
    """Print a section header."""
    console.print()
    console.print(Panel(f"[bold]{title}[/bold]", border_style="blue", expand=False))


def display_grouped_tasks(tasks: list[Task]) -> None:
    """Display tasks grouped by status in table format."""
    completed = [t for t in tasks if t.completed]
    overdue = [t for t in tasks if t.is_overdue]
    pending = [t for t in tasks if not t.completed and not t.is_overdue]

    # Pending tasks table
    if pending:
        pending_table = Table(
            title="[bold yellow][..] PENDING[/bold yellow]",
            title_justify="left",
            box=box.ROUNDED,
            border_style="yellow",
        )
        pending_table.add_column("ID", style="bold yellow", justify="center", width=5)
        pending_table.add_column("Status", justify="center", width=8)
        pending_table.add_column("Title", style="white")
        pending_table.add_column("Description", style="dim cyan")

        for task in pending:
            desc = task.description if task.description else "-"
            pending_table.add_row(
                str(task.id),
                "[yellow][..][/yellow]",
                task.title,
                desc
            )
        console.print()
        console.print(pending_table)

    # Overdue tasks table
    if overdue:
        overdue_table = Table(
            title="[bold red][!!] OVERDUE[/bold red]",
            title_justify="left",
            box=box.ROUNDED,
            border_style="red",
        )
        overdue_table.add_column("ID", style="bold red", justify="center", width=5)
        overdue_table.add_column("Status", justify="center", width=8)
        overdue_table.add_column("Title", style="red")
        overdue_table.add_column("Due Date", style="bold red")

        for task in overdue:
            overdue_table.add_row(
                str(task.id),
                "[bold red][!!][/bold red]",
                task.title,
                task.formatted_due_date()
            )
        console.print()
        console.print(overdue_table)

    # Completed tasks table
    if completed:
        completed_table = Table(
            title="[bold green][OK] COMPLETED[/bold green]",
            title_justify="left",
            box=box.ROUNDED,
            border_style="green",
        )
        completed_table.add_column("ID", style="dim", justify="center", width=5)
        completed_table.add_column("Status", justify="center", width=8)
        completed_table.add_column("Title", style="dim")
        completed_table.add_column("Description", style="dim")

        for task in completed:
            desc = task.description if task.description else "-"
            completed_table.add_row(
                str(task.id),
                "[green][OK][/green]",
                task.title,
                desc
            )
        console.print()
        console.print(completed_table)

    if not tasks:
        console.print("[dim]No tasks found.[/dim]")
