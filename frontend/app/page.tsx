import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-cyan-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Mini-Jira
        </h1>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}