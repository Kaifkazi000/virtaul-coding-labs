"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Code2,
  LogOut,
  ArrowLeft,
  BookOpen,
  Plus,
  RefreshCw,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  BarChart3,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherSubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subjectInstanceId = params.subjectId as string;

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

  const fetchPracticals = useCallback(async (showLoading = false) => {
    try {
      const token = localStorage.getItem("teacher_token");
      if (!token) {
        router.push("/auth/teacher");
        return;
      }

      if (showLoading) setLoading(true);

      const practicalsRes = await fetch(`/api/practicals/teacher/${subjectInstanceId}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
        method: "GET",
      });

      const practicalsData = await practicalsRes.json();

      if (practicalsRes.ok && Array.isArray(practicalsData)) {
        setPracticals(practicalsData.sort((a: any, b: any) => a.pr_no - b.pr_no));
        setError("");
      } else {
        if (practicalsData.error) {
          setError(practicalsData.error);
        } else {
          setError("Failed to fetch practicals. Please try refreshing.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch practicals");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [subjectInstanceId, router]);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
          router.push("/auth/teacher");
          return;
        }

        const instancesRes = await fetch("/api/subject-instances/teacher", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const instancesData = await instancesRes.json();

        if (!instancesRes.ok) {
          throw new Error("Failed to load subject instances");
        }

        const foundSubject = instancesData.find((s: any) => s.id === subjectInstanceId);

        if (!foundSubject) {
          throw new Error("Subject instance not found");
        }

        setSubject(foundSubject);
        await fetchPracticals();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectInstanceId, router, fetchPracticals]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && subject && !loading) {
        fetchPracticals();
      }
    };

    const handleFocus = () => {
      if (subject && !loading) {
        fetchPracticals();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [subject, loading, fetchPracticals]);

  const fetchPracticalStudents = async (practicalId: string) => {
    setLoadingStudents(true);
    setError("");
    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(`/api/teacher-dashboard/practical/${practicalId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

      const res = await fetch(`/api/practicals/${practicalId}/enable`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: !currentEnabled,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update practical");
      }

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

      const res = await fetch(`/api/pdf/practical/${practicalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      const res = await fetch("/api/practicals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_instance_id: subjectInstanceId,
          pr_no: selectedPr,
          title: formData.title,
          description: formData.description,
          task: formData.task,
          theory: formData.theory,
          sample_code: formData.sample_code,
          language: formData.language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add practical");
      }

      setSuccess(`PR-${selectedPr} added successfully`);
      setError("");

      setFormData({
        title: "",
        description: "",
        task: "",
        theory: "",
        sample_code: "",
        language: "Python",
      });
      setSelectedPr("");

      setTimeout(async () => {
        await fetchPracticals();
        setActiveTab("practicals");
      }, 500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacher_token");
    router.push("/auth/teacher");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (error && !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Subject</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => router.push("/dashboard/teacher")}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">Virtual Coding Lab</h1>
                <p className="text-xs text-orange-500 font-medium">Teacher Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 hover:bg-orange-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Header Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 p-6 mb-8 border border-orange-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{subject.subject_name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">Code: {subject.subject_code}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-pink-100 text-orange-600">
                    Semester {subject.semester}
                  </span>
                  {subject.batch && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                      {subject.batch}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/dashboard/teacher")}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 border border-orange-100 overflow-hidden">
          <div className="flex items-center justify-between border-b border-orange-100 px-6 py-4">
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setActiveTab("practicals");
                  setSelectedPractical(null);
                  setPracticalStudents(null);
                  await fetchPracticals();
                }}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${activeTab === "practicals"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200"
                  : "text-gray-600 hover:bg-orange-50"
                  }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Practicals
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${activeTab === "add"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200"
                  : "text-gray-600 hover:bg-orange-50"
                  }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Practical
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchPracticals(true)}
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:bg-orange-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/teacher/subjects/${subjectInstanceId}/practicals`)}
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:bg-orange-50"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Dashboard
              </Button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <div className="p-6">
            {/* Practicals List Tab */}
            {activeTab === "practicals" && (
              <div>
                {!selectedPractical ? (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Practical List
                    </h2>
                    {practicals.length === 0 ? (
                      <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-orange-400" />
                        </div>
                        <p className="text-gray-600 mb-4">No practicals added yet.</p>
                        <Button
                          onClick={() => setActiveTab("add")}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Practical
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {practicals.map((pr, index) => (
                          <div
                            key={pr.id}
                            onClick={() => handlePracticalClick(pr)}
                            className="group border border-orange-100 rounded-xl p-5 bg-gradient-to-r from-white to-orange-50/30 hover:shadow-lg hover:shadow-orange-100/50 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
                                  {pr.pr_no}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                    PR-{pr.pr_no}: {pr.title}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <Code2 className="w-3.5 h-3.5" />
                                    {pr.language}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-4 py-1.5 rounded-full text-xs font-semibold ${pr.is_enabled
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                  {pr.is_enabled ? "✓ Enabled" : "Disabled"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnableToggle(pr.id, pr.is_enabled);
                                  }}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pr.is_enabled
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
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
                  // Students View for Selected Practical
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <button
                          onClick={() => {
                            setSelectedPractical(null);
                            setPracticalStudents(null);
                          }}
                          className="text-orange-600 hover:text-orange-700 flex items-center gap-2 mb-2 font-medium"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Practicals
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">
                          PR-{selectedPractical.pr_no}: {selectedPractical.title}
                        </h2>
                      </div>
                      <Button
                        onClick={() => handleDownloadPDF(selectedPractical.id)}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-200"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF Report
                      </Button>
                    </div>

                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : practicalStudents ? (
                      <div>
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm text-blue-600 font-medium">Total Students</p>
                            </div>
                            <p className="text-3xl font-bold text-blue-700">{practicalStudents.stats.total_students}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm text-green-600 font-medium">Submitted</p>
                            </div>
                            <p className="text-3xl font-bold text-green-700">{practicalStudents.stats.submitted_count}</p>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm text-red-600 font-medium">Not Submitted</p>
                            </div>
                            <p className="text-3xl font-bold text-red-700">{practicalStudents.stats.not_submitted_count}</p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm text-amber-600 font-medium">Submission Rate</p>
                            </div>
                            <p className="text-3xl font-bold text-amber-700">{practicalStudents.stats.submission_rate}%</p>
                          </div>
                        </div>

                        {/* Submitted Students */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Submitted Students ({practicalStudents.submitted.length})
                          </h3>
                          {practicalStudents.submitted.length === 0 ? (
                            <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">No submissions yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {practicalStudents.submitted.map((student: any) => (
                                <div
                                  key={student.student_id}
                                  className="border border-green-200 rounded-xl p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-semibold text-gray-800">{student.name}</p>
                                      <p className="text-sm text-gray-600">
                                        PRN: {student.prn} | Roll: {student.roll}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Submitted: {new Date(student.submitted_at).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${student.execution_status === "success"
                                          ? "bg-green-200 text-green-800"
                                          : "bg-red-200 text-red-800"
                                          }`}
                                      >
                                        {student.execution_status}
                                      </span>
                                      <Button
                                        onClick={() => router.push(`/dashboard/teacher/submissions/${student.submission_id}`)}
                                        size="sm"
                                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                                      >
                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                        View Code
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Not Submitted Students */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Not Submitted ({practicalStudents.not_submitted.length})
                          </h3>
                          {practicalStudents.not_submitted.length === 0 ? (
                            <div className="text-center py-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                              <p className="text-green-600 font-medium">🎉 All students have submitted!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {practicalStudents.not_submitted.map((student: any) => (
                                <div
                                  key={student.student_id}
                                  className="border border-red-200 rounded-xl p-4 bg-gradient-to-r from-red-50 to-rose-50"
                                >
                                  <p className="font-semibold text-gray-800">{student.name}</p>
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
                      <p className="text-gray-500 text-center py-8">No data available.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add Practical Tab */}
            {activeTab === "add" && (
              <div className="max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  Add New Practical
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Practical Number
                  </label>
                  <select
                    value={selectedPr}
                    onChange={(e) => setSelectedPr(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                  >
                    <option value="">-- Select PR Number --</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                      const alreadyExists = practicals.some((p) => p.pr_no === num);
                      return (
                        <option key={num} value={num} disabled={alreadyExists}>
                          {alreadyExists ? `PR-${num} (already added)` : `PR-${num}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedPr && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        name="title"
                        placeholder="Enter practical title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        placeholder="Brief description of the practical"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
                      <textarea
                        name="task"
                        placeholder="Define the task for students"
                        value={formData.task}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theory</label>
                      <textarea
                        name="theory"
                        placeholder="Background theory or concepts"
                        value={formData.theory}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                      >
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C++">C++</option>
                        <option value="C">C / OS</option>
                        <option value="SQL">SQL</option>
                        <option value="OLAP">OLAP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sample Code</label>
                      <textarea
                        name="sample_code"
                        placeholder="// Add sample code here..."
                        value={formData.sample_code}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none font-mono text-sm bg-gray-50"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Save PR-{selectedPr}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
