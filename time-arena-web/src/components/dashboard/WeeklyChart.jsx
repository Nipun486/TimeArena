"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function getBarColor(score) {
  if (score > 0) return "#3B82F6";
  if (score === 0) return "#374151";
  return "#EF4444";
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const value = payload[0]?.value ?? 0;
    const day = payload[0]?.payload?.day ?? "";

    const valueColor =
      value > 0 ? "text-blue-400" : value === 0 ? "text-gray-400" : "text-red-400";

    return (
      <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 shadow-xl">
        <div className="text-white font-bold">{day}</div>
        <div className={valueColor}>{value} points</div>
      </div>
    );
  }

  return null;
}

export default function WeeklyChart({ analytics, isLoading }) {
  const chartData = (analytics?.weeklyScores ?? []).map((item) => ({
    ...item,
    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
  }));

  const totalWeeklyScore = chartData.reduce((sum, d) => sum + d.score, 0);

  const bestDayCandidate =
    chartData.length > 0
      ? chartData.reduce((best, cur) => (cur.score > best.score ? cur : best), chartData[0])
      : null;

  const bestDay =
    !bestDayCandidate || chartData.length === 0 || bestDayCandidate.score === 0
      ? null
      : bestDayCandidate;

  const totalColor =
    totalWeeklyScore > 0
      ? "text-blue-400"
      : totalWeeklyScore === 0
        ? "text-gray-400"
        : "text-red-400";

  const totalFormatted =
    totalWeeklyScore > 0 ? `+${totalWeeklyScore}` : String(totalWeeklyScore);

  if (isLoading) {
    const heights = [40, 70, 55, 90, 30, 75, 60];
    return (
      <div className="h-64 animate-pulse bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-end justify-around h-full gap-2">
          {heights.map((h, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-700 rounded-t-lg"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-start justify-between gap-6 mb-4">
        <div>
          <div className="text-white font-bold text-lg">Weekly Performance</div>
          {bestDay ? (
            <div className="text-gray-400 text-sm">
              Best day: {bestDay.day} ({bestDay.score} pts)
            </div>
          ) : null}
        </div>

        <div className="text-right">
          <div className="text-gray-400 text-xs">Total</div>
          <div className={`text-2xl font-bold ${totalColor}`}>{totalFormatted}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

