"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Check auth + load student data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("student_logged_in");
    const storedStudent = localStorage.getItem("student_data");

    if (!isLoggedIn || !storedStudent) {
      router.push("/auth/student");
      return;
    }

    try {
      setStudent(JSON.parse(storedStudent));
    } catch {
      router.push("/auth/student");
    }
  }, [router]);

  // 📚 Fetch subjects
 useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("student_token");

      if (!token) {
        throw new Error("Student token missing");
      }

      const res = await fetch(
        "http://localhost:5000/api/subjects/student",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("Student subjects response:", data);

      if (!res.ok) {
        throw new Error("Failed to fetch subjects");
      }

      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  fetchSubjects();
}, []);


  if (!student) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Student Dashboard
        </h1>

        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 mb-6">
          <p><b>Name:</b> {student.name}</p>
          <p><b>Email:</b> {student.email}</p>
          <p><b>PRN:</b> {student.prn}</p>
          <p><b>Roll No:</b> {student.roll}</p>
          <p><b>Department:</b> {student.department}</p>
        </div>

        {/* Subjects Section */}
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Subjects
        </h2>

        {loadingSubjects ? (
          <p className="text-gray-500">Loading subjects...</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : subjects.length === 0 ? (
          <p className="text-gray-500">
            No subjects added yet by teacher.
          </p>
        ) : (
          <ul className="space-y-3">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="border rounded-md p-4 bg-gray-50"
              >
                <p className="font-semibold">{subject.name}</p>
                <p className="text-sm text-gray-600">
                  Code: {subject.code}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("student_logged_in");
            localStorage.removeItem("student_data");
            localStorage.removeItem("student_token");
            router.push("/auth/student");
          }}
          className="mt-6 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
