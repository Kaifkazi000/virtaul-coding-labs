"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
          router.push("/auth/teacher");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/teacher-dashboard/submission/${submissionId}`,
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

  if (loading) {
    return <p className="p-6">Loading submission...</p>;
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:underline mb-4"
          >
            ← Back
          </button>
          <p className="text-red-600 text-sm">
            {error || "Failed to load submission"}
          </p>
        </div>
      </main>
    );
  }

  const { submission, student, practical } = data;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">
              PR-{practical.pr_no}: {practical.title}
            </h1>
            <p className="text-sm text-gray-600">
              Language: {practical.language}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT – Student & meta info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Student Details</h2>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {student.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">PRN:</span> {student.prn}
            </p>
            <p className="text-sm">
              <span className="font-medium">Roll:</span> {student.roll}
            </p>
            <p className="text-sm mb-4">
              <span className="font-medium">Email:</span> {student.email}
            </p>

            <h2 className="text-lg font-semibold mb-3">Execution Info</h2>
            <p className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  submission.execution_status === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {submission.execution_status}
              </span>
            </p>
            {submission.execution_time_ms != null && (
              <p className="text-sm">
                <span className="font-medium">Time:</span>{" "}
                {submission.execution_time_ms} ms
              </p>
            )}
            {submission.memory_used_kb != null && (
              <p className="text-sm">
                <span className="font-medium">Memory:</span>{" "}
                {submission.memory_used_kb} KB
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Submitted:</span>{" "}
              {submission.submitted_at
                ? new Date(submission.submitted_at).toLocaleString()
                : "—"}
            </p>
            {submission.updated_at && (
              <p className="text-sm">
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(submission.updated_at).toLocaleString()}
              </p>
            )}

            {submission.execution_error && (
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-1 text-red-700">
                  Error
                </h3>
                <pre className="bg-red-50 border border-red-200 rounded-md p-2 text-xs whitespace-pre-wrap">
                  {submission.execution_error}
                </pre>
              </div>
            )}

            {submission.execution_output && (
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-1">Output</h3>
                <pre className="bg-gray-100 rounded-md p-2 text-xs whitespace-pre-wrap">
                  {submission.execution_output}
                </pre>
              </div>
            )}
          </div>

          {/* RIGHT – Code (read-only) */}
          <div className="bg-gray-900 text-green-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-white">Submitted Code</h2>
              <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-full">
                {submission.language}
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-xs font-mono overflow-auto max-h-[70vh]">
{submission.code}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}

