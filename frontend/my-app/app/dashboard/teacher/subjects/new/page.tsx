"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSubjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const token = localStorage.getItem("teacher_token");

    if (!token) {
      router.push("/auth/teacher");
      return;
    }

    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    console.log("CREATE SUBJECT RESPONSE 👉", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to create subject");
    }

    if (!data.subject || !data.subject.id) {
      throw new Error("Subject ID missing in response");
    }

    // ✅ Correct redirect
    router.push(
      `/dashboard/teacher/subjects/${data.subject.id}`
    );
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">
          Add New Subject
        </h1>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Subject Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 border rounded-md"
            required
          />

          <input
            name="code"
            placeholder="Subject Code (e.g. PY)"
            value={formData.code}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 border rounded-md"
            required
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Subject"}
          </button>
        </form>
      </div>
    </main>
  );
}
