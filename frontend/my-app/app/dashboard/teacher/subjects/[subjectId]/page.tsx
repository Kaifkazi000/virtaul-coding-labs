"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherSubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<any>(null);
  const [selectedPr, setSelectedPr] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
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

  // 🔐 Fetch subject info
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
          router.push("/auth/teacher");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/subjects/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load subject");
        }

        setSubject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
            subject_id: subjectId,
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
        throw new Error(data.message || "Failed to add practical");
      }

      setSuccess(`PR-${selectedPr} added successfully`);

      // reset form
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

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (error && !subject) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Subject Info */}
        <h1 className="text-2xl font-semibold mb-1">
          {subject.name}
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Code: {subject.code}
        </p>

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
          {Array.from({ length: 10 }, (_, i) => i + 1).map(
            (num) => (
              <option key={num} value={num}>
                PR-{num}
              </option>
            )
          )}
        </select>

        {/* Practical Form */}
        {selectedPr && (
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-red-600 text-sm mb-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 text-sm mb-2">
                {success}
              </p>
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
