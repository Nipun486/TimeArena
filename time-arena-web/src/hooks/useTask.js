"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "../store/taskStore.js";
import { useAuthStore } from "../store/authStore.js";

export function useTask() {
  const router = useRouter();

  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  const { beginTask, toggleSubtaskDone, finishTask, removeTask, isSubmitting } =
    useTaskStore((state) => ({
      beginTask: state.beginTask,
      toggleSubtaskDone: state.toggleSubtaskDone,
      finishTask: state.finishTask,
      removeTask: state.removeTask,
      isSubmitting: state.isSubmitting,
    }));

  const [scoreResult, setScoreResult] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleStartTask = useCallback(
    async (taskId) => {
      setActionError(null);
      try {
        await beginTask(taskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);
      } catch (err) {
        setActionError(err?.message || "Failed to start task");
      }
    },
    [beginTask]
  );

  const handleCompleteTask = useCallback(
    async (taskId) => {
      setActionError(null);
      try {
        const updated = await finishTask(taskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);

        setScoreResult({
          finalScore: updated?.finalScore ?? 0,
          xpAwarded: updated?.xpAwarded ?? 0,
        });
        setShowScore(true);
      } catch (err) {
        setActionError(err?.message || "Failed to complete task");
      }
    },
    [finishTask]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      setActionError(null);
      try {
        await removeTask(taskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);
        router.push("/tasks");
      } catch (err) {
        setActionError(err?.message || "Failed to delete task");
      }
    },
    [removeTask, router]
  );

  const handleToggleSubtask = useCallback(
    async (taskId, subtaskId) => {
      try {
        await toggleSubtaskDone(taskId, subtaskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);
      } catch (err) {
        setActionError(err?.message);
      }
    },
    [toggleSubtaskDone]
  );

  return {
    router,
    isAuthenticated,
    user,

    scoreResult,
    setScoreResult,
    showScore,
    setShowScore,
    actionError,
    setActionError,

    beginTask,
    toggleSubtaskDone,
    finishTask,
    removeTask,
    isSubmitting,

    handleStartTask,
    handleCompleteTask,
    handleDeleteTask,
    handleToggleSubtask,
  };
}

