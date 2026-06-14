"use client";

type Props = {
  points: number;
  earnedPoints: number;
  completedCount: number;
  streak: number;
  purchasedCount: number;
};

export default function ProgressPanel({
  points,
  earnedPoints,
  completedCount,
  streak,
  purchasedCount,
}: Props) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          Balance
        </p>
        <p className="mt-2 text-3xl font-bold text-emerald-100">{points}</p>
        <p className="mt-1 text-xs text-emerald-100/70">spendable points</p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Earned
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-100">{earnedPoints}</p>
        <p className="mt-1 text-xs text-slate-400">from visits and habits</p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Completed
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-100">{completedCount}</p>
        <p className="mt-1 text-xs text-slate-400">habits finished</p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Streak
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-100">{streak}</p>
        <p className="mt-1 text-xs text-slate-400">
          days active • {purchasedCount} shop items
        </p>
      </div>
    </section>
  );
}
