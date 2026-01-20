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
  LayoutDashboard
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
        console.log("Teacher token:", token);

        const res = await fetch("/api/subject-instances/teacher", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("STATUS:", res.status);
        console.log("RESPONSE:", data);

        if (!res.ok) {
          throw new Error(data.error || data.message || "Unauthorized");
        }

        setSubjects(data);
      } catch (err: any) {
        console.error("FETCH ERROR:", err.message);
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

  // Animated counter component
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="bg-card border border-destructive/20 rounded-xl p-8 max-w-md text-center shadow-lg animate-fade-in"
        >
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <FileText className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky with glass effect */}
      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">Virtual Coding Lab</h1>
                <p className="text-xs text-primary-foreground/70">Teacher Portal</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold">CodeLab</h1>
              </div>
            </div>

            {/* Right Actions */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome Section - Staggered fade in */}
        <div
          className="mb-8 sm:mb-10 animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground academic-heading">
              Welcome, Teacher
            </h2>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg ml-0 sm:ml-[52px]">
            Manage your subjects, practicals, and monitor student progress.
          </p>
        </div>

        {/* Stats Cards - Glassmorphism with count animation */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          {/* Total Subjects */}
          <div className="group bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                <AnimatedCounter value={subjects.length} />
              </p>
              <p className="text-sm text-muted-foreground font-medium">Total Subjects</p>
            </div>
          </div>

          {/* Total Practicals */}
          <div className="group bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-accent/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">—</p>
              <p className="text-sm text-muted-foreground font-medium">Total Practicals</p>
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="group bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-accent/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">—</p>
              <p className="text-sm text-muted-foreground font-medium">Enrolled Students</p>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div
          className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-muted/30 border-b border-border">
            <div>
              <h3 className="text-xl font-semibold text-foreground academic-heading">
                Your Subjects
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage subject instances for your classes
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/teacher/add-subject")}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 text-sm shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
          </div>

          {/* Subjects List */}
          <div className="divide-y divide-border">
            {subjects.length === 0 ? (
              <div className="p-10 sm:p-16 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h4 className="text-xl font-medium text-foreground mb-2 academic-heading">No Subjects Yet</h4>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Get started by creating your first subject instance for your class.
                </p>
                <button
                  onClick={() => router.push("/dashboard/teacher/add-subject")}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Create First Subject
                </button>
              </div>
            ) : (
              subjects.map((subj, index) => (
                <div
                  key={subj.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 hover:bg-muted/40 transition-all duration-200"
                  style={{
                    animationDelay: `${300 + index * 50}ms`,
                    animation: mounted ? 'fade-in 0.3s ease-out forwards' : 'none',
                    opacity: mounted ? 1 : 0
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                        {subj.subject_name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                          Semester {subj.semester}
                        </span>
                        {subj.batch && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {subj.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-16 sm:ml-0">
                    <button
                      onClick={() => router.push(`/dashboard/teacher/subjects/${subj.id}`)}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <FileText className="h-4 w-4" />
                      Practicals
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/teacher/subjects/${subj.id}`)}
                      className="inline-flex items-center justify-center w-10 h-10 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
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
      <footer className="border-t border-border mt-auto py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Government College of Engineering, Chandrapur
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Department of Computer Science & Engineering
          </p>
        </div>
      </footer>
    </div>
  );
}
