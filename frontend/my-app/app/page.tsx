"use client";

import { useState } from "react";

export default function HomePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

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
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold text-center mb-4">
          Student Registration
        </h1>

        <label className="block text-sm font-medium mb-2">
          Student Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          className="w-full mt-4 bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
