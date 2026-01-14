"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentSubjectPracticalsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [practicals, setPracticals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [unlockMap, setUnlockMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch practicals + submission status + unlock status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("student_token");

        if (!token) {
          router.push("/auth/student");
          return;
        }

        // Fetch practicals
        const practicalsRes = await fetch(
          `/api/practicals/student/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const practicalsData = await practicalsRes.json();

        if (!practicalsRes.ok) {
          throw new Error(practicalsData.error || "Failed to fetch practicals");
        }

        // Sort by pr_no
        const sorted = practicalsData.sort(
          (a: any, b: any) => a.pr_no - b.pr_no
        );
        setPracticals(sorted);

        const [submissionResults, unlockResults] = await Promise.all([
          Promise.all(
            sorted.map(async (pr: any) => {
              const subRes = await fetch(
                `/api/submissions/student/${pr.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const subData = await subRes.json();
              return { practicalId: pr.id, submission: subData.submission || null };
            })
          ),
          Promise.all(
            sorted.map(async (pr: any) => {
              const uRes = await fetch(
                `/api/execution/unlock-status/${pr.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const uData = await uRes.json();
              return { practicalId: pr.id, isUnlocked: !!uData.is_unlocked };
            })
          ),
        ]);

        const newSubs: Record<string, any> = {};
        submissionResults.forEach((r) => (newSubs[r.practicalId] = r.submission));
        setSubmissions(newSubs);

        const newUnlock: Record<string, boolean> = {};
        unlockResults.forEach((r) => (newUnlock[r.practicalId] = r.isUnlocked));
        setUnlockMap(newUnlock);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, router]);

  const getStatusBadge = (submission: any) => {
    if (!submission) {
      return <span className="text-xs text-gray-500">Not submitted</span>;
    }

    const status = submission.execution_status || "unknown";
    const styles: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      timeout: "bg-yellow-100 text-yellow-800",
      error: "bg-yellow-100 text-yellow-800",
      unknown: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Practicals</h1>
          <div className="text-sm text-gray-600">
            Total: {practicals.length}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading practicals...</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : practicals.length === 0 ? (
          <p className="text-gray-500">No practicals added yet.</p>
        ) : (
          <ul className="space-y-3">
            {practicals.map((pr) => {
              const unlocked = !!unlockMap[pr.id];
              const submission = submissions[pr.id];

              return (
                <li
                  key={pr.id}
                  onClick={() => {
                    if (unlocked) {
                      router.push(
                        `/dashboard/student/practicals/${pr.id}`
                      );
                    }
                  }}
                  className={`border rounded-md p-4 flex justify-between items-center ${
                    unlocked
                      ? "bg-gray-50 cursor-pointer hover:bg-gray-100"
                      : "bg-gray-200 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">
                        PR-{pr.pr_no}: {pr.title}
                      </p>
                      {getStatusBadge(submission)}
                    </div>
                    {submission?.submitted_at && (
                      <p className="text-xs text-gray-600 mt-1">
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {unlocked ? "🔓 Unlocked" : "🔒 Locked"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mt-6 text-sm text-blue-600 hover:underline"
        >
          ← Back to Subjects
        </button>
      </div>
    </main>
  );
}
