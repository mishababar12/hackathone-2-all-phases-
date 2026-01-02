"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getUser } from "@/lib/auth";
import { fetchTasks, Task } from "@/lib/tasks";
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle, Flag, ArrowLeft, Sparkles } from "lucide-react";

export default function ProgressPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = tasks.filter(t => !t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Priority breakdown
  const highPriority = tasks.filter(t => t.priority === "high");
  const mediumPriority = tasks.filter(t => t.priority === "medium");
  const lowPriority = tasks.filter(t => t.priority === "low");

  const highCompleted = highPriority.filter(t => t.completed).length;
  const mediumCompleted = mediumPriority.filter(t => t.completed).length;
  const lowCompleted = lowPriority.filter(t => t.completed).length;

  const highPercent = highPriority.length > 0 ? Math.round((highCompleted / highPriority.length) * 100) : 0;
  const mediumPercent = mediumPriority.length > 0 ? Math.round((mediumCompleted / mediumPriority.length) * 100) : 0;
  const lowPercent = lowPriority.length > 0 ? Math.round((lowCompleted / lowPriority.length) * 100) : 0;

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-cyan-500/20 hover:border-cyan-400/30 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Progress & Analytics
              </h1>
              <p className="text-gray-400 mt-1">Track your productivity journey</p>
            </div>
          </div>
          {userName && (
            <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
              <span className="text-sm text-cyan-200">Welcome, </span>
              <span className="font-bold text-cyan-300">{userName}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Total Tasks</p>
                    <p className="text-3xl font-bold text-white">{tasks.length}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Active</p>
                    <p className="text-3xl font-bold text-white">{activeTasks}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Completed</p>
                    <p className="text-3xl font-bold text-white">{completedTasks}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Success Rate</p>
                    <p className="text-3xl font-bold text-white">{progressPercent}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Progress Chart */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-cyan-500/30 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BarChart3 className="h-7 w-7 text-cyan-400" />
                Overall Completion Progress
              </h2>

              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300 font-medium">Completion Rate</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{progressPercent}%</span>
                  </div>
                  <div className="relative w-full h-8 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-1000 shadow-lg shadow-cyan-500/50 animate-gradient bg-[length:200%_auto]"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div className="text-center p-6 rounded-2xl bg-green-500/20 border border-green-400/30">
                    <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                    <p className="text-4xl font-bold text-green-300">{completedTasks}</p>
                    <p className="text-sm text-gray-400 mt-2">Tasks Completed</p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                    <AlertCircle className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                    <p className="text-4xl font-bold text-blue-300">{activeTasks}</p>
                    <p className="text-sm text-gray-400 mt-2">Tasks Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown Charts */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* High Priority */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-red-500/30 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Flag className="h-6 w-6 text-red-400" />
                  <h3 className="text-xl font-bold text-white">High Priority</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-red-400">{highPercent}%</p>
                    <p className="text-sm text-gray-400 mt-2">Complete</p>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                      style={{ width: `${highPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Done: {highCompleted}</span>
                    <span className="text-gray-400">Total: {highPriority.length}</span>
                  </div>
                </div>
              </div>

              {/* Medium Priority */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-yellow-500/30 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Flag className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Medium Priority</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-yellow-400">{mediumPercent}%</p>
                    <p className="text-sm text-gray-400 mt-2">Complete</p>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-1000"
                      style={{ width: `${mediumPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Done: {mediumCompleted}</span>
                    <span className="text-gray-400">Total: {mediumPriority.length}</span>
                  </div>
                </div>
              </div>

              {/* Low Priority */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-green-500/30 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Flag className="h-6 w-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Low Priority</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-green-400">{lowPercent}%</p>
                    <p className="text-sm text-gray-400 mt-2">Complete</p>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${lowPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Done: {lowCompleted}</span>
                    <span className="text-gray-400">Total: {lowPriority.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Timeline - Completed vs Incomplete */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-cyan-500/30 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-cyan-400" />
                Task Distribution
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Completed Chart */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Completed Tasks ({completedTasks})
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">High Priority</span>
                        <span className="font-bold text-red-400">{highCompleted}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                          style={{ width: `${completedTasks > 0 ? (highCompleted / completedTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Medium Priority</span>
                        <span className="font-bold text-yellow-400">{mediumCompleted}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                          style={{ width: `${completedTasks > 0 ? (mediumCompleted / completedTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Low Priority</span>
                        <span className="font-bold text-green-400">{lowCompleted}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${completedTasks > 0 ? (lowCompleted / completedTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incomplete Chart */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Incomplete Tasks ({activeTasks})
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">High Priority</span>
                        <span className="font-bold text-red-400">{highPriority.length - highCompleted}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                          style={{ width: `${activeTasks > 0 ? ((highPriority.length - highCompleted) / activeTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Medium Priority</span>
                        <span className="font-bold text-yellow-400">{mediumPriority.length - mediumCompleted}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                          style={{ width: `${activeTasks > 0 ? ((mediumPriority.length - mediumCompleted) / activeTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Low Priority</span>
                        <span className="font-bold text-green-400">{lowPriority.length - lowCompleted}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${activeTasks > 0 ? ((lowPriority.length - lowCompleted) / activeTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Rating */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-purple-400" />
                Your Performance Rating
              </h2>

              <div className="text-center py-8">
                <div className="inline-block">
                  <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-white/10"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercent / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{progressPercent}%</p>
                      <p className="text-sm text-gray-400 mt-1">Complete</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <p className="text-xl font-bold text-white">
                    {progressPercent >= 80 ? "Outstanding! 🌟" :
                     progressPercent >= 60 ? "Great Progress! 🚀" :
                     progressPercent >= 40 ? "Good Work! 💪" :
                     progressPercent >= 20 ? "Keep Going! 📈" :
                     "Just Getting Started! ✨"}
                  </p>
                  <p className="text-gray-400">
                    {progressPercent >= 80 ? "You're crushing it! Keep up the amazing work!" :
                     progressPercent >= 60 ? "You're making excellent progress on your tasks!" :
                     progressPercent >= 40 ? "You're on the right track. Stay focused!" :
                     progressPercent >= 20 ? "Small steps lead to big achievements!" :
                     "Start completing tasks to see your progress grow!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center pt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
