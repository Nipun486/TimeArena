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
} from "../lib/api.js";

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: {
    status: "",
    difficulty: "",
  },

  // Fetches tasks list (supports query params like filters).
  loadTasks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetchTasks(params);
      set({ tasks: res?.data ?? [], isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  // Fetches a single task and sets it as currentTask.
  loadTaskById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetchTaskById(id);
      set({ currentTask: res?.data ?? null, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  // Creates a new task, prepends it to tasks, and returns it (re-throws on error).
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

  // Starts a task, sets currentTask, and updates the matching task in tasks.
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

  // Toggles a subtask instantly (no loading/submitting flags) and updates currentTask + tasks.
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

  // Completes a task, updates state, returns the updated task (re-throws on error).
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

  // Deletes a task, removes it from tasks, and clears currentTask if it was deleted.
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

  // Updates filters, then re-fetches tasks immediately using the updated filters.
  setFilters: async (newFilters = {}) => {
    const nextFilters = { ...get().filters, ...newFilters };
    set({ filters: nextFilters });
    await get().loadTasks(nextFilters);
  },

  // Clears the current error message.
  clearError: () => set({ error: null }),
}));
