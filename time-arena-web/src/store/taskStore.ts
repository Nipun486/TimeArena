"use client";

import { create } from "zustand";
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  startTask,
  toggleSubtask,
  completeTask,
  deleteTask,
} from "@/lib/api";
import type { CreateTaskPayload, Task } from "@/types";

const getErrorMessage = (err: unknown): string => {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || "Something went wrong";
};

export interface TaskFilters {
  status: string;
  difficulty: string;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  filters: TaskFilters;
  loadTasks: (params?: Record<string, string>) => Promise<void>;
  loadTaskById: (id: string) => Promise<void>;
  addTask: (data: CreateTaskPayload) => Promise<Task | undefined>;
  beginTask: (id: string) => Promise<void>;
  toggleSubtaskDone: (taskId: string, subtaskId: string) => Promise<void>;
  finishTask: (id: string) => Promise<Task | null | undefined>;
  removeTask: (id: string) => Promise<void>;
  setFilters: (newFilters?: Partial<TaskFilters>) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: {
    status: "",
    difficulty: "",
  },

  loadTasks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetchTasks(params);
      set({ tasks: res?.data ?? [], isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  loadTaskById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetchTaskById(id);
      set({ currentTask: res?.data ?? null, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  addTask: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await createTask(data);
      const created = res?.data;
      if (created) {
        set((state) => ({
          tasks: [created, ...state.tasks],
          isSubmitting: false,
        }));
      } else {
        set({ isSubmitting: false });
      }
      return created;
    } catch (err) {
      set({ error: getErrorMessage(err), isSubmitting: false });
      throw err;
    }
  },

  beginTask: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await startTask(id);
      const updatedTask = res?.data ?? null;
      set((state) => ({
        currentTask: updatedTask,
        tasks: updatedTask
          ? state.tasks.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            )
          : state.tasks,
        isSubmitting: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err), isSubmitting: false });
    }
  },

  toggleSubtaskDone: async (taskId, subtaskId) => {
    try {
      const res = await toggleSubtask(taskId, subtaskId);
      const updatedTask = res?.data ?? null;
      set((state) => ({
        currentTask: updatedTask,
        tasks: updatedTask
          ? state.tasks.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            )
          : state.tasks,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err) });
    }
  },

  finishTask: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await completeTask(id);
      const updatedTask = res?.data ?? null;
      set((state) => ({
        currentTask: updatedTask,
        tasks: updatedTask
          ? state.tasks.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            )
          : state.tasks,
        isSubmitting: false,
      }));
      return updatedTask;
    } catch (err) {
      set({ error: getErrorMessage(err), isSubmitting: false });
      throw err;
    }
  },

  removeTask: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== id),
        currentTask:
          state.currentTask && state.currentTask._id === id
            ? null
            : state.currentTask,
        isSubmitting: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err), isSubmitting: false });
    }
  },

  setFilters: async (newFilters = {}) => {
    const nextFilters = { ...get().filters, ...newFilters };
    set({ filters: nextFilters });
    await get().loadTasks(nextFilters);
  },

  clearError: () => set({ error: null }),
}));
