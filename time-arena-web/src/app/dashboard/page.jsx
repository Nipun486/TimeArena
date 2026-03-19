"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "../../../store/authStore.js";
import { fetchAnalytics } from "../../../lib/api.js";

import ProtectedRoute from "../../../components/auth/ProtectedRoute.jsx";
import StatsGrid from "../../../components/dashboard/StatsGrid.jsx";
import WeeklyChart from "../../../components/dashboard/WeeklyChart.jsx";
import StreakBadge from "../../../components/dashboard/StreakBadge.jsx";
import XPBar from "../../../components/dashboard/XPBar.jsx";

/**
 * Dashboard page showing user analytics, stats, streak, XP progress, and weekly performance.
 */
export default function DashboardPage() {
  const { user } = useAuthStore();

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err?.message || "Failed to load analytics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here is your productivity overview
          </p>
        </header>

        {error ? (
          <div className="bg-red-900 border border-red-700 rounded-xl px-6 py-4 text-red-300 mb-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm">{error}</p>
              <button
                type="button"
                onClick={loadAnalytics}
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <StatsGrid analytics={analytics} isLoading={isLoading} />

        <WeeklyChart analytics={analytics} isLoading={isLoading} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StreakBadge />
          <XPBar />
        </div>
      </div>
    </ProtectedRoute>
  );
}

