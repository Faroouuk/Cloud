"use client";

import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-cyan-300">

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[350px] text-center">

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Welcome
        </h1>

        <div className="flex flex-col gap-4">

          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg transition"
          >
            Register
          </button>

        </div>

      </div>

    </div>
  );
}