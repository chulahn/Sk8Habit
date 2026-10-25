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
    <section className="grid grid-cols-4 gap-1.5 sm:gap-3">
      <div className="min-w-0 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-2 sm:p-4">
        <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-emerald-200 sm:text-xs">
          Balance
        </p>
        <p className="mt-1 truncate text-base font-bold text-emerald-100 sm:mt-2 sm:text-3xl">
          {points}
        </p>
        <p className="mt-1 hidden text-xs text-emerald-100/70 sm:block">
          spendable points
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 sm:p-4">
        <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
          Earned
        </p>
        <p className="mt-1 truncate text-base font-bold text-slate-100 sm:mt-2 sm:text-2xl">
          {earnedPoints}
        </p>
        <p className="mt-1 hidden text-xs text-slate-400 sm:block">
          from visits and habits
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 sm:p-4">
        <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
          Completed
        </p>
        <p className="mt-1 truncate text-base font-bold text-slate-100 sm:mt-2 sm:text-2xl">
          {completedCount}
        </p>
        <p className="mt-1 hidden text-xs text-slate-400 sm:block">
          habits finished
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 sm:p-4">
        <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
          Streak
        </p>
        <p className="mt-1 truncate text-base font-bold text-slate-100 sm:mt-2 sm:text-2xl">
          {streak}
        </p>
        <p className="mt-1 hidden text-xs text-slate-400 sm:block">
          days active • {purchasedCount} shop items
        </p>
      </div>
    </section>
  );
}
