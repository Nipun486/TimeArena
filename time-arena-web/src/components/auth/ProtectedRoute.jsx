"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore.js";

/**
 * Guards private pages by ensuring the user is authenticated.
 *
 * @param {object} props
 * @param {import("react").ReactNode} props.children - Content to render only when authenticated.
 * @returns {import("react").ReactNode}
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const { isAuthenticated, initializeAuth } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    initializeAuth: state.initializeAuth,
  }));

  useEffect(() => {
    const run = async () => {
      await initializeAuth();
      setIsChecking(false);
    };

    run();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isChecking) {
    router.replace("/auth/login");
    return null;
  }

  if (isAuthenticated) {
    return children;
  }

  return null;
}

