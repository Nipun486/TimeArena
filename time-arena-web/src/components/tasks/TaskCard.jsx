"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTaskStore } from "../../store/taskStore.js";

const capitalizeFirst = (value = "") => {
  const s = String(value);
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const titleCaseFromKebab = (value = "") => {
  const s = String(value).replace(/-/g, " ").trim();
  if (!s) return "";
  return s
    .split(/\s+/)
    .map((w) => capitalizeFirst(w.toLowerCase()))
    .join(" ");
};

/**
 * Renders a summary card for a single task.
 *
 * @param {{ task?: {
 *   _id?: string,
 *   title?: string,
 *   difficulty?: "easy"|"medium"|"hard"|string,
 *   status?: "pending"|"in-progress"|"completed"|"failed"|string,
 *   completionPercentage?: number,
 *   estimatedTime?: number,
 *   createdAt?: string|number|Date,
 *   finalScore?: number,
 *   xpAwarded?: number
 * } }} props
 */
export function TaskCard({ task }) {
  const router = useRouter();

  const { removeTask, isSubmitting } = useTaskStore((state) => ({
    removeTask: state.removeTask,
    isSubmitting: state.isSubmitting,
  }));

  const difficulty = String(task?.difficulty ?? "easy").toLowerCase();
  const status = String(task?.status ?? "pending").toLowerCase();

  const completionPercentage = useMemo(() => {
    const n = Number(task?.completionPercentage ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [task?.completionPercentage]);

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

  const progressBarColor =
    completionPercentage === 100
      ? "bg-green-500"
      : completionPercentage >= 50
        ? "bg-blue-500"
        : completionPercentage >= 1
          ? "bg-yellow-500"
          : "bg-red-500";

  const formattedDate = useMemo(() => {
    const raw = task?.createdAt;
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [task?.createdAt]);

  const taskId = task?._id;
  const canDelete = status !== "in-progress";

  const handleDelete = async () => {
    if (!taskId) return;
    await removeTask(taskId);
  };

  const handlePrefetch = () => {
    if (!taskId) return;
    router?.prefetch?.(`/tasks/${taskId}`);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-colors duration-200 flex flex-col gap-3">
      {/* Row 1 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`${difficultyColors?.[difficulty] ?? "bg-gray-700 text-gray-300"} text-xs font-medium px-2.5 py-1 rounded-full`}
          >
            {capitalizeFirst(difficulty)}
          </span>
          <span
            className={`${statusColors?.[status] ?? "bg-gray-700 text-gray-300"} text-xs font-medium px-2.5 py-1 rounded-full`}
          >
            {titleCaseFromKebab(status)}
          </span>
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={!!isSubmitting}
            className="text-gray-500 hover:text-red-400 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete task"
            title="Delete task"
          >
            🗑
          </button>
        ) : null}
      </div>

      {/* Row 2 */}
      <div className="mt-3 text-lg font-bold text-white">
        {task?.title ?? "Untitled Task"}
      </div>

      {/* Row 3 */}
      <div>
        <div className="text-xs text-gray-400 mb-1">
          {completionPercentage}% complete
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`${progressBarColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Row 4 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-xs text-gray-400">
          ⏱ {task?.estimatedTime ?? 0} min
        </div>
        <div className="text-xs text-gray-400">
          📅 {formattedDate || "—"}
        </div>
        {status === "completed" && task?.finalScore != null ? (
          <>
            <div className="text-xs text-yellow-300">
              ⭐ {task?.finalScore} pts
            </div>
            <div className="text-xs text-purple-300">
              ✨ {task?.xpAwarded ?? 0} XP
            </div>
          </>
        ) : null}
      </div>

      {/* Row 5 */}
      {taskId ? (
        <Link
          href={`/tasks/${taskId}`}
          onMouseEnter={handlePrefetch}
          className="block text-center mt-4 py-2 rounded-lg bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium"
        >
          View Task →
        </Link>
      ) : (
        <div className="block text-center mt-4 py-2 rounded-lg bg-gray-700 text-gray-500 text-sm font-medium cursor-not-allowed">
          View Task →
        </div>
      )}
    </div>
  );
}

export default TaskCard;
