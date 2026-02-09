"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, taskTitle, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-red-500/30 rounded-3xl p-8 shadow-2xl shadow-red-500/20 animate-shake">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 border border-white/20 text-gray-400 hover:bg-white/20 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">Delete Task?</h2>
          <p className="text-gray-400 mb-2">Are you sure you want to delete this task?</p>
          <p className="text-cyan-300 font-medium">"{taskTitle}"</p>
          <p className="text-sm text-red-400 mt-4">This action cannot be undone.</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 font-bold text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
