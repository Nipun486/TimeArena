"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const subtaskSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false,
    },
    weight: {
        type: Number,
        required: false,
        min: 0,
    },
});
const taskSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    estimatedTime: {
        // in minutes
        type: Number,
        required: [
            function () {
                return this.limitType === "time";
            },
            "Estimated time is required for time-based tasks",
        ],
        min: 0,
    },
    // Used to determine whether the task is limited by time or by days.
    limitType: {
        type: String,
        enum: ["time", "day"],
        default: "time",
        required: true,
    },
    // Used only for day-based tasks to define the final deadline date.
    deadlineDate: {
        type: Date,
        required: [
            function () {
                return this.limitType === "day";
            },
            "Deadline date is required for day-based tasks",
        ],
        default: undefined,
    },
    // Used only for day-based tasks to define when effort starts.
    startingDate: {
        type: Date,
        required: [
            function () {
                return this.limitType === "day";
            },
            "Starting date is required for day-based tasks",
        ],
        default: undefined,
    },
    // Used for day-based tasks and updated on completion by controller logic.
    actualDaysSpent: {
        type: Number,
        default: 0,
    },
    actualTimeSpent: {
        // in minutes
        type: Number,
        required: false,
        min: 0,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"],
    },
    basePoints: {
        type: Number,
        required: true,
        min: 0,
    },
    completionPercentage: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100,
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "in-progress", "completed", "failed"],
        default: "pending",
        index: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    startedAt: {
        type: Date,
        required: false,
    },
    endedAt: {
        type: Date,
        required: false,
    },
    finalScore: {
        type: Number,
        required: false,
    },
    xpAwarded: {
        type: Number,
        required: false,
        min: 0,
    },
    subtasks: {
        type: [subtaskSchema],
        required: true,
        default: [],
    },
}, {
    timestamps: true,
});
taskSchema.pre("save", function () {
    const task = this;
    if (task.limitType === "day" && task.deadlineDate && task.isNew) {
        const deadline = new Date(task.deadlineDate);
        const deadlineUtcDateOnly = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
        const now = new Date();
        const todayUtcDateOnly = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        if (deadlineUtcDateOnly < todayUtcDateOnly) {
            throw new Error("Deadline date must be in the future");
        }
    }
});
// Run before validation: `basePoints` is required, but Mongoose validates before
// `pre("save")`, so assigning it only in `pre("save")` makes every create fail.
taskSchema.pre("validate", function () {
    const task = this;
    if (task.isNew || task.isModified("difficulty")) {
        const difficultyBasePoints = {
            easy: 50,
            medium: 100,
            hard: 150,
        };
        task.basePoints = difficultyBasePoints[task.difficulty] ?? 0;
    }
    const subtasks = task.subtasks ?? [];
    if (subtasks.length === 0) {
        task.completionPercentage = 0;
        return;
    }
    const hasAnyWeight = subtasks.some((s) => typeof s.weight === "number" && s.weight > 0);
    if (!hasAnyWeight) {
        const doneCount = subtasks.filter((s) => s.isDone).length;
        task.completionPercentage = (doneCount / subtasks.length) * 100;
        return;
    }
    const { doneWeight, totalWeight } = subtasks.reduce((acc, subtask) => {
        const weight = typeof subtask.weight === "number" ? subtask.weight : 0;
        acc.totalWeight += weight;
        if (subtask.isDone)
            acc.doneWeight += weight;
        return acc;
    }, { doneWeight: 0, totalWeight: 0 });
    if (totalWeight === 0) {
        task.completionPercentage = 0;
        return;
    }
    task.completionPercentage = (doneWeight / totalWeight) * 100;
});
exports.Task = mongoose_1.default.models.Task ||
    mongoose_1.default.model("Task", taskSchema);
