"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentSubjectPracticalsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [practicals, setPracticals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch practicals and submissions
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
          `http://localhost:5000/api/practicals/student/${subjectId}`,
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

        // Fetch progress
        const progressRes = await fetch(
          `http://localhost:5000/api/submissions/student/progress/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData);

          // Create a map of practical_id -> submission
          const submissionMap: Record<string, any> = {};
          progressData.submissions.forEach((sub: any) => {
            // Find practical by pr_no
            const practical = sorted.find((p: any) => p.pr_no === sub.pr_no);
            if (practical) {
              submissionMap[practical.id] = sub;
            }
          });
          setSubmissions(submissionMap);
        }

        // Fetch individual submissions for each practical
        const submissionPromises = sorted.map(async (pr: any) => {
          try {
            const subRes = await fetch(
              `http://localhost:5000/api/submissions/student/${pr.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (subRes.ok) {
              const subData = await subRes.json();
              if (subData.submission) {
                return { practicalId: pr.id, submission: subData.submission };
              }
            }
          } catch (err) {
            // Ignore errors for individual submissions
          }
          return null;
        });

        const submissionResults = await Promise.all(submissionPromises);
        const newSubmissions: Record<string, any> = {};
        submissionResults.forEach((result) => {
          if (result) {
            newSubmissions[result.practicalId] = result.submission;
          }
        });
        setSubmissions((prev) => ({ ...prev, ...newSubmissions }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, router]);

  // Determine if a practical is unlocked
  const isUnlocked = (prNo: number) => {
    if (prNo === 1) return true; // First practical is always unlocked

    // Check if previous practical is approved
    const previousPr = practicals.find((p) => p.pr_no === prNo - 1);
    if (!previousPr) return false;

    const previousSubmission = submissions[previousPr.id];
    return previousSubmission?.submission_status === "approved";
  };

  const getStatusBadge = (submission: any) => {
    if (!submission) {
      return <span className="text-xs text-gray-500">Not submitted</span>;
    }

    const status = submission.submission_status;
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Practicals</h1>
          {progress && (
            <div className="text-sm text-gray-600">
              Progress: {progress.approved}/{practicals.length} Approved
            </div>
          )}
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
              const unlocked = isUnlocked(pr.pr_no);
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
                    {submission?.teacher_feedback && (
                      <p className="text-xs text-gray-600 mt-1">
                        Feedback: {submission.teacher_feedback}
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
