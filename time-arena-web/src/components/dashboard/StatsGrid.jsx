/**
 * StatsGrid (pure display component).
 *
 * @param {Object} props
 * @param {Object} [props.analytics] Analytics response from GET /api/users/me/analytics.
 * @param {Array<{date?: string, score: number}>} [props.analytics.weeklyScores] Array of daily scores for the week.
 * @param {number} [props.analytics.completionRate] Completion rate percentage (0-100).
 * @param {number} [props.analytics.focusHours] Total focused hours.
 * @param {number} [props.analytics.consistencyScore] Consistency percentage (0-100).
 * @param {boolean} props.isLoading True while analytics is being fetched.
 */
export default function StatsGrid({ analytics, isLoading }) {
  const stats = [
    {
      label: "Weekly Score",
      icon: "⭐",
      value:
        analytics?.weeklyScores?.reduce((sum, day) => sum + day.score, 0) ?? 0,
      subtitle: "points this week",
      borderColor: "border-blue-500",
      iconBg: "bg-blue-900",
      valueColor: "text-blue-400",
    },
    {
      label: "Completion Rate",
      icon: "🎯",
      value: (analytics?.completionRate ?? 0) + "%",
      subtitle: "tasks completed",
      borderColor: "border-green-500",
      iconBg: "bg-green-900",
      valueColor: "text-green-400",
    },
    {
      label: "Focus Hours",
      icon: "⏱",
      value: (analytics?.focusHours ?? 0) + "h",
      subtitle: "time spent working",
      borderColor: "border-purple-500",
      iconBg: "bg-purple-900",
      valueColor: "text-purple-400",
    },
    {
      label: "Consistency",
      icon: "🔥",
      value: (analytics?.consistencyScore ?? 0) + "%",
      subtitle: "days active this week",
      borderColor: "border-orange-500",
      iconBg: "bg-orange-900",
      valueColor: "text-orange-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className="bg-gray-800 rounded-xl p-6 animate-pulse border border-gray-700"
          >
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
            <div className="h-8 bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className={[
            "bg-gray-800 rounded-xl p-6",
            "border-t-4",
            item.borderColor,
            "border border-gray-700",
            "hover:border-gray-600 transition-colors",
          ].join(" ")}
        >
          <div className="flex justify-between items-start">
            <div className="text-gray-400 text-sm font-medium">
              {item.label}
            </div>
            <div className={[item.iconBg, "rounded-lg p-2 text-xl"].join(" ")}>
              {item.icon}
            </div>
          </div>

          <div
            className={["text-3xl font-black mt-3", item.valueColor].join(" ")}
          >
            {item.value}
          </div>

          <div className="text-gray-500 text-xs mt-1">{item.subtitle}</div>
        </div>
      ))}
    </div>
  );
}

