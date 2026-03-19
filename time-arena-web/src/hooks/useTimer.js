"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useTimer({ estimatedTime, onComplete } = {}) {
  const intervalRef = useRef(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const totalSeconds = useMemo(() => {
    const minutes = Number(estimatedTime);
    if (!Number.isFinite(minutes) || minutes <= 0) return 0;
    return Math.floor(minutes * 60);
  }, [estimatedTime]);

  const remainingSeconds = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return totalSeconds - elapsedSeconds;
  }, [elapsedSeconds, totalSeconds]);

  const isOvertime = useMemo(() => {
    if (totalSeconds <= 0) return false;
    return remainingSeconds < 0;
  }, [remainingSeconds, totalSeconds]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const start = useCallback(() => {
    setElapsedSeconds(0);
    setIsFinished(false);
    setIsPaused(false);
    setIsRunning(true);
    startTick();
  }, [startTick]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    clearTick();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTick, isRunning]);

  const resume = useCallback(() => {
    if (!isPaused || isFinished) return;
    setIsPaused(false);
    setIsRunning(true);
    startTick();
  }, [isFinished, isPaused, startTick]);

  const stop = useCallback(() => {
    clearTick();
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(true);
    if (typeof onComplete === "function") onComplete(elapsedSeconds);
  }, [clearTick, elapsedSeconds, onComplete]);

  const reset = useCallback(() => {
    clearTick();
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
  }, [clearTick]);

  useEffect(() => {
    return () => {
      clearTick();
    };
  }, [clearTick]);

  return {
    intervalRef,
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    isFinished,
    isOvertime,
    rem: remainingSeconds,
    totalSeconds,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

