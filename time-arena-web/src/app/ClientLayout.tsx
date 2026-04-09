"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";

const publicRoutes = ["/", "/auth/login", "/auth/register"];

/**
 * Client-side layout wrapper with two modes:
 * - Public routes (`/`, `/auth/login`, `/auth/register`) render children only (no Navbar/Sidebar).
 * - All other routes render a full-height Sidebar + content split.
 */
export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#050a1a] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-5 py-6 md:px-8">{children}</main>
    </div>
  );
}
