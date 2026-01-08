"use client";

import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-6">Login as</h1>

        <button
          onClick={() => router.push("/auth/student")}
          className="w-full mb-3 bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          Student
        </button>

        <button
          onClick={() => router.push("/auth/teacher")}
          className="w-full border border-black text-black py-2 rounded-md hover:bg-black hover:text-white"
        >
          Teacher
        </button>
      </div>
    </main>
  );
}
