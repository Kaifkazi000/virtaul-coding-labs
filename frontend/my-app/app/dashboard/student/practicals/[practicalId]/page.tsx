"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentPracticalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const practicalId = params.practicalId as string;

  const [practical, setPractical] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPractical = async () => {
      try {
        const token = localStorage.getItem("student_token");

        if (!token) {
          router.push("/auth/student");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/practicals/${practicalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        console.log("Practical detail response:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to load practical");
        }

        setPractical(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPractical();
  }, [practicalId, router]);

  if (loading) {
    return (
      <p className="p-6 text-gray-500">Loading practical...</p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-red-600">{error}</p>
    );
  }

  if (!practical) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE – PRACTICAL CONTENT */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-2">
            PR-{practical.pr_no}: {practical.title}
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            Language: {practical.language}
          </p>

          {practical.description && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Description</h2>
              <p className="text-gray-700">
                {practical.description}
              </p>
            </section>
          )}

          {practical.task && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Task</h2>
              <p className="text-gray-700">{practical.task}</p>
            </section>
          )}

          {practical.theory && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Theory</h2>
              <p className="text-gray-700">
                {practical.theory}
              </p>
            </section>
          )}

          {practical.sample_code && (
            <section className="mb-4">
              <h2 className="font-semibold mb-1">Sample Code</h2>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {practical.sample_code}
              </pre>
            </section>
          )}

          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Back to Practicals
          </button>
        </div>

        {/* RIGHT SIDE – COMPILER PLACEHOLDER */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="font-semibold mb-2">
              Compiler (Coming Soon)
            </p>
            <p className="text-sm">
              Code execution will be enabled here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
