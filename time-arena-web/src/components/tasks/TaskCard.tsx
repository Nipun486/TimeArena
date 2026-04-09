"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types";

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
 * Renders a summary card for a single task.
 */
export function TaskCard({ task }: { task?: Task }) {
  const router = useRouter();

  const { removeTask, isSubmitting } = useTaskStore(
    useShallow((state) => ({
      removeTask: state.removeTask,
      isSubmitting: state.isSubmitting,
    }))
  );

  const difficulty = String(task?.difficulty ?? "easy").toLowerCase();
  const status = String(task?.status ?? "pending").toLowerCase();

  const completionPercentage = useMemo(() => {
    const n = Number(task?.completionPercentage ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [task?.completionPercentage]);

  const difficultyColors: Record<string, string> = useMemo(
    () => ({
      easy: "bg-green-500/15 text-green-300 border border-green-500/30",
      medium: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
      hard: "bg-red-500/15 text-red-300 border border-red-500/30",
    }),
    []
  );

  const statusColors: Record<string, string> = useMemo(
    () => ({
      pending: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
      "in-progress": "bg-blue-500/15 text-blue-300 border border-blue-500/30",
      completed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
      failed: "bg-red-500/15 text-red-300 border border-red-500/30",
    }),
    []
  );

  const progressBarColor =
    completionPercentage === 100
      ? "bg-emerald-400"
      : completionPercentage >= 50
        ? "bg-cyan-400"
        : completionPercentage >= 1
          ? "bg-blue-400"
          : "bg-slate-600";

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
    router.prefetch(`/tasks/${taskId}`);
  };

  return (
    <div className="bg-[#0f1729] rounded-2xl p-5 border border-[#1f2b45] hover:border-[#305086] transition-colors duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`${difficultyColors[difficulty] ?? "bg-slate-500/15 text-slate-300 border border-slate-500/30"} text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide`}
          >
            {capitalizeFirst(difficulty)}
          </span>
          <span
            className={`${statusColors[status] ?? "bg-slate-500/15 text-slate-300 border border-slate-500/30"} text-[10px] font-semibold px-2 py-0.5 rounded-full`}
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

      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {task?.title ?? "Untitled Task"}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-[#1a2540] rounded-full h-2">
          <div
            className={`${progressBarColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-gray-400">
          ⏱ {task?.estimatedTime ?? 0}m
        </div>
        <div className="text-xs text-gray-400">
          📅 {formattedDate || "—"}
        </div>
      </div>

      {status === "completed" && task?.finalScore != null ? (
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-xs text-yellow-300">🏅 {task?.finalScore} pts</div>
          <div className="text-xs text-purple-300">⚡ {task?.xpAwarded ?? 0} XP</div>
        </div>
      ) : null}

      {taskId ? (
        <Link
          href={`/tasks/${taskId}`}
          onMouseEnter={handlePrefetch}
          className="block text-right mt-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 font-medium"
        >
          View Task →
        </Link>
      ) : (
        <div className="block text-right mt-2 text-sm text-gray-500 font-medium cursor-not-allowed">
          View Task →
        </div>
      )}
    </div>
  );
}

export default TaskCard;
