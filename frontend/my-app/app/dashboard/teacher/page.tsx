"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Users,
  FileText,
  LogOut,
  GraduationCap,
  ChevronRight,
  Loader2,
  LayoutDashboard,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        const res = await fetch("/api/subject-instances/teacher", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || "Unauthorized");
        }

        setSubjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("teacher_token");
    router.push("/");
  };

  const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!mounted) return;
      let start = 0;
      const end = value;
      if (start === end) return;

      const incrementTime = Math.max(duration / end, 50);
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }, [value, duration, mounted]);

    return <span>{count}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-xl shadow-orange-200">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          </div>
          <p className="text-orange-700 font-semibold text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-rose-200 rounded-3xl p-10 max-w-md text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-orange-600 hover:text-orange-700 font-semibold transition-colors underline underline-offset-4"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">Virtual Coding Lab</h1>
                <p className="text-xs text-orange-600 font-medium">Teacher Portal</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold text-gray-800">CodeLab</h1>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 academic-heading">
                  Welcome back!
                </h2>
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg mt-1">
                Manage your subjects, practicals, and track student progress
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {/* Total Subjects */}
          <div className="group relative overflow-hidden bg-white/60 backdrop-blur-xl border border-orange-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">
                  <AnimatedCounter value={subjects.length} />
                </p>
                <p className="text-sm text-gray-500 font-medium">Total Subjects</p>
              </div>
            </div>
          </div>

          {/* Total Practicals */}
          <div className="group relative overflow-hidden bg-white/60 backdrop-blur-xl border border-rose-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">—</p>
                <p className="text-sm text-gray-500 font-medium">Total Practicals</p>
              </div>
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="group relative overflow-hidden bg-white/60 backdrop-blur-xl border border-violet-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-violet-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">—</p>
                <p className="text-sm text-gray-500 font-medium">Enrolled Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white/60 backdrop-blur-xl border border-orange-100 rounded-3xl overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-orange-50/50 to-rose-50/50 border-b border-orange-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-gray-800 academic-heading">Your Subjects</h3>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-gray-500 mt-1">
                Create and manage subject instances for your classes
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/teacher/add-subject")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300"
            >
              <Plus className="h-5 w-5" />
              Add Subject
            </button>
          </div>

          {/* Subjects List */}
          <div className="divide-y divide-orange-100">
            {subjects.length === 0 ? (
              <div className="p-12 sm:p-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-orange-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3 academic-heading">No Subjects Yet</h4>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                  Start your teaching journey by creating your first subject instance
                </p>
                <button
                  onClick={() => router.push("/dashboard/teacher/add-subject")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-200 hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Create First Subject
                </button>
              </div>
            ) : (
              subjects.map((subj, index) => (
                <div
                  key={subj.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-rose-50/50 transition-all duration-200"
                  style={{
                    animationDelay: `${300 + index * 50}ms`,
                    animation: mounted ? 'fade-in 0.3s ease-out forwards' : 'none',
                    opacity: mounted ? 1 : 0
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform duration-200">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xl group-hover:text-orange-600 transition-colors">
                        {subj.subject_name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          Semester {subj.semester}
                        </span>
                        {subj.batch && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
                            {subj.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-18 sm:ml-0">
                    <button
                      onClick={() => router.push(`/dashboard/teacher/subjects/${subj.id}`)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-rose-600 active:scale-[0.98] transition-all duration-200 shadow-md shadow-orange-200"
                    >
                      <FileText className="h-4 w-4" />
                      Practicals
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/teacher/subjects/${subj.id}`)}
                      className="inline-flex items-center justify-center w-11 h-11 bg-white border border-orange-200 rounded-xl text-gray-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 mt-auto py-10 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              Government College of Engineering, Chandrapur
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Department of Computer Science & Engineering
          </p>
        </div>
      </footer>
    </div>
  );
}
