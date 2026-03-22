"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import type { ScoreResult } from "@/types";

export function useTask() {
  const router = useRouter();

  const { isAuthenticated, user } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    }))
  );

  const { beginTask, toggleSubtaskDone, finishTask, removeTask, isSubmitting } =
    useTaskStore(
      useShallow((state) => ({
        beginTask: state.beginTask,
        toggleSubtaskDone: state.toggleSubtaskDone,
        finishTask: state.finishTask,
        removeTask: state.removeTask,
        isSubmitting: state.isSubmitting,
      }))
    );

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStartTask = useCallback(
    async (taskId: string) => {
      setActionError(null);
      try {
        await beginTask(taskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to start task");
      }
    },
    [beginTask]
  );

  const handleCompleteTask = useCallback(
    async (taskId: string) => {
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
        setActionError(err instanceof Error ? err.message : "Failed to complete task");
      }
    },
    [finishTask]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setActionError(null);
      try {
        await removeTask(taskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);
        router.push("/tasks");
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to delete task");
      }
    },
    [removeTask, router]
  );

  const handleToggleSubtask = useCallback(
    async (taskId: string, subtaskId: string | undefined) => {
      if (!subtaskId) return;
      try {
        await toggleSubtaskDone(taskId, subtaskId);
        const storeError = useTaskStore.getState().error;
        if (storeError) setActionError(storeError);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Failed to update subtask"
        );
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
