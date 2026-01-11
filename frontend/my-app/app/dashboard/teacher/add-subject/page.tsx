"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSubjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    subject_name: "",
    subject_code: "",
    semester: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("teacher_token");
    if (!token) return router.push("/auth/teacher");

    const res = await fetch(
      "http://localhost:5000/api/subject-instances",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_name: form.subject_name,
          subject_code: form.subject_code,
          semester: Number(form.semester),
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    router.push("/dashboard/teacher");
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-sm"
      >
        <h2 className="text-lg font-semibold mb-4">
          Create Subject
        </h2>

        <input
          placeholder="Subject Name"
          className="w-full mb-3 border p-2"
          onChange={(e) =>
            setForm({ ...form, subject_name: e.target.value })
          }
        />

        <input
          placeholder="Subject Code"
          className="w-full mb-3 border p-2"
          onChange={(e) =>
            setForm({ ...form, subject_code: e.target.value })
          }
        />

        <input
          placeholder="Semester"
          type="number"
          className="w-full mb-4 border p-2"
          onChange={(e) =>
            setForm({ ...form, semester: e.target.value })
          }
        />

        <button className="bg-black text-white w-full py-2 rounded">
          Create Subject
        </button>
      </form>
    </main>
  );
}
