"use client";

import "@/lib/amplify";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authGet } from "@/lib/api";
import { api, getAuthHeaders } from "@/lib/api";
import { signOut } from "aws-amplify/auth";

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

const COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState("");

  // New task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [teamId, setTeamId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await authGet("/tasks");
      setTasks(response.data);
    } catch (err) {
      setError("Failed to load tasks");
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await authGet("/protected");
      const user = response.data.user;
      const role =
        user?.["custom:role"] ||
        (user?.["cognito:groups"] || [])[0] ||
        "";
      setUserRole(role);
    } catch (err) {
      setError("Failed to load user info");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUserRole();
      await fetchTasks();
      setLoading(false);
    };

    load();
  }, []);

  const handleCreateTask = async () => {
    try {
      const headers = await getAuthHeaders();
      await api.post("/tasks", {
        title,
        description,
        status: "To Do",
        priority,
        teamId,
        assigneeId,
      }, { headers });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setTeamId("");
      setAssigneeId("");
      setShowForm(false);

      // Refresh tasks
      fetchTasks();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      const headers = await getAuthHeaders();
      await api.put(`/tasks/${task.taskId}`, {
        ...task,
        status: newStatus,
      }, { headers });
      fetchTasks();
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const headers = await getAuthHeaders();
      await api.delete(`/tasks/${taskId}`, { headers });
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getTasksByStatus = (status: string) =>
    tasks.filter((t) => t.status === status);

  const priorityColor = (priority: string) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  if (loading) return <div className="p-10">Loading tasks...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mini-Jira Dashboard</h1>
          {userRole && (
            <p className="text-sm text-gray-500">
              Role: {userRole}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {(userRole === "Manager" || userRole === "Admin") && (
            <>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                + New Task
              </button>
              <Link
                href="/review"
                className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                Review Requests
              </Link>
            </>
          )}
          {userRole === "Employee" && (
            <Link
              href="/request"
              className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700"
            >
              Request Status Change
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white border-b px-8 py-6">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <input
              className="border p-2 rounded col-span-2"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="border p-2 rounded col-span-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              className="border p-2 rounded"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Team ID"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
            <input
              className="border p-2 rounded"
              placeholder="Assignee ID"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            />
            <div className="flex gap-2 col-span-2">
              <button
                onClick={handleCreateTask}
                className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border px-4 py-2 rounded font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-8 grid grid-cols-4 gap-6">
        {COLUMNS.map((col) => (
          <div key={col} className="bg-white rounded-xl shadow-sm border">
            {/* Column Header */}
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">{col}</h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {getTasksByStatus(col).length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="p-3 flex flex-col gap-3 min-h-32">
              {getTasksByStatus(col).length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-4">No tasks</p>
              )}
              {getTasksByStatus(col).map((task) => (
                <div
                  key={task.taskId}
                  className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition"
                >
                  <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                  {task.description && (
                    <p className="text-gray-500 text-xs mt-1">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-400">{task.teamId}</span>
                  </div>
                  {userRole === "Manager" || userRole === "Admin" ? (
                    <select
                      className="mt-2 w-full text-xs border rounded p-1"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                    >
                      {COLUMNS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">
                      Status: {task.status}
                    </p>
                  )}
                  {userRole === "Admin" && (
                    <button
                      onClick={() => handleDeleteTask(task.taskId)}
                      className="mt-2 w-full text-xs bg-red-500 text-white rounded p-2 hover:bg-red-600"
                    >
                      Delete Task
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}