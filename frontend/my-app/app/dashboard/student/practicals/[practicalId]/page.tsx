"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentPracticalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const practicalId = params.practicalId as string;

  const [practical, setPractical] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("student_token");

        if (!token) {
          router.push("/auth/student");
          return;
        }

        // Fetch practical details
        const practicalRes = await fetch(
          `http://localhost:5000/api/practicals/${practicalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const practicalData = await practicalRes.json();

        if (!practicalRes.ok) {
          throw new Error(practicalData.error || "Failed to load practical");
        }

        setPractical(practicalData);

        // Load existing submission if any
        const submissionRes = await fetch(
          `http://localhost:5000/api/submissions/student/${practicalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const submissionData = await submissionRes.json();

        if (submissionRes.ok && submissionData.submission) {
          setSubmission(submissionData.submission);
          setCode(submissionData.submission.code || "");
        } else if (practicalData.sample_code) {
          // Load sample code if no submission exists
          setCode(practicalData.sample_code);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [practicalId, router]);

  const handleExecute = async () => {
    if (!code.trim()) {
      setError("Please write some code first");
      return;
    }

    setExecuting(true);
    setError("");
    setSuccess("");
    setExecutionResult(null);
    setCanSubmit(false);

    try {
      const token = localStorage.getItem("student_token");

      const res = await fetch(
        "http://localhost:5000/api/submissions/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: code,
            language: practical.language,
            practical_id: practicalId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Execution failed");
      }

      setExecutionResult(data);
      setCanSubmit(data.execution_status === "success");
      
      if (data.execution_status === "success") {
        setSuccess("Code executed successfully! You can now submit.");
      } else {
        setError(data.error || "Execution failed. Please fix the code.");
      }
    } catch (err: any) {
      setError(err.message);
      setCanSubmit(false);
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Please execute code successfully first");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("student_token");

      const res = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code,
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

      setSubmission(data.submission);
      setSuccess("Submission successful! Waiting for teacher review.");
      setCanSubmit(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-gray-500">Loading practical...</p>
    );
  }

  if (error && !practical) {
    return (
      <p className="p-6 text-red-600">{error}</p>
    );
  }

  if (!practical) return null;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE – PRACTICAL CONTENT */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-2">
            PR-{practical.pr_no}: {practical.title}
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            Language: {practical.language}
          </p>

          {/* Submission Status */}
          {submission && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Submission Status:</span>
                {getStatusBadge(submission.submission_status)}
              </div>
              {submission.teacher_feedback && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Feedback:</strong> {submission.teacher_feedback}
                </p>
              )}
              {submission.reviewed_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Reviewed: {new Date(submission.reviewed_at).toLocaleString()}
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
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Sample Code</h2>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {practical.sample_code}
              </pre>
            </section>
          )}

          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Back to Practicals
          </button>
        </div>

        {/* RIGHT SIDE – CODE EDITOR & EXECUTION */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Code Editor</h2>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Code Editor */}
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCanSubmit(false);
              setExecutionResult(null);
            }}
            placeholder="Write your code here..."
            className="w-full h-64 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submission?.submission_status === "approved"}
          />

          {/* Execution Result */}
          {executionResult && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium mb-2">Execution Result:</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {executionResult.output || executionResult.error}
              </pre>
              <p
                className={`mt-2 text-sm font-medium ${
                  executionResult.execution_status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Status: {executionResult.execution_status}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleExecute}
              disabled={executing || !code.trim() || submission?.submission_status === "approved"}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {executing ? "Executing..." : "Execute Code"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !canSubmit ||
                submission?.submission_status === "approved"
              }
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          {submission?.submission_status === "approved" && (
            <p className="mt-3 text-sm text-green-600 font-medium">
              ✓ This practical has been approved. You can proceed to the next one.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
