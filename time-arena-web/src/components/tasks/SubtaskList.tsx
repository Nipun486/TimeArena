"use client";

import { useShallow } from "zustand/react/shallow";
import { useTaskStore } from "@/store/taskStore";
import { useTask } from "@/hooks/useTask";

/**
 * Renders an interactive subtask checklist for the current task.
 */
export function SubtaskList({
  taskId,
  disabled,
}: {
  taskId: string;
  disabled: boolean;
}) {
  const { currentTask } = useTaskStore(
    useShallow((state) => ({
      currentTask: state.currentTask,
    }))
  );

  const { handleToggleSubtask } = useTask();

  const completionPercentage = currentTask?.completionPercentage ?? 0;

  const progressBarColor =
    completionPercentage === 100
      ? "bg-green-500"
      : completionPercentage >= 50
        ? "bg-blue-500"
        : completionPercentage >= 1
          ? "bg-yellow-500"
          : "bg-red-500";

  const completionFactorText =
    completionPercentage === 100
      ? "✅ Full points — 1.0× factor"
      : completionPercentage >= 50
        ? "⚡ Half points — 0.5× factor"
        : completionPercentage >= 1
          ? "⚠️ Minimal points — 0.2× factor"
          : "❌ Penalty — −0.5× factor";

  const completionFactorColor =
    completionPercentage === 100
      ? "text-green-400"
      : completionPercentage >= 50
        ? "text-blue-400"
        : completionPercentage >= 1
          ? "text-yellow-400"
          : "text-red-400";

  const subtasks = Array.isArray(currentTask?.subtasks) ? currentTask.subtasks : [];

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-bold text-white">Subtasks</div>
        <div className="text-sm text-gray-400">{completionPercentage}% complete</div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`${progressBarColor} transition-all duration-500 rounded-full h-3`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className={`text-sm italic ${completionFactorColor}`}>{completionFactorText}</div>

      <div className="space-y-3">
        {subtasks.length === 0 ? (
          <div className="text-gray-400 italic">No subtasks added</div>
        ) : (
          subtasks.map((subtask, index) => (
            <label
              key={subtask?._id ?? `subtask-${index}`}
              className={[
                "flex items-center gap-3 px-3 py-3 bg-gray-700 rounded-lg",
                disabled ? "" : "hover:bg-gray-600",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={Boolean(subtask?.isDone)}
                disabled={disabled}
                onChange={() => handleToggleSubtask(taskId, subtask?._id)}
                className={[
                  "w-5 h-5 accent-blue-500 cursor-pointer",
                  disabled ? "cursor-not-allowed opacity-50" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "transition-all",
                  subtask?.isDone ? "line-through text-gray-500" : "text-gray-200",
                ].join(" ")}
              >
                {subtask?.title}
              </span>
            </label>
          ))
        )}

        {disabled ? <div className="text-gray-400 italic text-sm">(Task completed)</div> : null}
      </div>
    </div>
  );
}

export default SubtaskList;
