"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      alert(data.message);
      setName("");
    } catch (err) {
      alert("Backend not connected");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center px-4">
      
      {/* BIG PROJECT TITLE */}
      <div className="text-center mb-10">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-wide">
          CodeLab
        </h1>
        <p className="mt-4 text-gray-300 text-base md:text-lg">
          Project under development • Target completion: 15th January
        </p>
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-800/80 backdrop-blur p-8 rounded-2xl shadow-xl border border-gray-700"
      >
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Student Registration
        </h2>

        <label className="block text-sm text-gray-300 mb-2">
          Student Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
        />

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          className="w-full mt-6 bg-white text-black py-3 rounded-md font-medium hover:bg-gray-200 transition"
        >
          Submit
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/select-role")}
          className="w-full mt-4 border border-white text-white py-3 rounded-md hover:bg-white hover:text-black transition"
        >
          Login / Signup
        </button>
      </form>
    </main>
  );
}
