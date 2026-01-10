"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentSubjectPracticalsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [practicals, setPracticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Auth + fetch practicals
  useEffect(() => {
    const fetchPracticals = async () => {
      try {
        const token = localStorage.getItem("student_token");

        if (!token) {
          router.push("/auth/student");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/practicals/student/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        console.log("Student practical list:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch practicals");
        }

        // Sort by pr_no just to be safe
        const sorted = data.sort(
          (a: any, b: any) => a.pr_no - b.pr_no
        );

        setPracticals(sorted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticals();
  }, [subjectId, router]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Practicals
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading practicals...</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : practicals.length === 0 ? (
          <p className="text-gray-500">
            No practicals added yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {practicals.map((pr) => {
              const isUnlocked = pr.pr_no === 1; // UI rule only

              return (
                <li
                  key={pr.id}
                  onClick={() => {
                    if (isUnlocked) {
                      router.push(
                        `/dashboard/student/practicals/${pr.id}`
                      );
                    }
                  }}
                  className={`border rounded-md p-4 flex justify-between items-center ${
                    isUnlocked
                      ? "bg-gray-50 cursor-pointer hover:bg-gray-100"
                      : "bg-gray-200 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div>
                    <p className="font-semibold">
                      PR-{pr.pr_no}: {pr.title}
                    </p>
                  </div>

                  <span className="text-sm">
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </span>
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
