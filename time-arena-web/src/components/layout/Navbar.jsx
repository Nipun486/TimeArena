"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../../store/authStore.js";

/**
 * Top navigation bar shown on every protected page.
 */
export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const level = user ? Math.floor(user.totalXP / 100) : 0;

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700 shadow-lg">
      <div className="flex items-center">
        <Link href="/dashboard" className="text-white font-bold text-xl">
          🎮 Time Arena
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-white">👤 {user && user.username}</span>
            <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
              Lv.{level}
            </span>
            <span className="text-sm text-gray-300">{user && user.totalXP} XP</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm border border-red-500 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 rounded-md px-3 py-1 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

