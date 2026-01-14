"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentAuthPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(true);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      // ================= SIGNUP =================
      if (isSignup) {
        alert("Signup successful. Please login.");
        setIsSignup(false); // switch to login
        setLoading(false);
        return;
      }

      // ================= LOGIN =================
      // 1️⃣ Save token
      localStorage.setItem(
        "student_token",
        data.session.access_token
      );

      // 2️⃣ Fetch student profile
      const profileRes = await fetch(
        "http://localhost:5000/api/auth/student/me",
        {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }
      );

      const profile = await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(profile.message || "Failed to load profile");
      }

      // 3️⃣ Save session data
      localStorage.setItem("student_data", JSON.stringify(profile));
      localStorage.setItem("student_logged_in", "true");

      router.push("/dashboard/student");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          {isSignup ? "Student Signup" : "Student Login"}
        </h1>

        {error && (
          <p className="mb-3 text-sm text-red-600 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border rounded-md"
                required
              />

              <input
                name="prn"
                placeholder="PRN Number"
                value={formData.prn}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border rounded-md"
                required
              />

              <input
                name="roll"
                placeholder="Roll Number"
                value={formData.roll}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border rounded-md"
                required
              />

              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Semester</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 border rounded-md"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded-md"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Signup"
              : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 font-medium hover:underline"
          >
            {isSignup ? "Login" : "Signup"}
          </button>
        </p>
      </div>
    </main>
  );
}
