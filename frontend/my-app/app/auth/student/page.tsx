"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
export const dynamic = "force-dynamic";

/* =======================
   STUDENT AUTH PAGE
   Login first by default
   Signup only via button
======================= */

export default function StudentAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode"); // ?mode=signup
  const [isSignup, setIsSignup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    prn: "",
    roll: "",
    semester: "",
  });

  /* =======================
     FORCE LOGIN FIRST
  ======================= */
  useEffect(() => {
    if (mode === "signup") {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }
  }, [mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =======================
     SUBMIT HANDLER
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isSignup
        ? "http://localhost:5000/api/auth/student/signup"
        : "http://localhost:5000/api/auth/student/login";

      const body = isSignup
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            prn: formData.prn,
            roll: formData.roll,
            semester: formData.semester,
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      /* ===== SIGNUP SUCCESS ===== */
      if (isSignup) {
        alert("Signup successful. Please login.");
        router.push("/auth/student"); // back to login
        return;
      }

      /* ===== LOGIN SUCCESS ===== */
      if (!data.session?.access_token) {
        throw new Error("Login token not returned");
      }

      localStorage.setItem("student_token", data.session.access_token);
      localStorage.setItem("student_logged_in", "true");

      const profileRes = await fetch(
        "http://localhost:5000/api/auth/student/me",
        {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }
      );

      const profile = await profileRes.json();
      localStorage.setItem("student_data", JSON.stringify(profile));

      router.push("/dashboard/student");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <main className="min-h-screen bg-slate-100">
      {/* ===== NAVBAR ===== */}
      <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">
              Government College of Engineering, Chandrapur
            </h1>
            <p className="text-sm text-slate-300">
              Virtual Coding Lab – Computer Science & Engineering
            </p>
          </div>

          <button
            onClick={() => router.push("/auth/student?mode=signup")}
            className="border border-white/30 px-4 py-2 rounded-md text-sm hover:bg-white/10 transition"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* ===== CONTENT ===== */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6 py-16">
        {/* LEFT IMAGE */}
        <div className="hidden md:flex justify-center">
          <Image
            src="/student.webp"
            alt="Student"
            width={320}
            height={320}
            className="opacity-90"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {isSignup ? "Student Signup" : "Student Login"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            CodeLab – Virtual Coding Laboratory
          </p>

          {error && (
            <p className="text-sm text-red-600 mb-4 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600"
                />

                <input
                  name="prn"
                  placeholder="PRN Number"
                  value={formData.prn}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <input
                  name="roll"
                  placeholder="Roll Number"
                  value={formData.roll}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-slate-600">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              onClick={() =>
                router.push(
                  isSignup
                    ? "/auth/student"
                    : "/auth/student?mode=signup"
                )
              }
              className="text-blue-700 font-medium hover:underline"
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
