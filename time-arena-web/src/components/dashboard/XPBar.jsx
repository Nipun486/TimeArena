"use client";

import { useAuthStore } from "../../store/authStore.js";

function getLevelBadge(level) {
  if (level === 0) return { name: "Newcomer", color: "text-gray-400" };
  if (level <= 5) return { name: "Bronze 🥉", color: "text-amber-600" };
  if (level <= 15) return { name: "Silver 🥈", color: "text-gray-300" };
  if (level <= 30) return { name: "Gold 🥇", color: "text-yellow-400" };
  if (level <= 50) return { name: "Platinum 💎", color: "text-cyan-400" };
  return { name: "Diamond 👑", color: "text-blue-400" };
}

/**
 * Dashboard XP/Level bar.
 *
 * XP logic:
 * - `totalXP` comes from `authStore` (`user?.totalXP ?? 0`)
 * - `currentLevel = Math.floor(totalXP / 100)` (each level = exactly 100 XP)
 * - `xpIntoLevel = totalXP % 100`
 * - `progressPercent = xpIntoLevel` (0..99; equals percent of level completed)
 */
export default function XPBar() {
  const { user } = useAuthStore();

  const totalXP = user?.totalXP ?? 0;
  const currentLevel = Math.floor(totalXP / 100);
  const nextLevel = currentLevel + 1;
  const xpIntoLevel = totalXP % 100;
  const progressPercent = xpIntoLevel;

  const progressBarColor =
    progressPercent >= 100
      ? "bg-green-500"
      : progressPercent >= 67
        ? "bg-orange-500"
        : progressPercent >= 34
          ? "bg-purple-500"
          : "bg-blue-500";

  const isLevelUpReady = progressPercent === 0 && currentLevel > 0;

  const { name, color } = getLevelBadge(currentLevel);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="bg-gray-700 rounded-lg px-3 py-1 text-white font-bold text-sm inline-block mr-2">
            Lv.{currentLevel}
          </span>
          <span className={`font-medium text-sm ${color}`}>{name}</span>
        </div>
        <div className="text-gray-400 text-sm">{totalXP} XP total</div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress to Level {nextLevel}</span>
          <span>{xpIntoLevel} / 100 XP</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
          <div
            className={[
              "h-4 rounded-full transition-all duration-700",
              progressBarColor,
              isLevelUpReady ? "animate-pulse" : "",
            ].join(" ")}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-500 text-xs">Level {currentLevel}</span>
        {isLevelUpReady ? (
          <span className="text-green-400 text-xs font-bold animate-pulse">
            ✨ Level Up Ready!
          </span>
        ) : null}
        <span className="text-gray-500 text-xs">Level {nextLevel}</span>
      </div>

      {totalXP > 0 ? (
        <div className="flex gap-4 justify-center mt-3">
          <span className="bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-400">
            {xpIntoLevel} XP this level
          </span>
          <span className="bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-400">
            {100 - xpIntoLevel} XP to go
          </span>
        </div>
      ) : null}
    </div>
  );
}
