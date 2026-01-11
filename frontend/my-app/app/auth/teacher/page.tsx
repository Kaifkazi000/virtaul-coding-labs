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
        "http://localhost:5000/api/auth/teacher/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      console.log("TEACHER LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 🔥 THIS IS THE CRITICAL LINE (MISSING BEFORE)
      if (!data.session || !data.session.access_token) {
        throw new Error("Teacher token not returned from backend");
      }

      // ✅ SAVE TOKEN CORRECTLY
      localStorage.setItem(
        "teacher_token",
        data.session.access_token
      );

      localStorage.setItem("teacher_logged_in", "true");

      // Optional
      localStorage.setItem(
        "teacher_data",
        JSON.stringify(data.user || {})
      );

      // ✅ Redirect AFTER token is saved
      router.push("/dashboard/teacher");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold text-center mb-4">
          Teacher Login
        </h1>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-3 py-2 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
