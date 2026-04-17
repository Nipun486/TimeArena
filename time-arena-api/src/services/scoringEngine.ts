/**
 * Calculates day-based timing factor from deadline and completion date.
 *
 * @param task - The task object containing `deadlineDate` and `endedAt`.
 * @returns A multiplier based on early/on-time/late completion.
 */
function getDayFactor(task: { deadlineDate?: string | Date | null; endedAt?: string | Date | null }): number {
  if (!task.deadlineDate || !task.endedAt) return 1.0;

  const deadlineUTC = new Date(task.deadlineDate);
  deadlineUTC.setUTCHours(0, 0, 0, 0);

  const endedUTC = new Date(task.endedAt);
  endedUTC.setUTCHours(0, 0, 0, 0);

  const diffMs = deadlineUTC.getTime() - endedUTC.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 1) return 1.2;
  if (diffDays >= 0) return 1.0;
  if (diffDays >= -3) return 0.8;
  return 0.5;
}

/**
 * Calculates actual calendar days spent between task creation and completion.
 *
 * @param task - The task object containing `startingDate`/`createdAt` and `endedAt`.
 * @returns Rounded-up total days spent, or 0 when unavailable.
 */
function getActualDaysSpent(task: {
  startingDate?: string | Date | null;
  createdAt?: string | Date | null;
  endedAt?: string | Date | null;
}): number {
  const startedFrom = task.startingDate ?? task.createdAt;
  if (!startedFrom || !task.endedAt) return 0;

  const diffMs = new Date(task.endedAt).getTime() - new Date(startedFrom).getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the final score and XP awarded for a given task.
 *
 * @param task - The task object containing scoring-related fields.
 * @param task.basePoints - The base point value for the task.
 * @param task.difficulty - The difficulty level of the task (`"easy"`, `"medium"`, `"hard"`, or unknown).
 * @param task.completionPercentage - How much of the task is completed (0–100). `null`/`undefined` is treated as 0.
 * @param task.actualTimeSpent - The actual time spent on the task.
 * @param task.estimatedTime - The estimated time for the task.
 * @param task.limitType - The task limit type (`"time"` or `"day"`). Missing defaults to time logic.
 * @param task.deadlineDate - The task deadline date used by day-based scoring.
 * @param task.startingDate - The intended start date used by day-based scoring.
 * @param task.createdAt - The task creation date used for actual day computation.
 * @param task.endedAt - The task completion date used by day-based scoring.
 *
 * @returns An object containing the rounded `finalScore`, `xpAwarded`, and `actualDaysSpent`.
 */


export function calculateScore(task: {
  basePoints: number;
  difficulty?: string | null;
  completionPercentage?: number | null;
  actualTimeSpent?: number | null;
  estimatedTime?: number | null;
  limitType?: string | null;
  deadlineDate?: string | Date | null;
  startingDate?: string | Date | null;
  createdAt?: string | Date | null;
  endedAt?: string | Date | null;
}): { finalScore: number; xpAwarded: number; actualDaysSpent: number | null } {
  const {
    basePoints,
    difficulty,
    completionPercentage,
    actualTimeSpent,
    estimatedTime,
    limitType,
  } = task;

  // Difficulty multiplier based on task difficulty
  let difficultyMultiplier: number;
  switch ((difficulty || '').toLowerCase()) {
    case 'easy':
      difficultyMultiplier = 1.0;
      break;
    case 'medium':
      difficultyMultiplier = 1.5;
      break;
    case 'hard':
      difficultyMultiplier = 2.0;
      break;
    default:
      difficultyMultiplier = 1.0;
      break;
  }

  // Completion factor based on how much of the task is completed
  const safeCompletion =
    completionPercentage == null ? 0 : Math.max(0, Math.min(100, completionPercentage));
  let completionFactor: number;
  if (safeCompletion === 100) {
    completionFactor = 1.0;
  } else if (safeCompletion >= 50) {
    completionFactor = 0.5;
  } else if (safeCompletion >= 1) {
    completionFactor = 0.2;
  } else {
    completionFactor = -0.5;
  }

  let timingFactor: number;
  let actualDaysSpent: number | null = null;

  if (limitType === 'day') {
    timingFactor = getDayFactor(task);
    actualDaysSpent = getActualDaysSpent(task);
  } else {
    // Time factor based on performance against the estimated time
    let timeFactor = 1.0;
    if (
      estimatedTime &&
      estimatedTime > 0 &&
      actualTimeSpent != null
    ) {
      if (actualTimeSpent < estimatedTime) {
        timeFactor = 1.2;
      } else if (actualTimeSpent === estimatedTime) {
        timeFactor = 1.0;
      } else if (actualTimeSpent > estimatedTime) {
        timeFactor = 0.8;
      }
    }
    timingFactor = timeFactor;
  }

  const rawFinalScore = basePoints * difficultyMultiplier * timingFactor * completionFactor;

  // Apply rounding rules and XP non-negativity constraint
  const finalScore = Math.round(rawFinalScore);
  const xpAwarded = finalScore > 0 ? Math.round(finalScore) : 0;

  return { finalScore, xpAwarded, actualDaysSpent };
}

