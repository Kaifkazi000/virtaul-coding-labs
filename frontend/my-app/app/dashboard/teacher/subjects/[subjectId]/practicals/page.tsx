"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherPracticalsDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const subjectInstanceId = params.subjectId as string;

  const [subject, setSubject] = useState<any>(null);
  const [practicals, setPracticals] = useState<any[]>([]);
  const [selectedPractical, setSelectedPractical] = useState<any>(null);
  const [practicalStudents, setPracticalStudents] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPracticals = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      if (!token) {
        router.push("/auth/teacher");
        return;
      }

      // Force fresh fetch with timestamp to bypass any cache
      const res = await fetch(`/api/practicals/teacher/${subjectInstanceId}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch practicals");
      console.log(`✅ Practicals Dashboard: Fetched ${Array.isArray(data) ? data.length : 0} practicals`);
      setPracticals(Array.isArray(data) ? data.sort((a: any, b: any) => a.pr_no - b.pr_no) : []);
      setError(""); // Clear errors on success
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

  const fetchPracticalStudents = async (practicalId: string) => {
    setLoadingStudents(true);
    setError("");
    try {
      const token = localStorage.getItem("teacher_token");
      const res = await fetch(`/api/teacher-dashboard/practical/${practicalId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch students");
      setPracticalStudents(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleEnableToggle = async (practicalId: string, currentEnabled: boolean) => {
    setError("");
    try {
      const token = localStorage.getItem("teacher_token");
      const res = await fetch(`/api/practicals/${practicalId}/enable`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update practical");

      await fetchPracticals();
      setSuccess(`Practical ${!currentEnabled ? "enabled" : "disabled"} successfully`);
      setTimeout(() => setSuccess(""), 2500);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDownloadPDF = async (practicalId: string) => {
    try {
      const token = localStorage.getItem("teacher_token");
      const res = await fetch(`/api/pdf/practical/${practicalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PR-${selectedPractical?.pr_no || "report"}_${subject?.subject_name || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error && !subject) return <p className="p-6 text-red-600">{error}</p>;
  if (!subject) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{subject.subject_name}</h1>
            <p className="text-sm text-gray-600">
              Code: {subject.subject_code} | Semester: {subject.semester}
            </p>
          </div>
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
            ← Back
          </button>
        </div>

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

        {!selectedPractical ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Practicals Dashboard</h2>
              <button
                onClick={async () => {
                  setSelectedPractical(null);
                  setPracticalStudents(null);
                  await fetchPracticals();
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Refresh
              </button>
            </div>

            {practicals.length === 0 ? (
              <p className="text-gray-500">No practicals added yet.</p>
            ) : (
              <div className="space-y-3">
                {practicals.map((pr) => (
                  <div
                    key={pr.id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedPractical(pr);
                      fetchPracticalStudents(pr.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          PR-{pr.pr_no}: {pr.title}
                        </p>
                        <p className="text-sm text-gray-600">Language: {pr.language}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${pr.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {pr.is_enabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnableToggle(pr.id, pr.is_enabled);
                          }}
                          className={`px-3 py-1 rounded text-sm ${pr.is_enabled
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                        >
                          {pr.is_enabled ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <button
                  onClick={() => {
                    setSelectedPractical(null);
                    setPracticalStudents(null);
                  }}
                  className="text-blue-600 hover:underline mb-2"
                >
                  ← Back to Practicals
                </button>
                <h2 className="text-lg font-semibold">
                  PR-{selectedPractical.pr_no}: {selectedPractical.title}
                </h2>
              </div>
              <button
                onClick={() => handleDownloadPDF(selectedPractical.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                📥 Download PDF
              </button>
            </div>

            {loadingStudents ? (
              <p className="text-gray-500">Loading students...</p>
            ) : practicalStudents ? (
              <div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{practicalStudents.stats.total_students}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="text-2xl font-bold">{practicalStudents.stats.submitted_count}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Not Submitted</p>
                    <p className="text-2xl font-bold">{practicalStudents.stats.not_submitted_count}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Submission Rate</p>
                    <p className="text-2xl font-bold">{practicalStudents.stats.submission_rate}%</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-green-700">
                    ✅ Submitted Students ({practicalStudents.submitted.length})
                  </h3>
                  {practicalStudents.submitted.length === 0 ? (
                    <p className="text-gray-500">No submissions yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {practicalStudents.submitted.map((student: any) => (
                        <div key={student.student_id} className="border rounded-md p-3 bg-green-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">
                                PRN: {student.prn} | Roll: {student.roll}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {student.execution_status} | Submitted:{" "}
                                {new Date(student.submitted_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${student.execution_status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {student.execution_status}
                              </span>
                              <button
                                onClick={() =>
                                  router.push(`/dashboard/teacher/submissions/${student.submission_id}`)
                                }
                                className="px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                              >
                                View Code
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-700">
                    ❌ Not Submitted Students ({practicalStudents.not_submitted.length})
                  </h3>
                  {practicalStudents.not_submitted.length === 0 ? (
                    <p className="text-gray-500">All students have submitted!</p>
                  ) : (
                    <div className="space-y-2">
                      {practicalStudents.not_submitted.map((student: any) => (
                        <div key={student.student_id} className="border rounded-md p-3 bg-red-50">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            PRN: {student.prn} | Roll: {student.roll}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No data available.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

