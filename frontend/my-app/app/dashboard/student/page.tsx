"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("student_logged_in");
    const storedStudent = localStorage.getItem("student_data");

    if (!isLoggedIn || !storedStudent) {
      router.push("/auth/student");
      return;
    }

    setStudent(JSON.parse(storedStudent));
  }, [router]);

  if (!student) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Student Dashboard
        </h1>

        <div className="space-y-2 text-gray-700">
          <p><b>Name:</b> {student.name}</p>
          <p><b>Email:</b> {student.email}</p>
          <p><b>PRN:</b> {student.prn}</p>
          <p><b>Roll No:</b> {student.roll}</p>
          <p><b>Department:</b> {student.department}</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("student_logged_in");
            localStorage.removeItem("student_data");
            router.push("/auth/student");
          }}
          className="mt-5 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
