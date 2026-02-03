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
  Info
} from "lucide-react";

export default function StudentPracticalDetailPage() {
  const router = useRouter();
  const { practicalId } = useParams();

  const [practical, setPractical] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [code, setCode] = useState("");
  const [executing, setExecuting] = useState(false);
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
        // Fetch practical
        const p = await fetch(`/api/practicals/${practicalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pData = await p.json();
        if (!p.ok) throw new Error(pData.error || "Practical not found");

        setPractical(pData);

        // Fetch submission (if exists)
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

      if (data.execution_status === "success" && data.submitted) {
        setSuccess("Executed successfully and auto-submitted ✅");

        // Refresh submission
        const s = await fetch(`/api/submissions/student/${practicalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sData = await s.json();
        setSubmission(sData.submission || null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  if (!practical && !error) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <StudentNavbar studentName={student?.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to List
        </button>

        {error && !practical ? (
          <div className="bg-red-50 text-red-700 p-8 rounded-[2rem] border border-red-100 flex items-center gap-6">
            <AlertCircle className="w-12 h-12 shrink-0 text-red-400" />
            <div>
              <h3 className="text-xl font-black mb-1">Error</h3>
              <p className="font-medium opacity-80">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT SIDE – PRACTICAL INFO */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2rem] sticky top-24">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    PR-{practical.pr_no}
                  </span>
                  <span className="px-3 py-1 bg-white border border-gray-100 text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Code2 className="w-3 h-3" />
                    {practical.language}
                  </span>
                </div>

                <h1 className="text-3xl font-black text-black tracking-tighter leading-tight mb-6">
                  {practical.title}
                </h1>

                {submission && (
                  <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-black uppercase tracking-tight">Submitted Successfully</span>
                    </div>
                    <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-widest">
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {practical.description && (
                    <section>
                      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-300" /> Description
                      </h2>
                      <p className="text-sm font-bold text-black leading-relaxed">{practical.description}</p>
                    </section>
                  )}

                  {practical.task && (
                    <section>
                      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-gray-300" /> The Task
                      </h2>
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-bold text-black leading-relaxed shadow-sm">
                        {practical.task}
                      </div>
                    </section>
                  )}

                  {practical.theory && (
                    <section>
                      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <BookText className="w-4 h-4 text-gray-300" /> Theory
                      </h2>
                      <p className="text-sm font-bold text-gray-600 leading-relaxed italic border-l-4 border-gray-200 pl-4">
                        {practical.theory}
                      </p>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE – COMPILER */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col h-[700px]">
                {/* Editor Header */}
                <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-4 border-l border-gray-200">
                      <FileCode2 className="w-4 h-4" /> index.{practical.language === 'python' ? 'py' : practical.language === 'java' ? 'java' : 'c'}
                    </span>
                  </div>

                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    {executing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Run & Submit
                  </button>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-8 font-mono text-sm resize-none focus:outline-none bg-[#0a0a0a] text-gray-300 leading-relaxed selection:bg-white/20"
                    placeholder="// Write your code here..."
                    spellCheck={false}
                  />
                </div>

                {/* Output Console */}
                <div className="bg-[#111] h-48 border-t border-gray-800 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      Console Output
                    </span>
                    {executionResult && (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${executionResult.execution_status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {executionResult.execution_status}
                      </span>
                    )}
                  </div>

                  {executionResult ? (
                    <div className="font-mono text-xs space-y-2">
                      {executionResult.output && (
                        <div className="text-gray-300 whitespace-pre-wrap">{executionResult.output}</div>
                      )}
                      {executionResult.error && (
                        <div className="text-red-400 whitespace-pre-wrap">{executionResult.error}</div>
                      )}
                      {executionResult.test_results && (
                        <div className="pt-2 border-t border-gray-800">
                          <p className="text-gray-500 mb-1">Test Results:</p>
                          <div className="text-gray-300">{executionResult.test_results}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 font-mono text-xs italic">Output will appear here after execution...</p>
                  )}

                  {success && <p className="mt-4 text-green-400 font-bold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {success}</p>}
                  {error && <p className="mt-4 text-red-400 font-bold text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

