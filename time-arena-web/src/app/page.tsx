import Link from "next/link";

export default function Page() {
  return (
    <div>
      <section
        className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-6"
        style={{
          backgroundImage: `radial-gradient(
            circle at 1px 1px,
            rgb(55,65,81) 1px,
            transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      >
        <span className="inline-block bg-blue-900 text-blue-300 rounded-full px-4 py-2 text-sm font-medium mb-8">
          🎮 Gamified Productivity
        </span>

        <h1 className="text-5xl md:text-7xl font-black text-white">
          Turn Your Tasks Into
        </h1>
        <h2 className="text-5xl md:text-7xl font-black bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          A Scoring Arena
        </h2>

        <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          Complete tasks faster, earn more points. Beat your personal best.
          Climb the leaderboard.
        </p>

        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <Link
            href="/auth/register"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors duration-200"
          >
            Start Playing Free →
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl text-lg transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>

        <div className="flex gap-8 mt-12 flex-wrap justify-center">
          <span className="text-gray-500 text-sm">⭐ Score-based tasks</span>
          <span className="text-gray-500 text-sm">🔥 Daily streak system</span>
          <span className="text-gray-500 text-sm">🏆 Global leaderboard</span>
        </div>
      </section>

      <section className="bg-gray-800 py-20 px-6">
        <h3 className="text-3xl font-bold text-white text-center mb-4">
          Why Time Arena?
        </h3>
        <p className="text-gray-400 text-center mb-12">
          Not just a todo list. A game.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-xl font-bold text-white mb-3">
              Smart Scoring Engine
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Every task earns points based on difficulty, speed, and how much
              you actually completed.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-8">
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="text-xl font-bold text-white mb-3">
              XP &amp; Level System
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Earn XP with every completed task. Level up from Bronze to Diamond
              and unlock exclusive badges.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-8">
            <div className="text-4xl mb-4">🔥</div>
            <h4 className="text-xl font-bold text-white mb-3">
              Streak Rewards
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Complete tasks daily to build streaks. Miss a day and you start
              over. Stay consistent.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
