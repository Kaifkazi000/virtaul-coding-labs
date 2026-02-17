"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentNavbar from "@/components/StudentNavbar";
import {
  ArrowLeft,
  Terminal,
  BookText,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Code2,
  Info,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function StudentPracticalDetailPage() {
  const router = useRouter();
  const { practicalId } = useParams();

  const [practical, setPractical] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [code, setCode] = useState("");
  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedStudent = localStorage.getItem("student_data");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("student_token");
      if (!token) {
        router.push("/auth/student");
        return;
      }

      try {
        // Fetch practical (this already returns master_practical content in my refactored backend)
        const p = await fetch(`/api/practicals/${practicalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pData = await p.json();
        if (!p.ok) throw new Error(pData.error || "Practical not found");

        setPractical(pData);

        // Check if unlocked for student's batch
        // (This would ideally be passed from the list page, but let's re-verify here)
        const uRes = await fetch(`/api/execution/unlock-status/${practicalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const uData = await uRes.json();
        if (!uData.is_unlocked) {
          router.push("/dashboard/student");
          return;
        }

        // Fetch submission
        const s = await fetch(`/api/submissions/student/${practicalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sData = await s.json();

        if (sData.submission) {
          setSubmission(sData.submission);
          setCode(sData.submission.code);
        } else {
          setCode(pData.sample_code || "");
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    load();
  }, [practicalId, router]);

  const handleExecute = async () => {
    setError("");
    setSuccess("");
    setExecuting(true);
    setExecutionResult(null);
    const token = localStorage.getItem("student_token");

    try {
      const res = await fetch("/api/execution/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language: practical.language,
          practical_id: practicalId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Execution failed");
      }

      setExecutionResult(data);
      if (data.execution_status === "success") {
        setSuccess("Code executed successfully! Click 'Submit Code' to save your work.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!executionResult || executionResult.execution_status !== "success") {
      setError("Please execute your code successfully before submitting.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);
    const token = localStorage.getItem("student_token");

    try {
      const res = await fetch("/api/submissions/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language: practical.language,
          practical_id: practicalId,
          execution_status: executionResult.execution_status,
          output: executionResult.output,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccess("Your work has been submitted successfully! ✅");

      // Refresh submission status
      const s = await fetch(`/api/submissions/student/${practicalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sData = await s.json();
      setSubmission(sData.submission || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!practical && !error) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <StudentNavbar studentName={student?.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Practicals
          </button>

          <div className="flex items-center gap-3">
            {submission && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-tight">Status: Submitted</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-full border border-gray-100 shadow-sm">
              <Code2 className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-tight">{practical?.language}</span>
            </div>
          </div>
        </div>

        {error && !practical ? (
          <div className="bg-red-50 text-red-700 p-8 rounded-[2rem] border border-red-100 flex items-center gap-6">
            <AlertCircle className="w-12 h-12 shrink-0 text-red-400" />
            <div>
              <h3 className="text-xl font-black mb-1">Error Loading Practical</h3>
              <p className="font-medium opacity-80">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT SIDE – PRACTICAL INFO */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Sparkles className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                    PR-{practical.pr_no}
                  </span>

                  <h1 className="text-4xl font-black text-black tracking-tighter leading-tight mb-8">
                    {practical.title}
                  </h1>

                  <div className="space-y-8">
                    {practical.description && (
                      <section>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4 text-gray-300" /> Objectives
                        </h2>
                        <p className="text-[15px] font-bold text-gray-700 leading-relaxed">{practical.description}</p>
                      </section>
                    )}

                    {practical.task && (
                      <section>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-gray-300" /> Practical Task
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-[14px] font-bold text-black leading-relaxed">
                          {practical.task}
                        </div>
                      </section>
                    )}

                    {practical.theory && (
                      <section>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <BookText className="w-4 h-4 text-gray-300" /> Key Concepts
                        </h2>
                        <div className="text-[14px] font-bold text-gray-500 leading-relaxed italic border-l-4 border-gray-100 pl-4 py-1">
                          {practical.theory}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>

              {practical.sample_code && (
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Sample Template</h2>
                  <pre className="text-[13px] font-mono text-gray-400 overflow-x-auto selection:bg-white/10 leading-relaxed">
                    {practical.sample_code}
                  </pre>
                </div>
              )}
            </div>

            {/* RIGHT SIDE – COMPILER */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[750px] ring-1 ring-black/5">

                {/* Editor Header */}
                <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-4 border-l border-gray-200">
                      <FileCode2 className="w-4 h-4" /> index.{practical.language === 'python' ? 'py' : practical.language === 'java' ? 'java' : 'c'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExecute}
                      disabled={executing || submitting}
                      className="group bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-black px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 border border-gray-200"
                    >
                      {executing ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-black/20 border-t-black"></div>
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black group-hover:scale-110 transition-transform" />
                      )}
                      Run Code
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={executing || submitting || executionResult?.execution_status !== "success"}
                      className="bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-100 disabled:border-transparent text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-black/10 border border-black/10"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white"></div>
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      Submit Solution
                    </button>
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative bg-[#0D0D0D]">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-10 font-mono text-[14px] resize-none focus:outline-none bg-transparent text-gray-300 leading-relaxed selection:bg-white/20"
                    placeholder="// Implement your solution here..."
                    spellCheck={false}
                  />
                  {!code && (
                    <div className="absolute inset-x-10 top-10 pointer-events-none opacity-20 font-mono text-sm text-gray-400">
                      {`// Write your ${practical?.language} code...`}
                    </div>
                  )}
                </div>

                {/* Status Bar / Success Message */}
                {(success || error) && (
                  <div className={`px-8 py-3 border-t flex items-center gap-3 animate-in slide-in-from-bottom-2 ${error ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="text-xs font-black uppercase tracking-tight">{error || success}</span>
                  </div>
                )}

                {/* Output Console */}
                <div className="bg-[#141414] h-56 border-t border-white/5 p-8 overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      Console Output
                    </span>
                    {executionResult && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${executionResult.execution_status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {executionResult.execution_status}
                      </span>
                    )}
                  </div>

                  {executionResult ? (
                    <div className="font-mono text-[13px] space-y-4">
                      {executionResult.output && (
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{executionResult.output}</div>
                      )}
                      {executionResult.error && (
                        <div className="text-rose-400 whitespace-pre-wrap bg-rose-400/5 p-4 rounded-xl border border-rose-400/10">{executionResult.error}</div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50 space-y-3">
                      <Terminal className="w-12 h-12 stroke-[1]" />
                      <p className="text-[11px] font-black uppercase tracking-widest">Execute code to see output</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
