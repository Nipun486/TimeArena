import mongoose, { type InferSchemaType } from "mongoose";

const subtaskSchema = new mongoose.Schema(
  {
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
  },
);

const taskSchema = new mongoose.Schema(
  {
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
      required: true,
      min: 0,
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
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  },
);

// Run before validation: `basePoints` is required, but Mongoose validates before
// `pre("save")`, so assigning it only in `pre("save")` makes every create fail.
taskSchema.pre("validate", function () {
  const task = this as mongoose.Document & {
    difficulty: "easy" | "medium" | "hard";
    basePoints: number;
    isNew: boolean;
    isModified: (path: string) => boolean;
    subtasks?: Array<{
      isDone?: boolean;
      weight?: number;
    }>;
    completionPercentage?: number;
  };

  if (task.isNew || task.isModified("difficulty")) {
    const difficultyBasePoints: Record<string, number> = {
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

  const hasAnyWeight = subtasks.some(
    (s) => typeof s.weight === "number" && s.weight > 0,
  );

  if (!hasAnyWeight) {
    const doneCount = subtasks.filter((s) => s.isDone).length;
    task.completionPercentage = (doneCount / subtasks.length) * 100;
    return;
  }

  const { doneWeight, totalWeight } = subtasks.reduce(
    (acc, subtask) => {
      const weight = typeof subtask.weight === "number" ? subtask.weight : 0;

      acc.totalWeight += weight;
      if (subtask.isDone) acc.doneWeight += weight;

      return acc;
    },
    { doneWeight: 0, totalWeight: 0 },
  );

  if (totalWeight === 0) {
    task.completionPercentage = 0;
    return;
  }

  task.completionPercentage = (doneWeight / totalWeight) * 100;
});

export type TaskDocument = InferSchemaType<typeof taskSchema> & mongoose.Document;

export const Task =
  (mongoose.models.Task as mongoose.Model<TaskDocument>) ||
  mongoose.model<TaskDocument>("Task", taskSchema);

