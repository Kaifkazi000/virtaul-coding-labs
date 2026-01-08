"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("teacher_logged_in");
    const teacherData = localStorage.getItem("teacher_data");

    if (!loggedIn || !teacherData) {
      router.push("/auth/teacher");
      return;
    }

    setTeacher(JSON.parse(teacherData));
  }, [router]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("teacher_token"); // stored during login

      const res = await fetch("http://localhost:5000/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: subjectName,
          code: subjectCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add subject");
      }

      setMessage("Subject added successfully ✅");
      setSubjectName("");
      setSubjectCode("");
      setShowForm(false);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Teacher Dashboard
        </h1>

        <p className="text-gray-600 mb-6">
          Welcome, <b>{teacher.name}</b> ({teacher.role})
        </p>

        {/* Add Subject Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          + Add Subject
        </button>

        {/* Add Subject Form */}
        {showForm && (
          <form
            onSubmit={handleAddSubject}
            className="border p-4 rounded-md mb-4"
          >
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Subject Name
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Subject"}
            </button>
          </form>
        )}

        {message && (
          <p className="text-sm text-center text-green-600">{message}</p>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("teacher_logged_in");
            localStorage.removeItem("teacher_data");
            localStorage.removeItem("teacher_token");
            router.push("/auth/teacher");
          }}
          className="mt-6 text-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
