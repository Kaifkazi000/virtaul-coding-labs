"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherPracticalsDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const subjectInstanceId = params.subjectId as string;

  const [subject, setSubject] = useState<any>(null);
  const [practicals, setPracticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPracticals = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      if (!token) {
        router.push("/auth/teacher");
        return;
      }

      const res = await fetch(`/api/practicals/teacher/${subjectInstanceId}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch practicals");
      setPracticals(Array.isArray(data) ? data.sort((a: any, b: any) => a.pr_no - b.pr_no) : []);
      setError("");
    } catch (err: any) {
      console.error("❌ Error fetching practicals:", err);
      setError(err.message || "Failed to fetch practicals");
    }
  }, [subjectInstanceId, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
          router.push("/auth/teacher");
          return;
        }

        const instancesRes = await fetch("/api/subject-instances/teacher", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const instances = await instancesRes.json();
        if (!instancesRes.ok) throw new Error("Failed to load subject instances");

        const found = instances.find((s: any) => s.id === subjectInstanceId);
        if (!found) throw new Error("Subject instance not found");
        setSubject(found);

        await fetchPracticals();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, subjectInstanceId, fetchPracticals]);

  const handleUnlockToggle = async (practicalId: string, currentUnlocked: boolean) => {
    setError("");
    try {
      const token = localStorage.getItem("teacher_token");
      const res = await fetch(`/api/practicals/${practicalId}/unlock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ unlocked: !currentUnlocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update practical");

      await fetchPracticals();
      setSuccess(`Practical ${!currentUnlocked ? "unlocked" : "locked"} successfully`);
      setTimeout(() => setSuccess(""), 2500);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="p-8">Loading practicals...</div>;
  if (error && !subject) return <div className="p-8 text-red-600">{error}</div>;
  if (!subject) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{subject.subject_name}</h1>
            <p className="text-sm text-gray-500 font-medium">
              Code: {subject.subject_code} | Semester: {subject.semester}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/teacher")}
            className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Practicals Dashboard</h2>
          <button
            onClick={fetchPracticals}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            ↻ Refresh List
          </button>
        </div>

        {practicals.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
            No practicals added yet for this subject.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {practicals.map((pr) => (
              <div
                key={pr.id}
                className="group border border-gray-100 rounded-xl p-5 bg-white hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {pr.pr_no}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-900">
                        {pr.title}
                      </h3>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                        {pr.language}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pr.is_unlocked
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {pr.is_unlocked ? "Unlocked" : "Locked"}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockToggle(pr.id, pr.is_unlocked);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${pr.is_unlocked
                        ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                        : "bg-green-50 text-green-600 hover:bg-green-500 hover:text-white"
                        }`}
                    >
                      {pr.is_unlocked ? "Lock" : "Unlock"}
                    </button>

                    <button
                      onClick={() => router.push(`/dashboard/teacher/subjects/${subjectInstanceId}/practicals/${pr.id}`)}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                    >
                      View Submissions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
