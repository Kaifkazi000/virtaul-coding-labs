"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentNavbar from "@/components/StudentNavbar";
import {
  ArrowLeft,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileCode
} from "lucide-react";

export default function StudentSubjectPracticalsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectInstanceId = params.subjectId as string;

  const [practicals, setPracticals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [unlockMap, setUnlockMap] = useState<Record<string, boolean>>({});
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedStudent = localStorage.getItem("student_data");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  // Fetch practicals + submission status + unlock status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("student_token");

        if (!token) {
          router.push("/auth/student");
          return;
        }

        // 1. Fetch consolidated practicals (contains unlock & submission status)
        const res = await fetch(
          `/api/practicals/student/${subjectInstanceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch practicals");
        }

        // Data is now an array of practicals with .is_unlocked and .submission
        const sorted = data.sort((a: any, b: any) => a.pr_no - b.pr_no);
        setPracticals(sorted);

        // Update maps for backward compatibility with UI components
        const newSubs: Record<string, any> = {};
        const newUnlock: Record<string, boolean> = {};

        sorted.forEach((pr: any) => {
          newSubs[pr.id] = pr.submission;
          newUnlock[pr.id] = pr.is_unlocked;
        });

        setSubmissions(newSubs);
        setUnlockMap(newUnlock);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectInstanceId, router]);

  const getStatusBadge = (submission: any) => {
    if (!submission) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
          Not submitted
        </span>
      );
    }

    const status = submission.execution_status || "unknown";
    const styles: Record<string, string> = {
      success: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      timeout: "bg-yellow-100 text-yellow-700",
      error: "bg-yellow-100 text-yellow-700",
      unknown: "bg-gray-100 text-gray-700",
    };

    const StatusIcon = status === "success" ? CheckCircle2 : status === "failed" ? XCircle : AlertCircle;

    return (
      <span
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"
          }`}
      >
        <StatusIcon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <StudentNavbar studentName={student?.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation & Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/student")}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-black tracking-tighter">
                Practicals
              </h1>
              <p className="text-lg text-gray-600 mt-2 font-medium">
                Complete your assignments and track your progress.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 hidden sm:block">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Items</span>
              <span className="text-2xl font-black text-black">{practicals.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-8 rounded-[2rem] border border-red-100 flex items-center gap-6">
            <AlertCircle className="w-12 h-12 shrink-0 text-red-400" />
            <div>
              <h3 className="text-xl font-black mb-1">Whoops! Something went wrong</h3>
              <p className="font-medium opacity-80">{error}</p>
            </div>
          </div>
        ) : practicals.length === 0 ? (
          <div className="bg-gray-50 p-16 rounded-[2rem] text-center border-2 border-dashed border-gray-200">
            <FileCode className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-black mb-2">No practicals found</h3>
            <p className="text-gray-500 font-medium">Your teacher hasn't assigned any practicals for this subject yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {practicals.map((pr) => {
              const unlocked = !!unlockMap[pr.id];
              const submission = submissions[pr.id];

              return (
                <div
                  key={pr.id}
                  onClick={() => {
                    if (unlocked) {
                      router.push(`/dashboard/student/practicals/${pr.id}`);
                    }
                  }}
                  className={`group relative overflow-hidden border p-6 rounded-[2rem] transition-all duration-500 ${unlocked
                    ? "bg-gray-50 border-gray-100 cursor-pointer hover:bg-black hover:border-black shadow-sm"
                    : "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80 grayscale"
                    }`}
                >
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${unlocked ? "bg-white text-black group-hover:bg-green-500 group-hover:text-white" : "bg-gray-200 text-gray-500"}`}>
                          PR-{pr.pr_no}
                        </span>
                        {getStatusBadge(submission)}
                      </div>

                      <h3 className={`text-xl font-black tracking-tight transition-colors ${unlocked ? "text-black group-hover:text-white" : "text-gray-500"}`}>
                        {pr.title}
                      </h3>

                      {submission?.submitted_at && (
                        <div className={`flex items-center gap-1.5 mt-2 transition-colors ${unlocked ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400"}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            Submitted on {new Date(submission.submitted_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <div className={`p-3 rounded-2xl transition-all duration-500 ${unlocked ? "bg-white text-black group-hover:bg-gray-800 group-hover:text-white" : "bg-gray-200 text-gray-400"}`}>
                          {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${unlocked ? "text-black group-hover:text-white" : "text-gray-400"}`}>
                          {unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>

                      {unlocked && (
                        <div className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all">
                          <ChevronRight className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtle hover pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors duration-500 pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

