"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../store/authStore.js";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";

const publicRoutes = ["/", "/auth/login", "/auth/register"];

/**
 * Client-side layout wrapper with two modes:
 * - Public routes (`/`, `/auth/login`, `/auth/register`) render children only (no Navbar/Sidebar).
 * - All other routes render Navbar above a Sidebar + main content split.
 */
export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

