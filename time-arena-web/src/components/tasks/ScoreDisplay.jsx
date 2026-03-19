"use client";

import { useEffect, useState } from "react";

export default function ScoreDisplay({ scoreResult, task }) {
  const finalScore = Number(scoreResult?.finalScore ?? 0);
  const xpAwarded = Number(scoreResult?.xpAwarded ?? 0);

  const [displayedScore, setDisplayedScore] = useState(0);
  const [showFactors, setShowFactors] = useState(false);

  const scoreColor =
    finalScore > 0
      ? "text-green-400"
      : finalScore === 0
        ? "text-gray-400"
        : "text-red-400";

  const scorePrefix = finalScore > 0 ? "+" : "";

  const completionPercentage = Number(task?.completionPercentage ?? 0);
  const estimatedTime = Number(task?.estimatedTime ?? 0);
  const actualTimeSpent = Number(task?.actualTimeSpent ?? 0);

  const completionFactorText =
    completionPercentage === 100
      ? "1.0×"
      : completionPercentage >= 50
        ? "0.5×"
        : completionPercentage >= 1
          ? "0.2×"
          : "−0.5×";

  const timeFactorText =
    actualTimeSpent < estimatedTime
      ? "1.2× (Early! 🚀)"
      : actualTimeSpent === estimatedTime
        ? "1.0× (On time ✓)"
        : "0.8× (Late ⚠️)";

  const difficulty = String(task?.difficulty ?? "").toLowerCase();
  const difficultyMultiplierText =
    difficulty === "hard"
      ? "2.0×"
      : difficulty === "medium"
        ? "1.5×"
        : "1.0×";

  useEffect(() => {
    if (!Number.isFinite(finalScore)) return;

    setDisplayedScore(0);

    const step = finalScore / 40;
    if (step === 0) {
      setDisplayedScore(finalScore);
      return;
    }

    let current = 0;
    const intervalId = setInterval(() => {
      current += step;

      if (finalScore >= 0) {
        if (current >= finalScore) {
          setDisplayedScore(finalScore);
          clearInterval(intervalId);
          return;
        }
      } else {
        if (current <= finalScore) {
          setDisplayedScore(finalScore);
          clearInterval(intervalId);
          return;
        }
      }

      setDisplayedScore(current);
    }, 50);

    return () => clearInterval(intervalId);
  }, [finalScore]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setShowFactors(true), 400);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* SECTION 1 — Header */}
        <div className="text-2xl font-bold text-white text-center">
          🏆 TASK COMPLETE!
        </div>

        {/* SECTION 2 — Score display */}
        <div className="space-y-2">
          <div
            className={[
              "text-7xl font-black text-center transition-all duration-100",
              scoreColor,
            ].join(" ")}
          >
            {scorePrefix}
            {Math.round(displayedScore)}
          </div>
          <div className="text-gray-400 text-sm tracking-widest text-center">
            FINAL SCORE
          </div>
        </div>

        {/* SECTION 3 — XP awarded */}
        <div className="text-center">
          {xpAwarded > 0 ? (
            <div className="text-purple-400 text-xl font-bold">
              ✨ +{xpAwarded} XP
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No XP awarded this time</div>
          )}
        </div>

        {/* SECTION 4 — Factor breakdown (reveals after delay) */}
        <div
          className={[
            "transition-all duration-300",
            showFactors ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-white font-semibold mb-4 text-center">
              Score Factors
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-gray-400 text-xs tracking-widest">
                  COMPLETION
                </div>
                <div className="text-white text-lg font-bold mt-1">
                  {completionFactorText}
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-xs tracking-widest">TIME</div>
                <div className="text-white text-lg font-bold mt-1">
                  {timeFactorText}
                </div>
              </div>

              <div className="text-center">
                <div className="text-gray-400 text-xs tracking-widest">
                  DIFFICULTY
                </div>
                <div className="text-white text-lg font-bold mt-1">
                  {difficultyMultiplierText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

