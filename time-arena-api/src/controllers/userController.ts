import type { Request, Response } from "express";
import { User } from "../models/User";
import { Task } from "../models/Task";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const toUtcDateString = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Get the authenticated user's profile with selected fields.
 * Returns basic user info without sensitive fields like password.
 */
export const getMe = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      totalXP: user.totalXP,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      createdAt: user.createdAt,
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
    return;
  }
};

/**
 * Get analytics for the authenticated user over the last 7 days.
 * Returns aggregated statistics such as weekly scores, completion rate,
 * focus hours, consistency score, and task breakdowns.
 */
export const getAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const now = new Date();

    const endDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const startDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 6,
        0,
        0,
        0,
        0,
      ),
    );

    const tasks = await Task.find({
      userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    const totalTasksThisWeek = tasks.length;

    const dailyScoresMap: Record<string, number> = {};
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(startDate.getTime());
      day.setUTCDate(startDate.getUTCDate() + i);
      const key = toUtcDateString(day);
      dailyScoresMap[key] = 0;
    }

    let completedCount = 0;
    let totalMinutes = 0;
    const activeDays = new Set<string>();

    const tasksByDifficulty = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    const tasksByStatus = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
    };

    for (const task of tasks) {
      const createdAt = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
      const dayKey = toUtcDateString(createdAt);

      if (task.status === "completed") {
        completedCount += 1;
        activeDays.add(dayKey);

        if (typeof task.finalScore === "number") {
          if (dailyScoresMap[dayKey] !== undefined) {
            dailyScoresMap[dayKey] += task.finalScore;
          }
        }
      }

      if (typeof task.actualTimeSpent === "number") {
        totalMinutes += task.actualTimeSpent;
      }

      if (task.difficulty === "easy" || task.difficulty === "medium" || task.difficulty === "hard") {
        tasksByDifficulty[task.difficulty] += 1;
      }

      switch (task.status) {
        case "pending":
          tasksByStatus.pending += 1;
          break;
        case "in-progress":
          tasksByStatus.inProgress += 1;
          break;
        case "completed":
          tasksByStatus.completed += 1;
          break;
        case "failed":
          tasksByStatus.failed += 1;
          break;
        default:
          break;
      }
    }

    const weeklyScores = Object.keys(dailyScoresMap)
      .sort()
      .map((date) => ({
        date,
        score: dailyScoresMap[date],
      }));

    const completionRate =
      totalTasksThisWeek === 0
        ? 0
        : Math.round((completedCount / totalTasksThisWeek) * 100);

    const focusHours = Math.round((totalMinutes / 60) * 10) / 10;

    const consistencyScore = Math.round((activeDays.size / 7) * 100);

    res.status(200).json({
      weeklyScores,
      completionRate,
      focusHours,
      consistencyScore,
      tasksByDifficulty,
      tasksByStatus,
      totalTasksThisWeek,
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
    return;
  }
};

export default {
  getMe,
  getAnalytics,
};

