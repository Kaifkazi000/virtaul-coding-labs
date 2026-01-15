"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherSubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<any>(null);
  const [practicals, setPracticals] = useState<any[]>([]);
  const [selectedPractical, setSelectedPractical] = useState<any>(null);
  const [practicalStudents, setPracticalStudents] = useState<any>(null);
  const [selectedPr, setSelectedPr] = useState<number | "">("");
  const [activeTab, setActiveTab] = useState<"practicals" | "add">("practicals");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task: "",
    theory: "",
    sample_code: "",
    language: "Python",
  });

  // Function to fetch practicals (reusable)
  const fetchPracticals = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      if (!token) return;

      const practicalsRes = await fetch(
        `/api/practicals/teacher/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store", // Prevent caching
          method: "GET",
        }
      );

      const practicalsData = await practicalsRes.json();

      if (practicalsRes.ok && Array.isArray(practicalsData)) {
        setPracticals(practicalsData.sort((a: any, b: any) => a.pr_no - b.pr_no));
      } else {
        console.error("Failed to fetch practicals:", practicalsData);
        if (practicalsData.error) {
          setError(practicalsData.error);
        }
      }
    } catch (err: any) {
      console.error("Error fetching practicals:", err);
      setError(err.message || "Failed to fetch practicals");
    }
  }, [subjectId]);

  // Fetch subject instance info
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
          router.push("/auth/teacher");
          return;
        }

        // Fetch all teacher's subject instances to find this one
        const instancesRes = await fetch(
          "/api/subject-instances/teacher",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store", // Prevent caching
          }
        );

        const instancesData = await instancesRes.json();

        if (!instancesRes.ok) {
          throw new Error("Failed to load subject instances");
        }

        const foundSubject = instancesData.find(
          (s: any) => s.id === subjectId
        );

        if (!foundSubject) {
          throw new Error("Subject instance not found");
        }

        setSubject(foundSubject);

        // Fetch practicals for this subject instance
        await fetchPracticals();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectId, router, fetchPracticals]);

  // Fetch students for selected practical
  const fetchPracticalStudents = async (practicalId: string) => {
    setLoadingStudents(true);
    setError("");
    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(
        `/api/teacher-dashboard/practical/${practicalId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch students");
      }

      setPracticalStudents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handlePracticalClick = (practical: any) => {
    setSelectedPractical(practical);
    fetchPracticalStudents(practical.id);
  };

  const handleEnableToggle = async (practicalId: string, currentEnabled: boolean) => {
    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(
        `/api/practicals/${practicalId}/enable`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            enabled: !currentEnabled,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update practical");
      }

      // Refresh practicals list
      await fetchPracticals();

      setSuccess(`Practical ${!currentEnabled ? "enabled" : "disabled"} successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadPDF = async (practicalId: string) => {
    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(
        `/api/pdf/practical/${practicalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PR-${selectedPractical?.pr_no || "report"}_${subject?.subject_name || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPr) {
      setError("Please select a PR number");
      return;
    }

    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(
        "/api/practicals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject_instance_id: subjectId,
            pr_no: selectedPr,
            title: formData.title,
            description: formData.description,
            task: formData.task,
            theory: formData.theory,
            sample_code: formData.sample_code,
            language: formData.language,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add practical");
      }

      setSuccess(`PR-${selectedPr} added successfully`);
      setError(""); // Clear any previous errors

      // Reset form immediately
      setFormData({
        title: "",
        description: "",
        task: "",
        theory: "",
        sample_code: "",
        language: "Python",
      });
      setSelectedPr("");

      // Refresh practicals list with a small delay to ensure DB is updated
      setTimeout(async () => {
        await fetchPracticals();
        // Switch to practicals tab to show the newly added practical
        setActiveTab("practicals");
      }, 500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (error && !subject) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!subject) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Subject Info */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">
              {subject.subject_name}
            </h1>
            <p className="text-sm text-gray-600">
              Code: {subject.subject_code} | Semester: {subject.semester}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={async () => {
              setActiveTab("practicals");
              setSelectedPractical(null);
              setPracticalStudents(null);
              // Refresh practicals when switching to this tab
              await fetchPracticals();
            }}
            className={`pb-2 px-4 font-medium ${
              activeTab === "practicals"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Practicals
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "add"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Add Practical
          </button>

          <button
            onClick={() => router.push(`/dashboard/teacher/subjects/${subjectId}/practicals`)}
            className="ml-auto pb-2 px-4 font-medium text-blue-600 hover:underline"
          >
            Open Practicals Dashboard →
          </button>
        </div>

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

        {/* Practicals List Tab */}
        {activeTab === "practicals" && (
          <div>
            {!selectedPractical ? (
              // Show practicals list
              <div>
                <h2 className="text-lg font-semibold mb-4">Practical List</h2>
                {practicals.length === 0 ? (
                  <p className="text-gray-500">No practicals added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {practicals.map((pr) => (
                      <div
                        key={pr.id}
                        className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePracticalClick(pr)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">
                              PR-{pr.pr_no}: {pr.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              Language: {pr.language}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                pr.is_enabled
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {pr.is_enabled ? "Enabled" : "Disabled"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnableToggle(pr.id, pr.is_enabled);
                              }}
                              className={`px-3 py-1 rounded text-sm ${
                                pr.is_enabled
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
              // Show students for selected practical
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
                    {/* Statistics */}
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

                    {/* Submitted Students */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-green-700">
                        ✅ Submitted Students ({practicalStudents.submitted.length})
                      </h3>
                      {practicalStudents.submitted.length === 0 ? (
                        <p className="text-gray-500">No submissions yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {practicalStudents.submitted.map((student: any) => (
                            <div
                              key={student.student_id}
                              className="border rounded-md p-3 bg-green-50"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-gray-600">
                                    PRN: {student.prn} | Roll: {student.roll}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Status: {student.execution_status} | 
                                    Submitted: {new Date(student.submitted_at).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      student.execution_status === "success"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {student.execution_status}
                                  </span>
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/teacher/submissions/${student.submission_id}`
                                      )
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

                    {/* Not Submitted Students */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-700">
                        ❌ Not Submitted Students ({practicalStudents.not_submitted.length})
                      </h3>
                      {practicalStudents.not_submitted.length === 0 ? (
                        <p className="text-gray-500">All students have submitted! 🎉</p>
                      ) : (
                        <div className="space-y-2">
                          {practicalStudents.not_submitted.map((student: any) => (
                            <div
                              key={student.student_id}
                              className="border rounded-md p-3 bg-red-50"
                            >
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
        )}

        {/* Add Practical Tab */}
        {activeTab === "add" && (
          <div>
            {/* PR Selector */}
            <label className="block font-medium mb-1">
              Select Practical Number
            </label>
            <select
              value={selectedPr}
              onChange={(e) => setSelectedPr(Number(e.target.value))}
              className="w-full mb-4 px-3 py-2 border rounded-md"
            >
              <option value="">-- Select PR --</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                const alreadyExists = practicals.some((p) => p.pr_no === num);
                return (
                  <option key={num} value={num} disabled={alreadyExists}>
                    {alreadyExists ? `PR-${num} (already added)` : `PR-${num}`}
                  </option>
                );
              })}
            </select>

            {/* Practical Form */}
            {selectedPr && (
              <form onSubmit={handleSubmit}>
                <input
                  name="title"
                  placeholder="Practical Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full mb-2 px-3 py-2 border rounded-md"
                  required
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mb-2 px-3 py-2 border rounded-md"
                />

                <textarea
                  name="task"
                  placeholder="Task"
                  value={formData.task}
                  onChange={handleChange}
                  className="w-full mb-2 px-3 py-2 border rounded-md"
                />

                <textarea
                  name="theory"
                  placeholder="Theory"
                  value={formData.theory}
                  onChange={handleChange}
                  className="w-full mb-2 px-3 py-2 border rounded-md"
                />

                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full mb-2 px-3 py-2 border rounded-md"
                >
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="C">C / OS</option>
                  <option value="SQL">SQL</option>
                  <option value="OLAP">OLAP</option>
                </select>

                <textarea
                  name="sample_code"
                  placeholder="Sample Code"
                  value={formData.sample_code}
                  onChange={handleChange}
                  className="w-full mb-3 px-3 py-2 border rounded-md font-mono"
                />

                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Save PR-{selectedPr}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
