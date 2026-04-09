"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import type { CreateTaskPayload, TaskDifficulty } from "@/types";

interface FormState {
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: TaskDifficulty;
  subtasks: Array<{ title: string; weight: number }>;
}

/**
 * Renders a form for creating a new task, including a dynamic subtask list builder.
 */
export default function TaskForm() {
  const router = useRouter();
  const { addTask, isSubmitting, error } = useTaskStore();

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    estimatedTime: "",
    difficulty: "medium",
    subtasks: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [subtaskInput, setSubtaskInput] = useState("");

  const difficultyPointsMap: Record<TaskDifficulty, number> = {
    easy: 50,
    medium: 100,
    hard: 200,
  };

  const handleAddSubtask = () => {
    if (!subtaskInput || !subtaskInput.trim()) return;

    const next = { title: subtaskInput.trim(), weight: 1 };
    setFormData((prev) => ({ ...prev, subtasks: [...prev.subtasks, next] }));
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title || !formData.title.trim()) {
      nextErrors.title = "Title is required";
    }

    const minutes = Number(formData.estimatedTime);
    if (!formData.estimatedTime || Number.isNaN(minutes) || minutes < 1) {
      nextErrors.estimatedTime = "Enter at least 1 minute";
    }

    if (!["easy", "medium", "hard"].includes(formData.difficulty)) {
      nextErrors.difficulty = "Select a difficulty";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const filteredSubtasks = (formData.subtasks ?? []).filter(
      (s) => s?.title && String(s.title).trim()
    );

    const taskData: CreateTaskPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      estimatedTime: Number(formData.estimatedTime),
      difficulty: formData.difficulty,
      subtasks: filteredSubtasks,
    };

    try {
      const newTask = await addTask(taskData);
      if (newTask?._id) {
        router.push("/tasks/" + newTask._id);
      }
    } catch {
      // error is stored in taskStore state
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-[#0f1729] border border-[#243252] rounded-b-2xl p-6 space-y-5"
    >
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium mb-2">
          Task Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 w-full"
          placeholder="e.g. Build a Pomodoro timer"
        />
        {formErrors.title ? (
          <p className="text-red-400 text-sm">{formErrors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium mb-2">
          Description (optional)
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 w-full"
          placeholder="Add a bit more detail..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium mb-2">
          Estimated Time (minutes)
        </label>
        <input
          type="number"
          min={1}
          value={formData.estimatedTime}
          onChange={(e) =>
            setFormData((p) => ({ ...p, estimatedTime: e.target.value }))
          }
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 w-full"
          placeholder="30"
        />
        {formErrors.estimatedTime ? (
          <p className="text-red-400 text-sm">{formErrors.estimatedTime}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium mb-2">
          Difficulty
        </label>
        <select
          value={formData.difficulty}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              difficulty: e.target.value as TaskDifficulty,
            }))
          }
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 w-full"
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
        <p className="text-blue-400 text-sm">
          ⚡ {difficultyPointsMap[formData.difficulty]} base points
        </p>
        {formErrors.difficulty ? (
          <p className="text-red-400 text-sm">{formErrors.difficulty}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium mb-2">
          Subtasks
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 w-full"
            placeholder="Add a subtask..."
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-lg px-4 py-3"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {formData.subtasks.map((subtask, idx) => (
            <div
              key={`${subtask.title}-${idx}`}
              className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
            >
              <span className="text-gray-100">• {subtask.title}</span>
              <button
                type="button"
                onClick={() => handleRemoveSubtask(idx)}
                className="text-gray-300 hover:text-white"
                aria-label="Remove subtask"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 text-white rounded-lg px-4 py-3 font-medium"
      >
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
