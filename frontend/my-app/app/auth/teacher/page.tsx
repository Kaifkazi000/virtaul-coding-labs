"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/teacher/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.session?.access_token) {
        throw new Error("Teacher token not returned from backend");
      }

      localStorage.setItem("teacher_token", data.session.access_token);
      localStorage.setItem("teacher_logged_in", "true");
      localStorage.setItem("teacher_data", JSON.stringify(data.user || {}));

      router.push("/dashboard/teacher");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-[#cfd6df] border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/clg.png"
              alt="College Logo"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Government College of Engineering, Chandrapur
              </h1>
              <p className="text-sm text-slate-700">
                A Virtual Lab for Computer Science & Engineering
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-sm font-medium text-slate-800">
            <button onClick={() => router.push("/")}>Home</button>
            <button>Quiz</button>
            <button>Assignment List</button>
            <button className="text-yellow-600 font-semibold">Login</button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* ===== LEFT : TEACHER IMAGE ===== */}
        <div className="flex justify-center">
          <img
            src="/teacher.webp"
            alt="Teacher Illustration"
            className="w-[320px] md:w-[380px] opacity-95"
          />
        </div>

        {/* ===== RIGHT : LOGIN FORM ===== */}
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-semibold text-slate-900 mb-8">
            Teacher Login
          </h2>

          {error && (
            <p className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              className="w-full mb-5 px-4 py-3 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full mb-8 px-4 py-3 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
