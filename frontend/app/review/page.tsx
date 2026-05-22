"use client";

import "@/lib/amplify";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authGet } from "@/lib/api";
import { api, getAuthHeaders } from "@/lib/api";
import { signOut } from "aws-amplify/auth";

type StatusRequest = {
  requestId: string;
  taskId: string;
  taskTitle: string;
  currentStatus: string;
  requestedStatus: string;
  reason: string;
  requestedBy: string;
  requestedRole: string;
  requestState: string;
  reviewReason?: string;
  reviewedAt?: string;
  createdAt: string;
};

export default function ReviewPage() {
  const [requests, setRequests] = useState<StatusRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewReason, setReviewReason] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string>("");

  const fetchRequests = async () => {
    try {
      const response = await authGet("/tasks/status-requests");
      setRequests(response.data);
    } catch (err) {
      setError("Failed to load status requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (
    taskId: string,
    requestId: string,
    action: "approve" | "reject"
  ) => {
    setSubmitting(requestId);

    try {
      const headers = await getAuthHeaders();
      await api.post(
        `/tasks/status-requests/${taskId}/${action}`,
        {
          reviewReason: reviewReason[requestId] || "",
        },
        { headers }
      );
      fetchRequests();
    } catch (err: unknown) {
      console.error("Review action error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to ${action} request: ${message}`);
    } finally {
      setSubmitting("");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) return <div className="p-10">Loading requests...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review Status Requests</h1>
          <p className="text-sm text-gray-500">Approve or reject task status change requests.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Dashboard
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
        {requests.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-gray-600">
            No status requests found.
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.requestId}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{request.taskTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">Task ID: {request.taskId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Requested by {request.requestedBy}</p>
                  <p className="text-xs text-gray-500">Role: {request.requestedRole}</p>
                  <p className="text-xs text-gray-500">State: {request.requestState}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-600">
                <p>Current status: <strong>{request.currentStatus}</strong></p>
                <p>Requested status: <strong>{request.requestedStatus}</strong></p>
                {request.reason && <p>Reason: {request.reason}</p>}
                {request.reviewReason && <p>Review note: {request.reviewReason}</p>}
                {request.reviewedAt && <p>Reviewed at: {new Date(request.reviewedAt).toLocaleString()}</p>}
              </div>

              {request.requestState === "Pending" && (
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <textarea
                    className="border rounded p-3 min-h-[100px]"
                    placeholder="Review note (optional)"
                    value={reviewReason[request.requestId] || ""}
                    onChange={(e) =>
                      setReviewReason((prev) => ({
                        ...prev,
                        [request.requestId]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={() => handleReview(request.taskId, request.requestId, "approve")}
                      disabled={submitting === request.requestId}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(request.taskId, request.requestId, "reject")}
                      disabled={submitting === request.requestId}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
