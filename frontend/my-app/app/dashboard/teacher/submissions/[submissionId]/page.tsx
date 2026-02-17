"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  Code,
  Cpu,
  User,
  Activity,
  AlertTriangle,
  Copy,
  ArrowRightLeft,
  X
} from "lucide-react";

export default function TeacherSubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<{
    submission: any;
    student: any;
    practical: any;
  } | null>(null);

  // Comparison State
  const [isComparing, setIsComparing] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
          router.push("/auth/teacher");
          return;
        }

        const res = await fetch(
          `/api/teacher-dashboard/submission/${submissionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load submission");
        }

        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId, router]);

  const handleStartComparison = async () => {
    if (!data?.submission?.matching_submission_id) return;

    setIsComparing(true);
    setLoadingMatch(true);
    try {
      const token = localStorage.getItem("teacher_token");
      const res = await fetch(
        `/api/teacher-dashboard/submission/${data.submission.matching_submission_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (res.ok) {
        setMatchData(json);
      } else {
        setError("Failed to load matching submission");
      }
    } catch (err) {
      setError("Error connecting to server for comparison");
    } finally {
      setLoadingMatch(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Loading Submission...</p>
      </div>
    </div>
  );

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl border border-red-100 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">{error || "Failed to load submission"}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const { submission, student, practical } = data;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Students
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SUBMISSION_ID:</span>
            <span className="text-xs font-bold text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">{submission.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-black tracking-tighter uppercase">
                PR-{practical.pr_no}
              </span>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                {practical.title}
              </h1>
            </div>
            <p className="text-lg text-gray-500 font-medium">{student.name}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 ${submission.execution_status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">{submission.execution_status}</span>
            </div>
          </div>
        </div>

        {/* AI Logic Analysis Card (Full Width in Details Mode) */}
        {!isComparing && (
          <div className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row justify-between items-center gap-10 ${submission.flagged ? 'bg-red-50 border-red-500' : 'bg-white border-gray-100'}`}>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                {submission.flagged ? <ShieldAlert className="w-8 h-8 text-red-500" /> : <CheckCircle2 className="w-8 h-8 text-green-500" />}
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">AI Logic integrity</h3>
                  <h2 className={`text-2xl font-black tracking-tight ${submission.flagged ? 'text-red-600' : 'text-gray-900'}`}>
                    {submission.flagged ? 'Structural Match Detected' : 'No Logic Issues Found'}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                Our Logic Engine analyzed this submission against all other students in <b>{practical.subject_instance_id ? 'this subject instance' : 'this practical'}</b>.
                {submission.flagged
                  ? " The code exhibits a high degree of logical overlap with another submission."
                  : " The student's logical flow appears sufficiently original."}
              </p>
            </div>

            <div className="flex items-center gap-10 bg-white/50 p-6 rounded-3xl border border-white">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Similarity</p>
                <div className={`text-5xl font-black tracking-tighter ${submission.flagged ? 'text-red-600' : 'text-gray-900'}`}>
                  {submission.similarity_score}%
                </div>
              </div>
              {submission.flagged && submission.matching_submission_id && (
                <button
                  onClick={handleStartComparison}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-black/20"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Compare Side-by-Side
                </button>
              )}
            </div>
          </div>
        )}

        {isComparing ? (
          /* SIDE-BY-SIDE VIEW */
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-black text-white p-6 rounded-[2rem]">
              <div className="flex items-center gap-4">
                <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-black tracking-tight uppercase tracking-widest text-sm">Comparison Mode: Logic Similarity {submission.similarity_score}%</h2>
              </div>
              <button onClick={() => setIsComparing(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CURRENT SUBMISSION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Current: {student.name}</h3>
                  <span className="text-[10px] font-medium text-gray-400">Semester {student.semester}</span>
                </div>
                <CodeBlock code={submission.code} language={submission.language} title="Student Code" />
              </div>

              {/* MATCHING SUBMISSION */}
              <div className="space-y-4">
                {loadingMatch ? (
                  <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-[2rem] border-2 border-dashed border-gray-300">
                    <p className="text-gray-400 animate-pulse font-black uppercase tracking-widest text-xs">Fetching Match...</p>
                  </div>
                ) : matchData ? (
                  <>
                    <div className="flex justify-between items-center px-4">
                      <h3 className="font-black text-red-600 uppercase tracking-widest text-[10px]">Match: {matchData.student.name}</h3>
                      <span className="text-[10px] font-medium text-gray-400">Semester {matchData.student.semester}</span>
                    </div>
                    <CodeBlock code={matchData.submission.code} language={matchData.submission.language} title="Conflicting Code" highlightRed />
                  </>
                ) : (
                  <div className="h-[500px] flex items-center justify-center bg-red-50 rounded-[2rem] border-2 border-red-100">
                    <p className="text-red-400 font-bold">Failed to load matching submission.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR DETAIL VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Student Info */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Student Profile
                </h3>
                <div className="space-y-4">
                  <InfoItem label="Roll Number" value={student.roll} />
                  <InfoItem label="PRN Number" value={student.prn} />
                  <InfoItem label="Email" value={student.email} />
                  <InfoItem label="Submission Date" value={new Date(submission.submitted_at).toLocaleDateString()} />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Metrics
                </h3>
                <div className="space-y-4">
                  <InfoItem label="Execution Time" value={`${submission.execution_time_ms || 0} ms`} />
                  <InfoItem label="Memory Used" value={`${submission.memory_used_kb || 0} KB`} />
                  <InfoItem label="Language" value={submission.language} />
                </div>
              </div>
            </div>

            {/* RIGHT: Code and Output */}
            <div className="lg:col-span-8 space-y-8">
              <CodeBlock code={submission.code} language={submission.language} title="Submitted Code" />

              <div className="space-y-4">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2">
                  <Cpu className="w-3 h-3" /> Execution Console
                </h2>
                <div className="bg-black rounded-3xl p-8 font-mono text-sm shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />
                  {submission.execution_error ? (
                    <pre className="text-red-400 whitespace-pre-wrap relative z-10">{submission.execution_error}</pre>
                  ) : (
                    <pre className="text-green-400 whitespace-pre-wrap relative z-10">{submission.execution_output || 'Process finished (exit code 0)'}</pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-xs font-bold text-gray-300 uppercase tracking-tight">{label}</span>
      <span className="text-sm font-black text-gray-900">{value}</span>
    </div>
  );
}

function CodeBlock({ code, language, title, highlightRed = false }: any) {
  return (
    <div className={`bg-[#0D1117] rounded-[2rem] overflow-hidden shadow-2xl border ${highlightRed ? 'border-red-900/50 ring-1 ring-red-500/20' : 'border-gray-800'}`}>
      <div className={`px-8 py-4 flex justify-between items-center border-b ${highlightRed ? 'bg-red-900/20 border-red-900/50' : 'bg-[#161B22] border-gray-800'}`}>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="h-4 w-[1px] bg-gray-700 mx-2" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Code className="w-3 h-3" /> {title}
          </span>
        </div>
        <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
          {language}
        </button>
      </div>
      <div className="p-8 max-h-[600px] overflow-auto custom-scrollbar">
        <pre className="text-sm font-mono leading-relaxed text-blue-100/90 whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}
