"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

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

  const streakDays = Math.max(0, Number(user?.currentStreak ?? 0));

  return (
    <aside className="flex w-64 min-h-screen border-r border-[#1a2338] bg-[#070d1f] flex-col px-3 py-5">
      <div className="mb-8 px-3">
        <div className="text-lg font-semibold tracking-tight text-white">
          Time Arena
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm",
                isActive
                  ? "bg-[#151f36] text-white font-medium border border-[#233455]"
                  : "text-gray-400 hover:bg-[#121a2f] hover:text-white",
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

      <div className="mt-6 border-t border-[#1a2338] px-4 py-4">
        <div className="text-sm text-orange-400">🔥 {streakDays || 1} day streak</div>
        <div className="mt-1 text-[11px] text-gray-500">Keep it up!</div>
      </div>
    </aside>
  );
}
