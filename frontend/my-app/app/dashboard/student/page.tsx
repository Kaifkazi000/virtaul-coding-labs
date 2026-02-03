"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentNavbar from "@/components/StudentNavbar";
import {
  BookOpen,
  ChevronRight,
  Clock,
  User as UserIcon,
  Mail,
  Hash,
  Building2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Check auth + load student data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("student_logged_in");
    const storedStudent = localStorage.getItem("student_data");

    if (!isLoggedIn || !storedStudent) {
      router.push("/auth/student");
      return;
    }

    try {
      setStudent(JSON.parse(storedStudent));
    } catch {
      router.push("/auth/student");
    }
  }, [router]);

  // 📚 Fetch subjects (STUDENT API)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("student_token");

        if (!token) {
          throw new Error("Student token missing");
        }

        const res = await fetch(
          "/api/subject-instances/student",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch subjects");
        }

        setSubjects(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-white">
      <StudentNavbar studentName={student.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-black tracking-tighter">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-medium">
            Welcome back, <span className="text-black font-bold">{student.name}</span>. 👋
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Student Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black leading-tight">{student.name}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Student Profile</p>
                </div>
              </div>

              <div className="space-y-4">
                <ProfileItem icon={<Mail className="w-4 h-4" />} label="Email" value={student.email} />
                <ProfileItem icon={<Hash className="w-4 h-4" />} label="PRN" value={student.prn} />
                <ProfileItem icon={<Hash className="w-4 h-4" />} label="Roll No" value={student.roll} />
                <ProfileItem icon={<Building2 className="w-4 h-4" />} label="Department" value={student.department} />
                <ProfileItem icon={<Clock className="w-4 h-4" />} label="Semester" value={student.semester} />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-black text-white p-6 rounded-2xl relative overflow-hidden">
                  <div className="relative z-10 text-sm font-bold opacity-80 uppercase tracking-widest">
                    Status
                  </div>
                  <div className="relative z-10 text-2xl font-black mt-1">
                    Active
                  </div>
                  <div className="absolute top-[-20px] right-[-20px] opacity-10">
                    <CheckCircle2 className="w-24 h-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Subjects / Practicals */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-black text-black tracking-tight">Active Subjects</h2>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{subjects.length} Total</span>
            </div>

            {loadingSubjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-gray-50 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 shrink-0" />
                <div>
                  <p className="font-bold">Error loading subjects</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black mb-2">No subjects found</h3>
                <p className="text-gray-500 font-medium">Your teacher hasn't added any subjects for your semester yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onClick={() => router.push(`/dashboard/student/subjects/${subject.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-gray-400">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-sm font-bold text-black">{value}</span>
      </div>
    </div>
  );
}

function SubjectCard({ subject, onClick }: { subject: any, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-gray-50 border border-gray-100 p-8 rounded-[2rem] cursor-pointer hover:bg-black transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
    >
      <div className="relative z-10 flex justify-between items-start">
        <div className="bg-white p-3 rounded-2xl group-hover:bg-gray-800 transition-colors shadow-sm">
          <BookOpen className="w-6 h-6 text-black group-hover:text-white" />
        </div>
        <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-sm group-hover:bg-green-500 group-hover:text-white group-hover:border-transparent transition-all border border-gray-100">
          Sem {subject.semester}
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <h3 className="text-2xl font-black text-black group-hover:text-white transition-colors tracking-tight leading-tight">
          {subject.subject_name}
        </h3>
        <p className="text-sm font-bold text-gray-500 group-hover:text-gray-400 mt-2 tracking-wide uppercase">
          CODE: {subject.subject_code}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-2 group-hover:text-white text-black font-bold text-sm">
        View Practicals <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Decorative background element */}
      <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-black/5 rounded-full group-hover:bg-white/10 transition-colors duration-500" />
    </div>
  );
}

