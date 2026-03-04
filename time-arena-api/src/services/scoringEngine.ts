/**
 * Calculates the final score and XP awarded for a given task.
 *
 * @param task - The task object containing scoring-related fields.
 * @param task.basePoints - The base point value for the task.
 * @param task.difficulty - The difficulty level of the task (`"easy"`, `"medium"`, `"hard"`, or unknown).
 * @param task.completionPercentage - How much of the task is completed (0–100). `null`/`undefined` is treated as 0.
 * @param task.actualTimeSpent - The actual time spent on the task.
 * @param task.estimatedTime - The estimated time for the task.
 *
 * @returns An object containing the rounded `finalScore` and `xpAwarded`.
 */


export function calculateScore(task: {
  basePoints: number;
  difficulty?: string | null;
  completionPercentage?: number | null;
  actualTimeSpent?: number | null;
  estimatedTime?: number | null;
}): { finalScore: number; xpAwarded: number } {
  const {
    basePoints,
    difficulty,
    completionPercentage,
    actualTimeSpent,
    estimatedTime,
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

  const rawFinalScore = basePoints * difficultyMultiplier * timeFactor * completionFactor;

  // Apply rounding rules and XP non-negativity constraint
  const finalScore = Math.round(rawFinalScore);
  const xpAwarded = finalScore > 0 ? Math.round(finalScore) : 0;

  return { finalScore, xpAwarded };
}

