"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

/**
 * Registration page where new users create their account.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.username.trim()) nextErrors.username = "Username is required";
    else if (formData.username.trim().length < 3) {
      nextErrors.username = "Username must be 3+ characters";
    }

    if (!formData.email.trim()) nextErrors.email = "Email is required";

    if (!formData.password) nextErrors.password = "Password is required";
    else if (formData.password.length < 6) {
      nextErrors.password = "Password must be 6+ characters";
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    clearError();
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormErrors({});

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      router.replace("/dashboard");
    } catch {
      // error is already in store state
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center text-4xl mb-2">🏆</div>
        <h1 className="text-2xl font-bold text-white text-center">
          Join Time Arena
        </h1>
        <p className="text-gray-400 text-sm text-center mt-1 mb-8">
          Create your account and start scoring
        </p>

        {error ? (
          <div className="bg-red-900 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">{error}</div>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 text-red-200 hover:text-white"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={onChange}
              placeholder="Your username"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              autoComplete="username"
            />
            {formErrors.username ? (
              <p className="text-red-400 text-sm mt-2">{formErrors.username}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="you@example.com"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              autoComplete="email"
            />
            {formErrors.email ? (
              <p className="text-red-400 text-sm mt-2">{formErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Your password"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              autoComplete="new-password"
            />
            {formErrors.password ? (
              <p className="text-red-400 text-sm mt-2">{formErrors.password}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              autoComplete="new-password"
            />
            {formErrors.confirmPassword ? (
              <p className="text-red-400 text-sm mt-2">
                {formErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 transition-colors"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-300">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
