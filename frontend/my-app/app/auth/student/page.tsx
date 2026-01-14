"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

/* ======================================
   PAGE WRAPPER (SERVER COMPONENT)
====================================== */

export const dynamic = "force-dynamic";

export default function StudentAuthPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <StudentAuthClient />
    </Suspense>
  );
}

/* ======================================
   CLIENT COMPONENT (SAME FILE)
====================================== */

function StudentAuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
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
     MODE HANDLING
  ======================= */
  useEffect(() => {
    setIsSignup(mode === "signup");
  }, [mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isSignup
        ? "/api/auth/student/signup"
        : "/api/auth/student/login";

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
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      if (isSignup) {
        alert("Signup successful. Please login.");
        router.push("/auth/student");
        return;
      }

      if (!data.session?.access_token) {
        throw new Error("Login token not returned");
      }

      localStorage.setItem("student_token", data.session.access_token);
      localStorage.setItem("student_logged_in", "true");

      const profileRes = await fetch("/api/auth/student/me", {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

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
      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              Government College of Engineering, Chandrapur
            </h1>
            <p className="text-sm text-slate-300">
              Virtual Coding Lab – CSE
            </p>
          </div>

          <button
            onClick={() => router.push("/auth/student?mode=signup")}
            className="border px-4 py-2 rounded-md text-sm"
          >
            Sign up
          </button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-6 py-16">
        <div className="hidden md:flex justify-center">
          <Image src="/student.webp" alt="Student" width={320} height={320} />
        </div>

        <div className="bg-white rounded-xl shadow p-8 max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold mb-2">
            {isSignup ? "Student Signup" : "Student Login"}
          </h2>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <input name="name" placeholder="Full Name" required
                  value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded" />
                <input name="prn" placeholder="PRN" required
                  value={formData.prn} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded" />
                <input name="roll" placeholder="Roll No" required
                  value={formData.roll} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded" />
                <select name="semester" required
                  value={formData.semester} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded">
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </>
            )}

            <input type="email" name="email" placeholder="Email" required
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 border rounded" />

            <input type="password" name="password" placeholder="Password" required
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-3 border rounded" />

            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded">
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
