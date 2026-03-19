"use client";

import { create } from "zustand";
import { loginUser, registerUser, fetchMe } from "../lib/api.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Logs a user in with credentials, stores token, and updates auth state.
  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const res = await loginUser(credentials);
      const data = res?.data ?? res;
      const { token, user } = data ?? {};

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed. Please try again.";

      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // Registers a new user, stores token, and updates auth state.
  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const res = await registerUser(userData);
      const data = res?.data ?? res;
      const { token, user } = data ?? {};

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Registration failed. Please try again.";

      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // Logs the user out by clearing token and resetting auth state.
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

  // Initializes auth from localStorage and fetches the current user if possible.
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
      const data = res?.data ?? res;
      const user = data?.user ?? data;
      set({ user });
    } catch {
      get().logout();
    }
  },

  // Clears the current auth error message.
  clearError: () => {
    set({ error: null });
  },
}));
