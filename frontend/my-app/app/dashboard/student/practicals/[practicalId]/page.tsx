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
  const [canSubmit, setCanSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("student_token");

      const p = await fetch(`http://localhost:5000/api/practicals/${practicalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await p.json();
      setPractical(pData);
      setCode(pData.sample_code || "");

      const s = await fetch(`http://localhost:5000/api/submissions/student/${practicalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sData = await s.json();
      if (sData.submission) {
        setSubmission(sData.submission);
        setCode(sData.submission.code);
      }
    };

    load();
  }, [practicalId]);

  const handleExecute = async () => {
    setError("");
    const token = localStorage.getItem("student_token");

    const res = await fetch("http://localhost:5000/api/submissions/execute", {
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
    setExecutionResult(data);
    setCanSubmit(data.execution_status === "success");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("student_token");

    const res = await fetch("http://localhost:5000/api/submissions", {
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
    setSubmission(data.submission);
    setSuccess("Submission saved successfully");
    setCanSubmit(false);
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        PR-{practical?.pr_no}: {practical?.title}
      </h1>

      <textarea
        className="w-full h-64 border p-3 font-mono"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {executionResult && (
        <p className="mt-2 text-sm">
          Status: <b>{executionResult.execution_status}</b>
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button onClick={handleExecute} className="bg-blue-600 text-white px-4 py-2 rounded">
          Execute
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Submit
        </button>
      </div>

      {success && <p className="text-green-600 mt-3">{success}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </main>
  );
}
