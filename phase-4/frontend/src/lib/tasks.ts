import { API_URL, getToken } from "./auth";

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export const fetchTasks = async (): Promise<Task[]> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/api/v1/tasks/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
};

export const createTask = async (
  title: string,
  description?: string,
  priority?: "low" | "medium" | "high",
  due_date?: string
): Promise<Task> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/api/v1/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, priority: priority || "medium", due_date }),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
};

export const updateTask = async (taskId: number, updates: Partial<Task>): Promise<Task> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
};

export const deleteTask = async (taskId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Failed to delete task");
};
