"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchLeaderboard } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import type { LeaderboardResponse } from "@/types";

/**
 * Global leaderboard ranking users by total XP.
 */
export default function LeaderboardPage() {
  const { user } = useAuthStore();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchLeaderboard(50);
      setLeaderboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const currentUserRank = useMemo(() => {
    const list = leaderboardData?.leaderboard;
    if (!Array.isArray(list) || !user?._id) return null;
    const entry = list.find((e) => e?.id === user?._id);
    return entry?.rank ?? null;
  }, [leaderboardData, user?._id]);

  const entries = leaderboardData?.leaderboard;
  const hasEntries = Array.isArray(entries) && entries.length > 0;

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Top players ranked by total XP
          </p>
        </div>

        {currentUserRank ? (
          <div className="bg-blue-900 border border-blue-600 rounded-xl px-6 py-4 mb-6 flex justify-between items-center">
            <div>
              <div className="text-blue-300 text-sm font-medium">
                Your Ranking
              </div>
              <div className="text-white text-2xl font-black">
                #{currentUserRank}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{user?.username}</div>
              <div className="text-blue-300 text-sm">
                {user?.totalXP} XP total
              </div>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 bg-gray-800 rounded-xl animate-pulse mb-3 border border-gray-700"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
            <div className="text-red-200 font-medium">Something went wrong</div>
            <div className="text-red-300 text-sm mt-1">{error}</div>
            <button
              type="button"
              onClick={loadLeaderboard}
              className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : !hasEntries ? (
          <div className="text-center text-gray-400">No players yet</div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isCurrentUser = entry?.id === user?._id;
              const rowClass = isCurrentUser
                ? "bg-blue-900 border-2 border-blue-500"
                : entry?.rank && entry.rank <= 3
                  ? "bg-gray-800 border border-yellow-600/50"
                  : "bg-gray-800 border border-gray-700";

              const username = entry?.username || "Unknown";
              const avatarLetter = String(username).trim().charAt(0).toUpperCase();

              return (
                <div
                  key={entry?.id || `${entry?.rank}-${username}`}
                  className={`${rowClass} rounded-xl px-6 py-4 flex items-center gap-4`}
                >
                  <div className="w-12 text-center">
                    {entry?.rank === 1 ? (
                      <span className="text-2xl">🥇</span>
                    ) : entry?.rank === 2 ? (
                      <span className="text-2xl">🥈</span>
                    ) : entry?.rank === 3 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="text-gray-400 font-bold">
                        #{entry?.rank}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      isCurrentUser ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    {avatarLetter || "?"}
                  </div>

                  <div className="flex-1">
                    <div className="text-white font-bold">
                      {username}
                      {isCurrentUser ? (
                        <span className="text-blue-400 text-sm"> (You)</span>
                      ) : null}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Level {entry?.level}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-bold">
                      {entry?.totalXP} XP
                    </div>
                    {entry?.currentStreak && entry.currentStreak > 0 ? (
                      <div className="text-orange-400 text-xs mt-0.5">
                        🔥 {entry?.currentStreak} day streak
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
