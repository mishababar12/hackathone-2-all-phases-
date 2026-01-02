"use client";

import { Task } from "@/lib/tasks";
import { Trash2, CheckCircle2, Circle, Calendar, Clock, Sparkles, AlertCircle, Flag, Edit2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number, completed: boolean) => void;
  onDelete: (taskId: number, taskTitle: string) => void;
  onUpdate?: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority);

  const timeAgo = formatDistanceToNow(new Date(task.created_at), { addSuffix: true });

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "text-red-400 bg-red-500/20 border-red-400/30";
      case "medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-400/30";
      case "low": return "text-green-400 bg-green-500/20 border-green-400/30";
      default: return "text-purple-400 bg-purple-500/20 border-purple-400/30";
    }
  };

  const handleUpdate = () => {
    if (onUpdate && editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
      });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] backdrop-blur-xl border border-cyan-400/50 p-6 shadow-2xl shadow-cyan-500/20">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            placeholder="Description"
            rows={2}
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as "low" | "medium" | "high")}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="low" className="bg-gray-900">Low Priority</option>
            <option value="medium" className="bg-gray-900">Medium Priority</option>
            <option value="high" className="bg-gray-900">High Priority</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] backdrop-blur-xl border border-cyan-500/30 p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/50">
      {/* Animated Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-blue-600/5 to-cyan-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Status Indicator Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${
        task.completed
          ? "bg-gradient-to-b from-green-400 to-emerald-500 shadow-lg shadow-green-500/50"
          : "bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50"
      }`}></div>

      {/* Glow Effect - Top Right */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl transition-all duration-500 ${
        task.completed
          ? "bg-green-500/20 group-hover:bg-green-500/30"
          : "bg-cyan-500/20 group-hover:bg-cyan-500/30"
      }`}></div>

      <div className="relative flex items-start justify-between gap-4">
        {/* Task Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-4">
            <button
              onClick={() => onToggle(task.id, !task.completed)}
              className={`relative flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95 rounded-xl border p-2.5 ${
                task.completed
                  ? "bg-green-500/20 text-green-300 border-green-400/40 hover:bg-green-500/30 shadow-lg shadow-green-500/20"
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/20"
              }`}
            >
              {task.completed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>

            <div className={`flex-1 transition-all duration-300 ${
              task.completed ? "opacity-60" : ""
            }`}>
              <h3 className={`text-lg font-bold transition-all duration-300 ${
                task.completed
                  ? "line-through text-green-300"
                  : "text-white"
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 transition-all duration-300 ${
                  task.completed ? "text-purple-300" : "text-purple-200"
                }`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Priority Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${getPriorityColor(task.priority)}`}>
              <Flag className="h-3.5 w-3.5" />
              <span className="capitalize">{task.priority}</span>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(task.created_at).toLocaleDateString()}</span>
            </div>

            {/* Due Date if exists */}
            {task.due_date && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-300 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Due: {format(new Date(task.due_date), 'MMM d, h:mm a')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Only show edit button if task is not completed */}
          {!task.completed && (
            <button
              onClick={() => setIsEditing(true)}
              className="group/btn relative flex-shrink-0 rounded-xl bg-blue-500/20 border border-blue-400/30 p-2.5 text-blue-300 transition-all duration-300 hover:bg-blue-500/30 hover:border-blue-400/50 hover:scale-110 active:scale-95 shadow-lg hover:shadow-blue-500/20"
            >
              <Edit2 className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id, task.title)}
            className="group/btn relative flex-shrink-0 rounded-xl bg-red-500/20 border border-red-400/30 p-2.5 text-red-300 transition-all duration-300 hover:bg-red-500/30 hover:border-red-400/50 hover:scale-110 active:scale-95 shadow-lg hover:shadow-red-500/20"
          >
            <Trash2 className="h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-12" />
          </button>
        </div>
      </div>
    </div>
  );
}
