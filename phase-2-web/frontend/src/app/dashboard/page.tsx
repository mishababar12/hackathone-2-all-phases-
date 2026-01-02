"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { removeToken, isAuthenticated, getUser } from "@/lib/auth";
import { fetchTasks, createTask, updateTask, deleteTask, Task } from "@/lib/tasks";
import { TaskItem } from "@/components/TaskItem";
import { TaskModal } from "@/components/TaskModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Plus, LogOut, Loader2, Sparkles, CheckCircle, Home, ListTodo, CheckCheck, AlertCircle, BarChart3, Flag, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{id: number, title: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = tasks.filter(t => !t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Priority breakdown
  const highPriorityTasks = tasks.filter(t => t.priority === "high" && !t.completed).length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === "medium" && !t.completed).length;
  const lowPriorityTasks = tasks.filter(t => t.priority === "low" && !t.completed).length;

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchTasks();
      setTasks(data);
    } catch (err: any) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const user = getUser();
    if (user) {
      setUserName(user.name);
    }

    loadTasks();
  }, [router, loadTasks]);

  const handleAddTask = async (title: string, description?: string, priority?: "low" | "medium" | "high", dueDate?: string) => {
    setIsSubmitting(true);
    try {
      const task = await createTask(title, description, priority, dueDate);
      setTasks((prev) => [task, ...prev]);
      toast.success("Task created successfully!");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
      const updated = await updateTask(taskId, { completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      toast.success(completed ? "Task completed!" : "Task marked as active");
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updated = await updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      toast.success("Task updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
    }
  };

  const handleDeleteClick = (taskId: number, taskTitle: string) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      toast.success("Task deleted");
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden flex">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 lg:static lg:block w-80 bg-white/5 backdrop-blur-xl border-r border-cyan-500/20 flex-shrink-0 overflow-y-auto z-50 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between lg:block">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Todo Evolution
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          {userName && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
              <p className="text-xs text-cyan-200">Logged in as</p>
              <p className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{userName}</p>
            </div>
          )}

          {/* Filter Navigation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
            <button
              onClick={() => setFilter("all")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <ListTodo className="h-5 w-5" />
              <span className="font-medium">All Tasks</span>
              <span className="ml-auto px-2 py-1 rounded-lg bg-white/10 text-xs font-bold">{tasks.length}</span>
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                filter === "active"
                  ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50 text-blue-300 shadow-lg"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Active</span>
              <span className="ml-auto px-2 py-1 rounded-lg bg-white/10 text-xs font-bold">{activeTasks}</span>
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                filter === "completed"
                  ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50 text-green-300 shadow-lg"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <CheckCheck className="h-5 w-5" />
              <span className="font-medium">Completed</span>
              <span className="ml-auto px-2 py-1 rounded-lg bg-white/10 text-xs font-bold">{completedTasks}</span>
            </button>
          </div>

          {/* Progress Chart */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Overall Progress</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Completion Rate</span>
                <span className="font-bold text-purple-300">{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="text-center p-2 rounded-lg bg-green-500/20">
                  <div className="text-lg font-bold text-green-300">{completedTasks}</div>
                  <div className="text-gray-400">Done</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/20">
                  <div className="text-lg font-bold text-blue-300">{activeTasks}</div>
                  <div className="text-gray-400">To Do</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <Link
              href="/progress"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Progress & Analytics</span>
            </Link>
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-cyan-500/20 hover:border-cyan-400/30 transition-all"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-red-500/20 hover:border-red-400/30 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <nav className="relative backdrop-blur-xl bg-white/5 border-b border-cyan-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {filter === "all" ? "All Tasks" : filter === "active" ? "Active Tasks" : "Completed Tasks"}
                </h1>
                <p className="hidden md:block text-sm text-gray-400 mt-1">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30">
              <span className="text-xs md:text-sm font-bold text-cyan-300">{progressPercent}% Complete</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="relative flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {error && (
              <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4 text-red-200 animate-shake">
                <strong>Error:</strong> {error}
              </div>
            )}


            {/* Task List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/5 backdrop-blur-sm border border-cyan-500/20">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
                    <div className="absolute inset-0 h-16 w-16 animate-ping text-cyan-400 opacity-20">
                      <Loader2 className="h-16 w-16" />
                    </div>
                  </div>
                  <p className="mt-6 text-cyan-200 text-lg font-medium">Loading your tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-dashed border-cyan-400/50">
                  <div className="relative mb-6">
                    <Sparkles className="h-20 w-20 text-cyan-400" />
                    <div className="absolute inset-0 h-20 w-20 text-cyan-400 animate-ping opacity-20">
                      <Sparkles className="h-20 w-20" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-3">
                    {filter === "active" ? "No Active Tasks" : filter === "completed" ? "No Completed Tasks" : "No Tasks Yet"}
                  </h3>
                  <p className="text-gray-300 text-lg">
                    {filter === "all" ? "Start your evolution by creating your first task!" : `No ${filter} tasks to display`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {filteredTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TaskItem
                        task={task}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteClick}
                        onUpdate={handleUpdateTask}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Floating Create Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/50 flex items-center justify-center text-white hover:scale-110 hover:shadow-cyan-500/70 transition-all duration-300 hover:rotate-90 z-40"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        taskTitle={taskToDelete?.title || ""}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
