import axios from "axios";

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

// Auth
export const registerUser = (data) =>
  api.post("/auth/register", data).then((response) => response.data);

export const loginUser = (data) =>
  api.post("/auth/login", data).then((response) => response.data);

// Tasks
export const fetchTasks = (params) =>
  api.get("/tasks", { params }).then((response) => response.data);

export const fetchTaskById = (id) =>
  api.get(`/tasks/${id}`).then((response) => response.data);

export const createTask = (data) =>
  api.post("/tasks", data).then((response) => response.data);

export const startTask = (id) =>
  api.patch(`/tasks/${id}/start`).then((response) => response.data);

export const toggleSubtask = (taskId, subtaskId) =>
  api
    .patch(`/tasks/${taskId}/subtask/${subtaskId}`)
    .then((response) => response.data);

export const completeTask = (id) =>
  api.post(`/tasks/${id}/complete`).then((response) => response.data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((response) => response.data);

// Users
export const fetchMe = () => api.get("/users/me").then((response) => response.data);

export const fetchAnalytics = () =>
  api.get("/users/me/analytics").then((response) => response.data);

// Leaderboard
export const fetchLeaderboard = (limit = 50) =>
  api.get("/leaderboard", { params: { limit } }).then((response) => response.data);

export default api;
