"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";

/**
 * Tasks page showing full task list, filters, and create task flow.
 */
export default function TasksPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { tasks, isLoading, error, loadTasks, setFilters, filters } =
    useTaskStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusFilter = (status: string) => {
    setFilters({ status });
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setFilters({ difficulty });
  };

  const statusOptions = ["", "pending", "in-progress", "completed", "failed"];
  const difficultyOptions = ["", "easy", "medium", "hard"];

  const formatStatusLabel = (status: string) => {
    if (!status) return "All Status";
    return status
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatDifficultyLabel = (difficulty: string) => {
    if (!difficulty) return "All Difficulty";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <p className="text-gray-400 text-sm mt-1">
              {tasks?.length ?? 0} tasks total
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className={
              showCreateForm
                ? "bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-xl"
                : "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl"
            }
          >
            {showCreateForm ? "✕ Cancel" : "＋ New Task"}
          </button>
        </div>

        {showCreateForm ? (
          <div className="mb-8">
            <TaskForm />
          </div>
        ) : null}

        <div className="flex gap-3 flex-wrap mb-6">
          {statusOptions.map((status) => {
            const isActive = (filters?.status ?? "") === status;
            return (
              <button
                key={`status-${status || "all"}`}
                type="button"
                onClick={() => handleStatusFilter(status)}
                className={
                  isActive
                    ? "bg-blue-600 text-white font-medium px-4 py-2 rounded-xl"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600 font-medium px-4 py-2 rounded-xl"
                }
              >
                {formatStatusLabel(status)}
              </button>
            );
          })}

          {difficultyOptions.map((difficulty) => {
            const isActive = (filters?.difficulty ?? "") === difficulty;
            return (
              <button
                key={`difficulty-${difficulty || "all"}`}
                type="button"
                onClick={() => handleDifficultyFilter(difficulty)}
                className={
                  isActive
                    ? "bg-blue-600 text-white font-medium px-4 py-2 rounded-xl"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600 font-medium px-4 py-2 rounded-xl"
                }
              >
                {formatDifficultyLabel(difficulty)}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="bg-red-900 border border-red-700 rounded-xl px-6 py-4 text-red-300 mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">Failed to load tasks</p>
              <p className="text-sm opacity-90 wrap-break-word">{String(error)}</p>
            </div>
            <button
              type="button"
              onClick={() => loadTasks()}
              className="shrink-0 bg-red-800 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="h-48 bg-gray-800 rounded-xl animate-pulse border border-gray-700"
              />
            ))}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-bold text-white">No tasks yet</div>
            <div className="text-gray-400 text-sm mt-2">
              Create your first task to start scoring!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
