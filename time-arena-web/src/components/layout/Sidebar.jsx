"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore.js";

/**
 * Sidebar navigation shown on all protected pages.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Tasks", href: "/tasks", icon: "✅" },
    { label: "Leaderboard", href: "/leaderboard", icon: "🏆" },
  ];

  const hasStreak = !!user && Number(user.currentStreak) > 0;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-700 flex flex-col px-3 py-6">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-gray-500">
          NAVIGATION
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {link.icon}
              </span>
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {hasStreak && (
        <div className="mt-6 border-t border-gray-700 px-4 py-4">
          <div className="text-sm text-orange-400">
            🔥 {user.currentStreak} day streak
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Keep it up!</div>
        </div>
      )}
    </aside>
  );
}
