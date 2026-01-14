"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentPracticalDetailPage() {
  const router = useRouter();
  const { practicalId } = useParams();

  const [practical, setPractical] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [code, setCode] = useState("");
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("student_token");
      if (!token) {
        router.push("/auth/student");
        return;
      }

      // Fetch practical
      const p = await fetch(
        `http://localhost:5000/api/practicals/${practicalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pData = await p.json();
      setPractical(pData);
      setCode(pData.sample_code || "");

      // Fetch submission (if exists)
      const s = await fetch(
        `http://localhost:5000/api/submissions/student/${practicalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sData = await s.json();
      if (sData.submission) {
        setSubmission(sData.submission);
        setCode(sData.submission.code);
      }
    };

    load();
  }, [practicalId, router]);

  const handleExecute = async () => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("student_token");

    const res = await fetch("http://localhost:5000/api/execution/execute", {
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
      setError(data.error || "Execution failed");
      return;
    }

    setExecutionResult(data);

    if (data.execution_status === "success" && data.submitted) {
      setSuccess("Executed successfully and auto-submitted ✅");

      // Refresh submission
      const s = await fetch(
        `http://localhost:5000/api/submissions/student/${practicalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sData = await s.json();
      setSubmission(sData.submission || null);
    }
  };

  if (!practical) return <p className="p-6">Loading practical...</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT SIDE – PRACTICAL INFO */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-2">
            PR-{practical.pr_no}: {practical.title}
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            Language: {practical.language}
          </p>

          {submission && (
            <div className="mb-4 text-sm">
              <p>
                Last Status:{" "}
                <b>{submission.execution_status}</b>
              </p>
              {submission.submitted_at && (
                <p className="text-gray-500">
                  Submitted:{" "}
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {practical.description && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Description</h2>
              <p className="text-gray-700">{practical.description}</p>
            </section>
          )}

          {practical.task && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Task</h2>
              <p className="text-gray-700">{practical.task}</p>
            </section>
          )}

          {practical.theory && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Theory</h2>
              <p className="text-gray-700">{practical.theory}</p>
            </section>
          )}

          {practical.sample_code && (
            <section>
              <h2 className="font-semibold mb-1">Sample Code</h2>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {practical.sample_code}
              </pre>
            </section>
          )}
        </div>

        {/* RIGHT SIDE – COMPILER */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Code Editor</h2>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-3 border rounded font-mono text-sm"
            placeholder="Write your code here..."
          />

          {executionResult && (
            <p className="mt-3 text-sm">
              Status:{" "}
              <b
                className={
                  executionResult.execution_status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {executionResult.execution_status}
              </b>
            </p>
          )}

          <button
            onClick={handleExecute}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Execute (Auto-submit)
          </button>

          {success && <p className="mt-3 text-green-600">{success}</p>}
          {error && <p className="mt-3 text-red-600">{error}</p>}
        </div>

      </div>
    </main>
  );
}
