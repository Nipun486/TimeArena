import type { ReactNode } from "react";

export type TaskDifficulty = "easy" | "medium" | "hard";
export type TaskStatus = "pending" | "in-progress" | "completed" | "failed";

export interface Subtask {
  _id?: string;
  title?: string;
  isDone?: boolean;
  weight?: number;
}

export interface Task {
  _id?: string;
  title?: string;
  description?: string;
  difficulty?: TaskDifficulty | string;
  limitType?: "time" | "day";
  status?: TaskStatus | string;
  completionPercentage?: number;
  estimatedTime?: number;
  deadlineDate?: string | number | Date;
  startingDate?: string | number | Date;
  createdAt?: string | number | Date;
  finalScore?: number;
  xpAwarded?: number;
  subtasks?: Subtask[];
  basePoints?: number;
  actualTimeSpent?: number;
  actualDaysSpent?: number;
}

export interface User {
  _id?: string;
  username?: string;
  email?: string;
  totalXP?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export interface WeeklyScoreDay {
  date?: string;
  score: number;
}

export interface Analytics {
  weeklyScores?: WeeklyScoreDay[];
  completionRate?: number;
  focusHours?: number;
  consistencyScore?: number;
}

export interface LeaderboardEntry {
  id?: string;
  rank?: number;
  username?: string;
  level?: number;
  totalXP?: number;
  currentStreak?: number;
}

export interface LeaderboardResponse {
  leaderboard?: LeaderboardEntry[];
}

/** Common API envelope used by task endpoints (see store: `res?.data`). */
export type ApiData<T> = { data?: T };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface CreateTaskPayloadBase {
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  subtasks: Array<{ title: string; weight: number }>;
}

type TimeLimitTaskPayload = CreateTaskPayloadBase & {
  limitType: "time";
  estimatedTime: number;
};

type DayLimitTaskPayload = CreateTaskPayloadBase & {
  limitType: "day";
  deadlineDate: string;
  startingDate: string;
};

export type CreateTaskPayload = TimeLimitTaskPayload | DayLimitTaskPayload;

export interface AuthApiResponse {
  token: string;
  user: User;
}

export interface ScoreResult {
  finalScore: number;
  xpAwarded: number;
}

export type PropsWithChildren = { children: ReactNode };
