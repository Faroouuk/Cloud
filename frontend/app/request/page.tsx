"use client";

import "@/lib/amplify";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authGet } from "@/lib/api";
import { api, getAuthHeaders } from "@/lib/api";
import { signOut } from "aws-amplify/auth";

const STATUSES = [
  "To Do",
  "In Progress",
  "In Review",
  "Done",
];

type Task = {
  taskId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  teamId: string;
  assigneeId: string;
  createdBy: string;
  createdAt: string;
};

export default function RequestPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState<Record<string, string>>({});
  const [requestReason, setRequestReason] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string>("");

  const fetchTasks = async () => {
    try {
      const response = await authGet("/tasks");
      setTasks(response.data);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRequest = async (task: Task) => {
    const requestedStatus = requestStatus[task.taskId] || "";
    const reason = requestReason[task.taskId] || "";

    if (!requestedStatus) {
      alert("Select a requested status.");
      return;
    }

    if (!task.taskId) {
      alert("Unable to submit request: missing task ID.");
      return;
    }

    setSubmitting(task.taskId);

    try {
      const headers = await getAuthHeaders();
      const endpoint = `/tasks/${encodeURIComponent(task.taskId)}/request-status-change`;
      console.log("Submitting status request to", endpoint, { requestedStatus, reason });
      await api.post(
        endpoint,
        {
          requestedStatus,
          reason,
        },
        { headers }
      );

      alert("Status change request submitted.");
      setRequestStatus((prev) => ({
        ...prev,
        [task.taskId]: "",
      }));
      setRequestReason((prev) => ({
        ...prev,
        [task.taskId]: "",
      }));
    } catch (err: unknown) {
      console.error("Request submission error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Unknown error";
      alert(`Failed to submit request: ${message}`);
    } finally {
      setSubmitting("");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) return <div className="p-10">Loading tasks...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Request Status Change</h1>
          <p className="text-sm text-gray-500">Employees can request a task status change here.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-8 grid gap-6">
        {tasks.map((task) => {
          const availableStatuses = STATUSES.filter(
            (status) => status !== task.status
          );

          return (
            <div
              key={task.taskId}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{task.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {task.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Request new status
                  </label>
                  <select
                    className="mt-2 w-full border rounded p-2"
                    value={requestStatus[task.taskId] || ""}
                    onChange={(e) =>
                      setRequestStatus((prev) => ({
                        ...prev,
                        [task.taskId]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select a status</option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason (optional)
                  </label>
                  <textarea
                    className="mt-2 w-full border rounded p-2 min-h-[90px]"
                    placeholder="Why should the status change?"
                    value={requestReason[task.taskId] || ""}
                    onChange={(e) =>
                      setRequestReason((prev) => ({
                        ...prev,
                        [task.taskId]: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <button
                onClick={() => handleRequest(task)}
                disabled={submitting === task.taskId}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting === task.taskId
                  ? "Submitting..."
                  : "Submit Request"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
