"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useTaskStore } from "@/store/taskStore";
import { useTask } from "@/hooks/useTask";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Timer from "@/components/timer/Timer";
import SubtaskList from "@/components/tasks/SubtaskList";
import ScoreDisplay from "@/components/tasks/ScoreDisplay";

const capitalizeFirst = (value = ""): string => {
  const s = String(value);
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const titleCaseFromKebab = (value = ""): string => {
  const s = String(value).replace(/-/g, " ").trim();
  if (!s) return "";
  return s
    .split(/\s+/)
    .map((w) => capitalizeFirst(w.toLowerCase()))
    .join(" ");
};

/**
 * Task detail page showing full task info, timer, subtasks, and completion score.
 */
export default function TaskDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;

  const { currentTask, isLoading, error, loadTaskById } = useTaskStore(
    useShallow((state) => ({
      currentTask: state.currentTask,
      isLoading: state.isLoading,
      error: state.error,
      loadTaskById: state.loadTaskById,
    }))
  );

  const {
    handleStartTask,
    handleCompleteTask,
    handleDeleteTask,
    isSubmitting,
    showScore,
    scoreResult,
    actionError,
  } = useTask();

  useEffect(() => {
    if (!id) return;
    loadTaskById(id);
  }, [id, loadTaskById]);

  const status = String(currentTask?.status ?? "pending").toLowerCase();
  const difficulty = String(currentTask?.difficulty ?? "easy").toLowerCase();

  const isTaskActive = currentTask?.status === "in-progress";
  const isTaskDone =
    currentTask?.status === "completed" || currentTask?.status === "failed";
  const timerDisabled = !isTaskActive;

  const difficultyColors = useMemo(
    () => ({
      easy: "bg-green-900 text-green-300",
      medium: "bg-yellow-900 text-yellow-300",
      hard: "bg-red-900 text-red-300",
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      pending: "bg-gray-700 text-gray-300",
      "in-progress": "bg-blue-900 text-blue-300",
      completed: "bg-green-900 text-green-300",
      failed: "bg-red-900 text-red-300",
    }),
    []
  );

  const handleTimerComplete = () => {
    if (!currentTask?._id) return;
    handleCompleteTask(currentTask._id);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-1/2 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
            <div className="h-64 w-full bg-gray-700 rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 rounded-xl px-6 py-4 text-red-300">
            <div className="font-medium">Failed to load task</div>
            <div className="text-sm opacity-90 wrap-break-word">
              {String(error)}
            </div>
          </div>
        ) : !currentTask ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center gap-3">
            <div className="text-xl font-bold text-white">Task not found</div>
            <Link
              href="/tasks"
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Tasks
            </Link>
          </div>
        ) : (
          <>
            {showScore ? (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl">
                  <ScoreDisplay scoreResult={scoreResult} task={currentTask} />
                </div>
              </div>
            ) : null}

            <Link
              href="/tasks"
              className="text-gray-400 hover:text-white text-sm mb-6 inline-block"
            >
              ← Back to Tasks
            </Link>

            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="text-2xl font-bold text-white">
                  {currentTask?.title ?? "Untitled Task"}
                </div>
                {currentTask?.description ? (
                  <div className="text-gray-400 mt-2">
                    {currentTask.description}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`${difficultyColors[difficulty as keyof typeof difficultyColors] ?? "bg-gray-700 text-gray-300"} text-xs font-medium px-2.5 py-1 rounded-full`}
                >
                  {capitalizeFirst(difficulty)}
                </span>
                <span
                  className={`${statusColors[status as keyof typeof statusColors] ?? "bg-gray-700 text-gray-300"} text-xs font-medium px-2.5 py-1 rounded-full`}
                >
                  {titleCaseFromKebab(status)}
                </span>
              </div>
            </div>

            <div className="flex gap-6 mt-4 flex-wrap">
              <div className="text-gray-400 text-sm">
                ⏱ {currentTask?.estimatedTime ?? 0} min estimated
              </div>
              <div className="text-gray-400 text-sm">
                📊 {currentTask?.basePoints ?? 0} base points
              </div>
              <div className="text-gray-400 text-sm">
                🎯 {currentTask?.completionPercentage ?? 0}% complete
              </div>
            </div>

            <div className="flex gap-3 mt-6 flex-wrap items-center">
              {status === "pending" && currentTask._id ? (
                <button
                  type="button"
                  onClick={() => handleStartTask(currentTask._id!)}
                  disabled={!!isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ▶ Start Task
                </button>
              ) : null}

              {!isTaskDone && status !== "in-progress" && currentTask._id ? (
                <button
                  type="button"
                  onClick={() => handleDeleteTask(currentTask._id!)}
                  disabled={!!isSubmitting}
                  className="bg-gray-700 hover:bg-red-900 text-gray-400 hover:text-red-400 font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗑 Delete Task
                </button>
              ) : null}
            </div>

            {actionError ? (
              <div className="text-red-400 text-sm mt-2">
                {String(actionError)}
              </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Timer
                estimatedTime={currentTask.estimatedTime}
                onComplete={handleTimerComplete}
                disabled={timerDisabled}
              />

              {currentTask._id ? (
                <SubtaskList taskId={currentTask._id} disabled={isTaskDone} />
              ) : null}
            </div>

            {status === "completed" ? (
              <div className="bg-gray-800 rounded-xl p-6 mt-6 border border-green-700">
                <div className="text-green-400 font-bold text-lg mb-4">
                  🏆 Task Completed!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-white font-medium">
                    Final Score:{" "}
                    <span className="text-yellow-300 font-bold">
                      {currentTask?.finalScore ?? 0} pts
                    </span>
                  </div>
                  <div className="text-white font-medium">
                    XP Awarded:{" "}
                    <span className="text-purple-300 font-bold">
                      +{currentTask?.xpAwarded ?? 0} XP
                    </span>
                  </div>
                </div>

                <div className="text-gray-400 text-sm mt-3">
                  Actual time: {currentTask?.actualTimeSpent ?? 0} min
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
