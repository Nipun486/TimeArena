"use client";
 
import { create } from "zustand";
import { loginUser, registerUser, fetchMe } from "@/lib/api";
import type { LoginCredentials, RegisterPayload, User } from "@/types";
import type { AxiosError } from "axios";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<unknown>;
  register: (userData: RegisterPayload) => Promise<unknown>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const ax = err as AxiosError<{ message?: string }>;
  return ax?.response?.data?.message ?? (err instanceof Error ? err.message : fallback);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const res = await loginUser(credentials);
      const data = res as { token?: string; user?: User };
      const { token, user } = data ?? {};

      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
      }

      set({
        token: token ?? null,
        user: user ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (err) {
      const message = getErrorMessage(err, "Login failed. Please try again.");
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const res = await registerUser(userData);
      const data = res as { token?: string; user?: User };
      const { token, user } = data ?? {};

      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
      }

      set({
        token: token ?? null,
        user: user ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (err) {
      const message = getErrorMessage(err, "Registration failed. Please try again.");
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  initializeAuth: async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      get().logout();
      return;
    }

    set({ token, isAuthenticated: true });

    try {
      const res = await fetchMe();
      const data =
        res && typeof res === "object" && "data" in res
          ? (res as { data?: unknown }).data
          : res;
      const user =
        data && typeof data === "object" && data !== null && "user" in data
          ? (data as { user?: User }).user
          : (data as User | undefined);
      set({ user: user ?? null });
    } catch {
      get().logout();
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
