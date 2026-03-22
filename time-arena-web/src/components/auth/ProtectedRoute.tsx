"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/authStore";
 
/**
 * Guards private pages by ensuring the user is authenticated.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const { isAuthenticated, initializeAuth } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      initializeAuth: state.initializeAuth,
    }))
  );

  useEffect(() => {
    const run = async () => {
      await initializeAuth();
      setIsChecking(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isChecking || isAuthenticated) return;
    router.replace("/auth/login");
  }, [isAuthenticated, isChecking, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Redirecting to sign in…</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return null;
}
