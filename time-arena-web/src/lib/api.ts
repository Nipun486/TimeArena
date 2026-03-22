import axios, { type AxiosError } from "axios";
import type {
  Analytics,
  ApiData,
  AuthApiResponse,
  CreateTaskPayload,
  LeaderboardResponse,
  LoginCredentials,
  RegisterPayload,
  Task,
  User,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const ax = err as AxiosError<{ message?: string }>;
  return ax?.response?.data?.message ?? (err instanceof Error ? err.message : fallback);
}

// Auth
export const registerUser = (data: RegisterPayload) =>
  api.post<AuthApiResponse>("/auth/register", data).then((response) => response.data);

export const loginUser = (data: LoginCredentials) =>
  api.post<AuthApiResponse>("/auth/login", data).then((response) => response.data);

// Tasks
export const fetchTasks = (params?: Record<string, string>) =>
  api.get<ApiData<Task[]>>("/tasks", { params }).then((response) => response.data);

export const fetchTaskById = (id: string) =>
  api.get<ApiData<Task>>(`/tasks/${id}`).then((response) => response.data);

export const createTask = (data: CreateTaskPayload) =>
  api.post<ApiData<Task>>("/tasks", data).then((response) => response.data);

export const startTask = (id: string) =>
  api.patch<ApiData<Task>>(`/tasks/${id}/start`).then((response) => response.data);

export const toggleSubtask = (taskId: string, subtaskId: string) =>
  api
    .patch<ApiData<Task>>(`/tasks/${taskId}/subtask/${subtaskId}`)
    .then((response) => response.data);

export const completeTask = (id: string) =>
  api.post<ApiData<Task>>(`/tasks/${id}/complete`).then((response) => response.data);

export const deleteTask = (id: string) =>
  api.delete(`/tasks/${id}`).then((response) => response.data);

// Users
export const fetchMe = () =>
  api.get<{ user?: User } | User>("/users/me").then((response) => response.data);

export const fetchAnalytics = () =>
  api.get<Analytics>("/users/me/analytics").then((response) => response.data);

// Leaderboard
export const fetchLeaderboard = (limit = 50) =>
  api
    .get<LeaderboardResponse>("/leaderboard", { params: { limit } })
    .then((response) => response.data);

export default api;
