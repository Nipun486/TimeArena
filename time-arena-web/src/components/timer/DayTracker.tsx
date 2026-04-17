"use client";

import { useEffect, useMemo, useState } from "react";

function getLocalDateString(value?: string | number | Date): string {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDateOnly(value?: string | number | Date): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
}

/**
 * Day-limit tracker card with real-time date progress and completion action.
 */
export default function DayTracker({
  startingDate,
  deadlineDate,
  actualDaysSpent,
  disabled = false,
  onComplete,
}: {
  startingDate?: string | number | Date;
  deadlineDate?: string | number | Date;
  actualDaysSpent?: number;
  disabled?: boolean;
  onComplete?: () => void;
}) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const todayUtcDateOnly = useMemo(
    () => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
    [now]
  );
  const startUtc = useMemo(() => getDateOnly(startingDate), [startingDate]);
  const endUtc = useMemo(() => getDateOnly(deadlineDate), [deadlineDate]);

  const totalDays = useMemo(() => {
    if (!startUtc || !endUtc) return null;
    const diff = Math.ceil((endUtc.getTime() - startUtc.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [startUtc, endUtc]);

  const elapsedDays = useMemo(() => {
    if (!startUtc || !totalDays) return null;
    if (todayUtcDateOnly < startUtc) return 0;
    const diff = Math.ceil(
      (todayUtcDateOnly.getTime() - startUtc.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(totalDays, Math.max(0, diff + 1));
  }, [startUtc, todayUtcDateOnly, totalDays]);

  const remainingDays = useMemo(() => {
    if (!totalDays || elapsedDays == null) return null;
    return Math.max(0, totalDays - elapsedDays);
  }, [elapsedDays, totalDays]);

  const progressPercent = useMemo(() => {
    if (!totalDays || elapsedDays == null) return 0;
    return Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  }, [elapsedDays, totalDays]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-gray-500 text-xs tracking-widest text-center">STARTING DATE</div>
          <div className="text-2xl font-semibold text-center text-violet-300">
            {getLocalDateString(startingDate)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-gray-500 text-xs tracking-widest text-center">ENDING DATE</div>
          <div className="text-2xl font-semibold text-center text-violet-200">
            {getLocalDateString(deadlineDate)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Real-time day tracking</span>
          <span>{progressPercent}% elapsed</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-900/60 rounded-lg px-3 py-3">
          <div className="text-xs text-gray-500">TOTAL DAYS</div>
          <div className="text-lg font-semibold text-white">{totalDays ?? "--"}</div>
        </div>
        <div className="bg-gray-900/60 rounded-lg px-3 py-3">
          <div className="text-xs text-gray-500">ELAPSED</div>
          <div className="text-lg font-semibold text-white">{elapsedDays ?? "--"}</div>
        </div>
        <div className="bg-gray-900/60 rounded-lg px-3 py-3">
          <div className="text-xs text-gray-500">REMAINING</div>
          <div className="text-lg font-semibold text-white">{remainingDays ?? "--"}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={disabled || !onComplete}
        className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl font-bold py-3 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-violet-600"
      >
        ✅ Complete Day Task
      </button>

      {typeof actualDaysSpent === "number" ? (
        <div className="text-gray-400 text-xs text-center">Actual days spent: {actualDaysSpent}</div>
      ) : (
        <div className="text-gray-500 text-xs text-center">
          Tracks day progress live based on start and end dates.
        </div>
      )}
    </div>
  );
}
