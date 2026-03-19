"use client";

import { useTimer } from "../../hooks/useTimer.js";

/**
 * Purely visual timer component — all timer logic lives in `useTimer`.
 *
 * Props:
 * - estimatedTime (number): Task estimated time in minutes.
 * - onComplete (function): Called with `elapsedSeconds` when timer is stopped.
 * - disabled (boolean): Disables all timer controls (e.g. when task is not "in-progress").
 *
 * Button states (mutually exclusive):
 * - Finished: shows completion message.
 * - Not started: shows only "Start Timer".
 * - Running: shows "Pause" and "Stop & Submit".
 * - Paused: shows "Resume" and "Stop & Submit".
 */
export default function Timer({ estimatedTime, onComplete, disabled = false }) {
  const {
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    isFinished,
    isOvertime,
    start,
    pause,
    resume,
    stop,
  } = useTimer({ estimatedTime, onComplete });

  const formatTime = (totalSeconds) => {
    const isNegative = totalSeconds < 0;
    const workWith = Math.abs(totalSeconds);

    const minutes = Math.floor(workWith / 60);
    const seconds = workWith % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return isNegative ? `-${mm}:${ss}` : `${mm}:${ss}`;
  };

  const countdownColor = isFinished
    ? "text-gray-500"
    : isOvertime
      ? "text-red-400"
      : "text-blue-400";

  const isNotStarted = !isRunning && !isPaused && !isFinished;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-5">
      {/* SECTION 1 — Dual clock display */}
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT COLUMN — Remaining */}
        <div className="space-y-2">
          <div className="text-gray-500 text-xs tracking-widest text-center">
            REMAINING
          </div>
          <div
            className={[
              "text-5xl font-mono font-bold text-center",
              countdownColor,
              isOvertime ? "animate-pulse" : "",
            ].join(" ")}
          >
            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* RIGHT COLUMN — Elapsed */}
        <div className="space-y-2">
          <div className="text-gray-500 text-xs tracking-widest text-center">
            ELAPSED
          </div>
          <div className="text-5xl font-mono font-bold text-center text-gray-300">
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      </div>

      {/* SECTION 2 — Overtime warning */}
      {isOvertime ? (
        <div className="text-red-400 text-sm text-center font-medium bg-red-900 bg-opacity-30 rounded-lg px-4 py-2">
          ⚠️ Overtime — time factor reduced to 0.8×
        </div>
      ) : null}

      {/* SECTION 3 — Buttons */}
      {isFinished ? (
        <div className="text-green-400 text-center font-medium">
          ✅ Time recorded — calculating score...
        </div>
      ) : isNotStarted ? (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold py-3 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          ▶ Start Timer
        </button>
      ) : isRunning ? (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={pause}
            disabled={disabled}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-bold py-3 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-600"
          >
            ⏸ Pause
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={disabled}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl font-bold py-3 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
          >
            ⏹ Stop &amp; Submit
          </button>
        </div>
      ) : isPaused ? (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={resume}
            disabled={disabled}
            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl font-bold py-3 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
            ▶ Resume
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={disabled}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl font-bold py-3 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
          >
            ⏹ Stop &amp; Submit
          </button>
        </div>
      ) : null}

      {/* SECTION 4 — Estimated time reminder */}
      <div className="text-gray-600 text-xs text-center">
        Estimated: {estimatedTime} min
      </div>
    </div>
  );
}

