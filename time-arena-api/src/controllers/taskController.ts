import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { Task } from "../models/Task";
import { calculateScore } from "../services/scoringEngine";
import { User } from "../models/User";

type AuthPayload = JwtPayload & { id?: string; userId?: string };

function getUserIdFromRequest(req: Request): string | undefined {
  const authPayload = req.user as AuthPayload | string | undefined;

  if (authPayload && typeof authPayload === "object") {
    return authPayload.id ?? authPayload.userId;
  }

  return undefined;
}

export async function createTask(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      estimatedTime,
      deadlineDate,
      estimatedDays,
      limitType: rawLimitType,
      difficulty,
      subtasks,
      // Explicitly ignore disallowed fields from req.body
      basePoints: _ignoredBasePoints,
      finalScore: _ignoredFinalScore,
      status: _ignoredStatus,
      userId: _ignoredUserId,
      actualTimeSpent: _ignoredActualTimeSpent,
      actualDaysSpent: _ignoredActualDaysSpent,
    } = req.body ?? {};

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!difficulty) {
      return res.status(400).json({ message: "Difficulty is required" });
    }

    let limitType: "time" | "day" = "time";
    if (rawLimitType !== undefined) {
      if (rawLimitType === "time" || rawLimitType === "day") {
        limitType = rawLimitType;
      } else {
        return res.status(400).json({ message: "limitType must be time or day" });
      }
    }

    const taskData: Record<string, unknown> = {
      title,
      description,
      difficulty,
      limitType,
      userId,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      // basePoints, completionPercentage, status, finalScore are not accepted
      // from the client. basePoints and completionPercentage are set by the
      // pre-save hook, status defaults to "pending", and finalScore is only
      // set when the task is completed.
    };

    // Applies only to time-based tasks.
    if (limitType === "time") {
      if (estimatedTime === undefined || estimatedTime === null || estimatedTime === "") {
        return res
          .status(400)
          .json({ message: "Estimated time is required for time-based tasks" });
      }

      const parsedEstimatedTime = Number(estimatedTime);
      if (Number.isNaN(parsedEstimatedTime) || parsedEstimatedTime < 1) {
        return res
          .status(400)
          .json({ message: "Estimated time must be at least 1" });
      }

      taskData.estimatedTime = parsedEstimatedTime;
    }

    // Applies only to day-based tasks.
    if (limitType === "day") {
      if (!deadlineDate) {
        return res
          .status(400)
          .json({ message: "Deadline date is required for day-based tasks" });
      }

      if (estimatedDays === undefined || estimatedDays === null || estimatedDays === "") {
        return res
          .status(400)
          .json({ message: "Estimated days is required for day-based tasks" });
      }

      const parsedEstimatedDays = Number(estimatedDays);
      if (Number.isNaN(parsedEstimatedDays) || parsedEstimatedDays < 1) {
        return res
          .status(400)
          .json({ message: "Estimated days must be at least 1" });
      }

      const parsedDeadline = new Date(deadlineDate);
      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ message: "Deadline date is required for day-based tasks" });
      }

      const deadlineUtcDateOnly = new Date(
        Date.UTC(
          parsedDeadline.getUTCFullYear(),
          parsedDeadline.getUTCMonth(),
          parsedDeadline.getUTCDate(),
        ),
      );
      const todayUtcDateOnly = new Date();
      todayUtcDateOnly.setUTCHours(0, 0, 0, 0);

      if (deadlineUtcDateOnly < todayUtcDateOnly) {
        return res
          .status(400)
          .json({ message: "Deadline date must be today or in the future" });
      }

      taskData.deadlineDate = new Date(deadlineDate);
      taskData.estimatedDays = parsedEstimatedDays;
    }

    const createdTask = await Task.create(taskData);

    return res.status(201).json(createdTask);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
}

export async function getAllTasks(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, difficulty } = req.query;

    const filter: Record<string, unknown> = { userId };

    const allowedStatuses = ["pending", "in-progress", "completed", "failed"];
    const allowedDifficulties = ["easy", "medium", "hard"];

    if (
      typeof status === "string" &&
      allowedStatuses.includes(status)
    ) {
      filter.status = status;
    }

    if (
      typeof difficulty === "string" &&
      allowedDifficulties.includes(difficulty)
    ) {
      filter.difficulty = difficulty;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).exec();

    return res.status(200).json(tasks);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
}

export async function getTaskById(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(req.params.id).exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(task);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching task by id:", error);
    return res.status(500).json({ message: "Failed to fetch task" });
  }
}

export async function startTask(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(req.params.id).exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (task.status !== "pending") {
      return res.status(400).json({ message: "Task cannot be started" });
    }

    task.status = "in-progress";
    task.startedAt = new Date();

    const updatedTask = await task.save();

    return res.status(200).json(updatedTask);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error starting task:", error);
    return res.status(500).json({ message: "Failed to start task" });
  }
}

export async function toggleSubtask(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(req.params.id).exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const subtask = task.subtasks.id?.(
      req.params.sid as unknown as typeof task.subtasks[number]["_id"],
    );

    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.isDone = !subtask.isDone;

    const updatedTask = await task.save();

    return res.status(200).json(updatedTask);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error toggling subtask:", error);
    return res.status(500).json({ message: "Failed to toggle subtask" });
  }
}

function getUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function completeTask(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(req.params.id).exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (task.status !== "in-progress") {
      return res.status(400).json({ message: "Task is not in progress" });
    }

    task.status = "completed";
    task.endedAt = new Date();

    if (task.limitType === "time") {
      if (task.startedAt) {
        const diffMs = task.endedAt.getTime() - task.startedAt.getTime();
        task.actualTimeSpent = Math.round(diffMs / (1000 * 60));
      } else {
        task.actualTimeSpent = 0;
      }
    }

    if (task.limitType === "day") {
      task.actualTimeSpent = 0;
    }

    // First save to ensure pre-save hook finalizes completionPercentage
    await task.save();

    const result = calculateScore(task);
    const { finalScore, xpAwarded, actualDaysSpent } = result;

    if (task.limitType === "day" && result.actualDaysSpent !== null) {
      task.actualDaysSpent = actualDaysSpent;
    }

    task.finalScore = finalScore;
    task.xpAwarded = xpAwarded;

    const taskWithScore = await task.save();

    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(500).json({ message: "User not found for scoring" });
    }

    user.totalXP += xpAwarded;

    const today = getUtcDateOnly(new Date());
    const lastActive = user.lastActiveDate
      ? getUtcDateOnly(user.lastActiveDate)
      : undefined;

    if (!lastActive) {
      user.currentStreak = 1;
    } else {
      const diffDays =
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 0) {
        // already counted today, do nothing
      } else if (diffDays === 1) {
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
      } else if (diffDays >= 2) {
        user.currentStreak = 1;
      }
    }

    user.lastActiveDate = today;

    await user.save();

    return res.status(200).json(taskWithScore);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error completing task:", error);
    return res.status(500).json({ message: "Failed to complete task" });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(req.params.id).exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (task.status === "in-progress") {
      return res
        .status(400)
        .json({ message: "Cannot delete a task that is in progress" });
    }

    await task.deleteOne();

    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
}

const taskController = {
  getAllTasks,
  createTask,
  getTaskById,
  startTask,
  toggleSubtask,
  completeTask,
  deleteTask,
};

export default taskController;

