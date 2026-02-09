import Link from "next/link";
import { Sparkles, CheckCircle, TrendingUp, Zap, Target, CheckSquare, ListTodo, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 -right-48 w-[600px] h-[600px] bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Todo Icons */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 animate-float">
            <CheckSquare className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="absolute top-40 right-32 animate-float animation-delay-2000">
            <ListTodo className="w-20 h-20 text-blue-400" />
          </div>
          <div className="absolute bottom-32 left-1/4 animate-float animation-delay-4000">
            <CheckCircle className="w-28 h-28 text-cyan-400" />
          </div>
          <div className="absolute bottom-20 right-1/4 animate-float">
            <Target className="w-32 h-32 text-blue-400" />
          </div>
          <div className="absolute top-1/2 left-10 animate-float animation-delay-2000">
            <Rocket className="w-20 h-20 text-cyan-400" />
          </div>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af10_1px,transparent_1px),linear-gradient(to_bottom,#1e40af10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Hero Section */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-400/50 shadow-lg shadow-cyan-500/30 animate-pulse">
            <Zap className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">AI-Powered Task Management</span>
          </div>

          {/* Main Heading with Animated Gradient */}
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Todo Evolution
            </span>
          </h1>
          <p className="text-2xl md:text-4xl font-bold text-white">
            Manage Tasks Smarter, Achieve More
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience the future of productivity with our intelligent task management platform.
            Organize, prioritize, and complete your goals effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Link
              href="/signup"
              className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <span className="relative flex items-center justify-center gap-3">
                Get Started Free
                <Target className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
              </span>
            </Link>
            <Link
              href="/login"
              className="group px-10 py-5 rounded-2xl border-2 border-cyan-400 font-bold text-cyan-400 bg-transparent backdrop-blur-sm transition-all hover:bg-cyan-400 hover:text-[#0f172a] hover:shadow-2xl hover:shadow-cyan-400/30 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-3">
                Log In
                <CheckCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-16 border-t border-cyan-500/30">
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">10k+</div>
              <div className="text-sm text-gray-400 mt-2 font-medium">Active Users</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">50k+</div>
              <div className="text-sm text-gray-400 mt-2 font-medium">Tasks Completed</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">99%</div>
              <div className="text-sm text-gray-400 mt-2 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 px-4 bg-[#0a0f1e]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-center text-gray-300 mb-16 text-xl">
            Powerful features to boost your productivity
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-cyan-500/30 shadow-2xl transition-all hover:shadow-cyan-500/30 hover:scale-105 hover:border-cyan-500/60 animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/40 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Smart Organization</h3>
                <p className="text-gray-400 leading-relaxed">
                  Organize your tasks with intelligent categorization and priority management.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-blue-500/30 shadow-2xl transition-all hover:shadow-blue-500/30 hover:scale-105 hover:border-blue-500/60 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Secure & Private</h3>
                <p className="text-gray-400 leading-relaxed">
                  Your data is encrypted and secure. Only you have access to your tasks.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-cyan-500/30 shadow-2xl transition-all hover:shadow-cyan-500/30 hover:scale-105 hover:border-cyan-500/60 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/40 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Track Progress</h3>
                <p className="text-gray-400 leading-relaxed">
                  Monitor your productivity with detailed analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
