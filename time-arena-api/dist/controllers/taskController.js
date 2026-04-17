"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.getAllTasks = getAllTasks;
exports.getTaskById = getTaskById;
exports.startTask = startTask;
exports.toggleSubtask = toggleSubtask;
exports.completeTask = completeTask;
exports.deleteTask = deleteTask;
const Task_1 = require("../models/Task");
const scoringEngine_1 = require("../services/scoringEngine");
const User_1 = require("../models/User");
function getUserIdFromRequest(req) {
    const authPayload = req.user;
    if (authPayload && typeof authPayload === "object") {
        return authPayload.id ?? authPayload.userId;
    }
    return undefined;
}
async function createTask(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { title, description, estimatedTime, difficulty, subtasks, 
        // Explicitly ignore disallowed fields from req.body
        basePoints: _ignoredBasePoints, finalScore: _ignoredFinalScore, status: _ignoredStatus, userId: _ignoredUserId, } = req.body ?? {};
        const errors = [];
        if (!title || typeof title !== "string") {
            errors.push("title is required and must be a string");
        }
        if (typeof estimatedTime !== "number" ||
            Number.isNaN(estimatedTime) ||
            estimatedTime < 0) {
            errors.push("estimatedTime is required and must be a non-negative number");
        }
        if (!difficulty ||
            typeof difficulty !== "string" ||
            !["easy", "medium", "hard"].includes(difficulty)) {
            errors.push("difficulty is required and must be one of: easy, medium, hard");
        }
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation error",
                errors,
            });
        }
        const task = new Task_1.Task({
            title,
            description,
            estimatedTime,
            difficulty,
            subtasks: Array.isArray(subtasks) ? subtasks : [],
            userId,
            // basePoints, completionPercentage, status, finalScore are not accepted
            // from the client. basePoints and completionPercentage are set by the
            // pre-save hook, status defaults to "pending", and finalScore is only
            // set when the task is completed.
        });
        const createdTask = await task.save();
        return res.status(201).json(createdTask);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Failed to create task" });
    }
}
async function getAllTasks(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { status, difficulty } = req.query;
        const filter = { userId };
        const allowedStatuses = ["pending", "in-progress", "completed", "failed"];
        const allowedDifficulties = ["easy", "medium", "hard"];
        if (typeof status === "string" &&
            allowedStatuses.includes(status)) {
            filter.status = status;
        }
        if (typeof difficulty === "string" &&
            allowedDifficulties.includes(difficulty)) {
            filter.difficulty = difficulty;
        }
        const tasks = await Task_1.Task.find(filter).sort({ createdAt: -1 }).exec();
        return res.status(200).json(tasks);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ message: "Failed to fetch tasks" });
    }
}
async function getTaskById(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const task = await Task_1.Task.findById(req.params.id).exec();
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.userId.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        return res.status(200).json(task);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching task by id:", error);
        return res.status(500).json({ message: "Failed to fetch task" });
    }
}
async function startTask(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const task = await Task_1.Task.findById(req.params.id).exec();
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
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error starting task:", error);
        return res.status(500).json({ message: "Failed to start task" });
    }
}
async function toggleSubtask(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const task = await Task_1.Task.findById(req.params.id).exec();
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.userId.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const subtask = task.subtasks.id?.(req.params.sid);
        if (!subtask) {
            return res.status(404).json({ message: "Subtask not found" });
        }
        subtask.isDone = !subtask.isDone;
        const updatedTask = await task.save();
        return res.status(200).json(updatedTask);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error toggling subtask:", error);
        return res.status(500).json({ message: "Failed to toggle subtask" });
    }
}
function getUtcDateOnly(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
async function completeTask(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const task = await Task_1.Task.findById(req.params.id).exec();
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.userId.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (task.status !== "in-progress") {
            return res.status(400).json({ message: "Task is not in progress" });
        }
        const now = new Date();
        task.status = "completed";
        task.endedAt = now;
        if (task.startedAt) {
            const diffMs = task.endedAt.getTime() - task.startedAt.getTime();
            const minutes = Math.round(diffMs / 60000);
            task.actualTimeSpent = Math.max(0, minutes);
        }
        // First save to ensure pre-save hook finalizes completionPercentage
        await task.save();
        const { finalScore, xpAwarded } = (0, scoringEngine_1.calculateScore)({
            basePoints: task.basePoints,
            difficulty: task.difficulty,
            completionPercentage: task.completionPercentage,
            actualTimeSpent: task.actualTimeSpent,
            estimatedTime: task.estimatedTime,
        });
        task.finalScore = finalScore;
        task.xpAwarded = xpAwarded;
        const taskWithScore = await task.save();
        const user = await User_1.User.findById(userId).exec();
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
        }
        else {
            const diffDays = (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays === 0) {
                // already counted today, do nothing
            }
            else if (diffDays === 1) {
                user.currentStreak += 1;
                if (user.currentStreak > user.longestStreak) {
                    user.longestStreak = user.currentStreak;
                }
            }
            else if (diffDays >= 2) {
                user.currentStreak = 1;
            }
        }
        user.lastActiveDate = today;
        await user.save();
        return res.status(200).json(taskWithScore);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error completing task:", error);
        return res.status(500).json({ message: "Failed to complete task" });
    }
}
async function deleteTask(req, res) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const task = await Task_1.Task.findById(req.params.id).exec();
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
    }
    catch (error) {
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
exports.default = taskController;
