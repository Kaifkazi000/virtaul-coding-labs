"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  FileText,
  LogOut,
  GraduationCap,
  ChevronRight,
  Loader2,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Settings,
  Lock,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function TeacherDashboard() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("teacher_data");
    if (data) {
      try {
        setTeacherData(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse teacher data", e);
      }
    }
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
    localStorage.removeItem("teacher_logged_in");
    localStorage.removeItem("teacher_data");
    router.push("/");
  };

  const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!mounted) return;
      let start = 0;
      const end = value;
      if (start === end) {
        setCount(end);
        return;
      }

      const incrementTime = Math.max(duration / (end || 1), 50);
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-fade-in text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full border-4 border-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Accessing Portal</h3>
            <p className="text-slate-400 font-medium text-sm">Validating credentials and syncing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-rose-100 rounded-[2.5rem] p-12 max-w-md text-center shadow-2xl shadow-rose-100/50 animate-fade-in">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 ring-8 ring-rose-50/50">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Session Conflict</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            Return to Gateway
          </button>
        </div>
      </div>
    );
  }

  const uniqueBatches = Array.from(new Set(subjects.map(s => s.batch_name))).filter(Boolean);
  const uniqueSems = Array.from(new Set(subjects.map(s => s.semester)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">CodePortal</h1>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">Institutional Lab Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-4">
                <p className="text-sm font-black text-slate-900">
                  {teacherData?.name ? (teacherData.name.toLowerCase().includes('sir') || teacherData.name.toLowerCase().includes('prof') ? teacherData.name : `Prof. ${teacherData.name}`) : "Faculty"}
                </p>
                <p className="text-[10px] font-bold text-slate-400">Department Faculty</p>
              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all duration-200 border border-transparent hover:border-indigo-100"
                title="Security Settings"
              >
                <Lock className="h-5 w-5" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold hover:bg-rose-100 transition-all border border-rose-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userType="teacher"
      />

      {/* Main Content */}
      <main className="flex-grow max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 sm:py-12 w-full">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100/50">
                <Sparkles className="h-3.5 w-3.5 italic" />
                Faculty Portal
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                Salutations, <span className="text-indigo-600">{teacherData?.name ? (teacherData.name.split(' ')[0]) : "Professor"}</span>!
              </h2>
              <p className="text-slate-500 text-lg font-medium max-w-2xl">
                Ready to mentor? Your technical workspace is synchronized with the latest HOD allotments.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="pr-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                <p className="text-sm font-bold text-slate-900 mt-1">Teaching Load Balanced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            label="Total Subjects"
            value={subjects.length}
            color="bg-indigo-500"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Active Batches"
            value={uniqueBatches.length}
            color="bg-emerald-500"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Curriculum Years"
            value={uniqueSems.length}
            color="bg-amber-500"
          />
          <div
            onClick={() => setShowPasswordModal(true)}
            className="group bg-slate-900 rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 cursor-pointer border border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/20">
                <Lock className="h-6 w-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-8">
              <p className="text-white font-black text-xl tracking-tight">Security Center</p>
              <p className="text-slate-400 text-xs font-bold mt-1">Manage your credentials</p>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 sm:p-10 border-b border-slate-50">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Teaching Portfolio</h3>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">
                Allotted Subjects & Practical Laboratories
              </p>
            </div>

            <div className="px-5 py-2.5 bg-slate-50 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest">
              Academic Session 2024-25
            </div>
          </div>

          {/* Subjects List */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.length === 0 ? (
              <div className="col-span-full py-24 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-slate-50/50">
                  <BookOpen className="h-14 w-14 text-slate-200" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Assignment Pending</h4>
                <p className="text-slate-400 max-w-sm mx-auto font-medium">
                  The Head of Department has not yet allotted any subjects to your portfolio. Please check back later.
                </p>
              </div>
            ) : (
              subjects.map((subj, index) => (
                <div
                  key={subj.id}
                  className="group bg-white border border-slate-100 p-6 sm:p-8 rounded-[2.5rem] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
                          {subj.subject_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 border border-slate-100 rounded-md">
                            SEM {subj.semester}
                          </span>
                          {subj.batch_name && (
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">
                              Batch {subj.batch_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/dashboard/teacher/subjects/${subj.id}`)}
                      className="flex-grow flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                    >
                      Enter Laboratory
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-16 pb-12 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <p className="text-lg font-black text-slate-900 tracking-tighter">CodePortal v3.0</p>
              </div>
              <p className="text-sm font-bold text-slate-500 tracking-tight leading-relaxed max-w-sm">
                Propelling academic excellence through digital laboratory environments at Govt. College of Engineering, Chandrapur.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-2 text-[10px] font-black italic text-slate-400 uppercase tracking-[0.3em]">
              <span>Dept. of Computer Science & Engineering</span>
              <span>Established Excellence</span>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              © {new Date().getFullYear()} GCOEC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="group bg-white rounded-[2rem] p-8 border border-slate-100 hover:border-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">
          {value < 10 && value > 0 ? `0${value}` : value === 0 ? '--' : value}
        </p>
      </div>
    </div>
  );
}
