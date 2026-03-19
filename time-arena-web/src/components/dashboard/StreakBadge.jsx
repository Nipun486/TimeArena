"use client";

import { useAuthStore } from "../../store/authStore.js";

function getStreakConfig(streak) {
  if (streak === 0) {
    return {
      icon: "💀",
      color: "text-gray-500",
      message: "Start your streak today! 💪",
    };
  }

  if (streak <= 2) {
    return {
      icon: "🌱",
      color: "text-green-400",
      message: streak === 1 ? "Great start! Keep going! 🌱" : "Two days strong! 🔥",
    };
  }

  if (streak <= 6) {
    return {
      icon: "🔥",
      color: "text-orange-400",
      message: "You're on fire! Don't stop! 🔥🔥",
    };
  }

  if (streak <= 13) {
    return {
      icon: "🔥🔥",
      color: "text-orange-500",
      message: "One week streak! Incredible! 🏆",
    };
  }

  if (streak <= 29) {
    return {
      icon: "💎",
      color: "text-blue-400",
      message: "Two weeks! You're unstoppable! 💎",
    };
  }

  return {
    icon: "👑",
    color: "text-yellow-400",
    message: "Legendary streak! 👑",
  };
}

/**
 * Dashboard streak card.
 *
 * - **Streak config**: computed via `getStreakConfig(currentStreak)` to pick an
 *   icon, a Tailwind color class, and a motivational message.
 * - **Seven day indicator**: builds a 7-boolean array filled from right-to-left,
 *   where the rightmost circle represents "today" and becomes active when
 *   `daysFromToday < currentStreak` (so a streak of 1 lights only the last circle).
 */
export default function StreakBadge() {
  const { user } = useAuthStore();

  const currentStreak = user?.currentStreak ?? 0;
  const longestStreak = user?.longestStreak ?? 0;

  const { icon, color, message } = getStreakConfig(currentStreak);

  const sevenDayCircles = Array(7)
    .fill(false)
    .map((_, index) => {
      const daysFromToday = 6 - index;
      return daysFromToday < currentStreak;
    });

  const dayLabel = currentStreak === 1 ? "day" : "days";

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-gray-400 text-sm font-medium">Streak</div>
        {longestStreak > 0 ? (
          <div className="bg-gray-700 rounded-full px-3 py-1 text-gray-300 text-xs">
            🏅 Best: {longestStreak} days
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-5xl text-center leading-none">{icon}</div>
        <div className={`text-6xl font-black text-center leading-none mt-2 ${color}`}>
          {currentStreak}
        </div>
        <div className="text-gray-500 text-sm text-center">
          {dayLabel} streak
        </div>
      </div>

      <div className={`text-center text-sm font-medium ${color} bg-gray-700 rounded-lg px-4 py-2`}>
        {message}
      </div>

      <div>
        <div className="text-gray-500 text-xs mb-2">Last 7 days</div>

        <div className="flex justify-between items-center">
          {sevenDayCircles.map((active, idx) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              className={[
                "w-8 h-8 rounded-full transition-colors duration-300",
                active ? "bg-orange-500 shadow-lg shadow-orange-500/30" : "bg-gray-700",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={idx} className="text-gray-600 text-xs text-center w-8">
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
