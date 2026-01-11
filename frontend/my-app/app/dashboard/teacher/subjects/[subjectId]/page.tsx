"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherSubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<any>(null);
  const [practicals, setPracticals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedPr, setSelectedPr] = useState<number | "">("");
  const [activeTab, setActiveTab] = useState<"add" | "review">("add");
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
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
          "http://localhost:5000/api/subject-instances/teacher",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
        const practicalsRes = await fetch(
          `http://localhost:5000/api/practicals/teacher/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const practicalsData = await practicalsRes.json();

        if (practicalsRes.ok) {
          setPracticals(practicalsData.sort((a: any, b: any) => a.pr_no - b.pr_no));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectId, router]);

  // Fetch submissions when review tab is active
  useEffect(() => {
    if (activeTab === "review" && subjectId) {
      fetchSubmissions();
    }
  }, [activeTab, subjectId]);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(
        `http://localhost:5000/api/submissions/teacher/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSubmissions(false);
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
        "http://localhost:5000/api/practicals",
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

      // Refresh practicals list
      const practicalsRes = await fetch(
        `http://localhost:5000/api/practicals/teacher/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const practicalsData = await practicalsRes.json();
      if (practicalsRes.ok) {
        setPracticals(practicalsData.sort((a: any, b: any) => a.pr_no - b.pr_no));
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        task: "",
        theory: "",
        sample_code: "",
        language: "Python",
      });
      setSelectedPr("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReview = async (submissionId: string, action: "approve" | "reject", feedback: string = "") => {
    try {
      const token = localStorage.getItem("teacher_token");

      const res = await fetch(
        `http://localhost:5000/api/submissions/${submissionId}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            feedback,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to review submission");
      }

      setSuccess(`Submission ${action}d successfully`);
      fetchSubmissions(); // Refresh submissions
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
        <h1 className="text-2xl font-semibold mb-1">
          {subject.subject_name}
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Code: {subject.subject_code} | Semester: {subject.semester}
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("add")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "add"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Add Practicals
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "review"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Review Submissions ({submissions.length})
          </button>
        </div>

        {/* Add Practical Tab */}
        {activeTab === "add" && (
          <div>
            {/* Existing Practicals List */}
            {practicals.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Existing Practicals</h2>
                <ul className="space-y-2">
                  {practicals.map((pr) => (
                    <li
                      key={pr.id}
                      className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
                    >
                      <span className="font-medium">
                        PR-{pr.pr_no}: {pr.title}
                      </span>
                      <span className="text-sm text-gray-600">
                        {pr.language}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  PR-{num}
                </option>
              ))}
            </select>

            {/* Practical Form */}
            {selectedPr && (
              <form onSubmit={handleSubmit}>
                {error && (
                  <p className="text-red-600 text-sm mb-2">{error}</p>
                )}
                {success && (
                  <p className="text-green-600 text-sm mb-2">{success}</p>
                )}

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
                  <option value="SQL">SQL</option>
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

        {/* Review Submissions Tab */}
        {activeTab === "review" && (
          <div>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm mb-4">{success}</p>
            )}

            {loadingSubmissions ? (
              <p className="text-gray-500">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="text-gray-500">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">
                          {submission.student?.name || "Unknown Student"}
                        </p>
                        <p className="text-sm text-gray-600">
                          PRN: {submission.student?.prn} | Roll: {submission.student?.roll}
                        </p>
                        <p className="text-sm text-gray-600">
                          PR-{submission.pr_no}: {submission.practical?.title}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          submission.submission_status === "approved"
                            ? "bg-green-100 text-green-800"
                            : submission.submission_status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {submission.submission_status.charAt(0).toUpperCase() +
                          submission.submission_status.slice(1)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium mb-1">Code:</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded-md text-sm overflow-x-auto">
                        {submission.code}
                      </pre>
                    </div>

                    {submission.output && (
                      <div className="mb-3">
                        <p className="font-medium mb-1">Execution Output:</p>
                        <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                          {submission.output}
                        </pre>
                      </div>
                    )}

                    {submission.teacher_feedback && (
                      <div className="mb-3 p-2 bg-blue-50 rounded-md">
                        <p className="text-sm">
                          <strong>Your Feedback:</strong> {submission.teacher_feedback}
                        </p>
                      </div>
                    )}

                    {submission.submission_status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const feedback = prompt("Enter feedback (optional):");
                            handleReview(submission.id, "approve", feedback || "");
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const feedback = prompt("Enter feedback (optional):");
                            handleReview(submission.id, "reject", feedback || "");
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="mt-6 text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
