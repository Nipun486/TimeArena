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

  useEffect(() => {
    if (!showCreateForm) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCreateForm(false);
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [showCreateForm]);

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
            <h1 className="text-4xl font-bold tracking-tight text-white">My Tasks</h1>
            <p className="text-gray-400 text-sm mt-1">
              {tasks?.length ?? 0} tasks total
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className={
              showCreateForm
                ? "bg-[#1b2437] hover:bg-[#25304a] border border-[#2e3d5e] text-white font-medium px-5 py-2.5 rounded-xl"
                : "bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl"
            }
          >
            {showCreateForm ? "✕ Cancel" : "+ Add New Task"}
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((status) => {
              const isActive = (filters?.status ?? "") === status;
              return (
                <button
                  key={`status-${status || "all"}`}
                  type="button"
                  onClick={() => handleStatusFilter(status)}
                  className={
                    isActive
                      ? "bg-blue-600/20 border border-blue-500/50 text-blue-300 font-medium px-3.5 py-1 rounded-full text-xs"
                      : "bg-[#111a2d] border border-[#1f2b45] text-gray-400 hover:bg-[#182238] font-medium px-3.5 py-1 rounded-full text-xs"
                  }
                >
                  {formatStatusLabel(status)}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap">
            {difficultyOptions.map((difficulty) => {
              const isActive = (filters?.difficulty ?? "") === difficulty;
              return (
                <button
                  key={`difficulty-${difficulty || "all"}`}
                  type="button"
                  onClick={() => handleDifficultyFilter(difficulty)}
                  className={
                    isActive
                      ? "bg-blue-600/20 border border-blue-500/50 text-blue-300 font-medium px-3.5 py-1 rounded-full text-xs"
                      : "bg-[#111a2d] border border-[#1f2b45] text-gray-400 hover:bg-[#182238] font-medium px-3.5 py-1 rounded-full text-xs"
                  }
                >
                  {formatDifficultyLabel(difficulty)}
                </button>
              );
            })}
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="h-52 bg-[#10182c] rounded-2xl animate-pulse border border-[#1f2b45]"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>

      {showCreateForm ? (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[86vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border border-b-0 border-[#243252] rounded-t-2xl bg-[#101a2e]">
              <h2 className="text-lg font-semibold text-white">Create New Task</h2>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white text-xl leading-none"
                aria-label="Close create task modal"
              >
                ×
              </button>
            </div>
            <TaskForm />
          </div>
        </div>
      ) : null}
    </ProtectedRoute>
  );
}
