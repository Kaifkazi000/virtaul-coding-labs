"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("teacher_token");
      console.log("Teacher token:", token);

      const res = await fetch(
        "/api/subject-instances/teacher",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("STATUS:", res.status);
      console.log("RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.error || data.message || "Unauthorized");
      }

      setSubjects(data);
    } catch (err: any) {
      console.error("FETCH ERROR:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchSubjects();
}, [router]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading teacher dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Teacher Dashboard</h1>

          <button
            onClick={() => router.push("/dashboard/teacher/add-subject")}
            className="bg-black text-white px-4 py-2 rounded"
          >
            + Add Subject
          </button>
        </div>

        {subjects.length === 0 ? (
          <p>No subjects created yet.</p>
        ) : (
          <div className="space-y-3">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{subj.subject_name}</p>
                  <p className="text-sm text-gray-600">
                    Semester: {subj.semester}
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/dashboard/teacher/subjects/${subj.id}`)
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Add Practicals
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
