"use client";

import React from "react";
import type { DayData } from "./types";

interface Props {
  days: DayData[];
  activeDayId: string;
  setActiveDayId: (id: string) => void;
  todayId: string;
  nextDayExists: boolean;
  onPlanNextDay: () => void;
}

export default function DayTabs({
  days,
  activeDayId,
  setActiveDayId,
  todayId,
  nextDayExists,
  onPlanNextDay,
}: Props) {
  const daysScrollerRef = React.useRef<HTMLDivElement>(null);

  const scrollDays = (direction: -1 | 1) => {
    const scroller = daysScrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: scroller.clientWidth * direction,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-2 flex min-w-0 flex-col gap-2 sm:mb-1">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => scrollDays(-1)}
          aria-label="Scroll to earlier days"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800"
        >
          ←
        </button>
        <div
          ref={daysScrollerRef}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth whitespace-nowrap pb-1"
        >
        {days
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((day) => {
            const isActive = day.id === activeDayId;
            const isToday = day.id === todayId;
            const hasCompletedTasks = day.habits.some(
              (habit) => habit.completed,
            );
            return (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`flex-none snap-start rounded-full border px-3 py-2 text-sm font-semibold transition-all sm:py-1.5 sm:text-xs ${
                  hasCompletedTasks
                    ? isActive
                      ? "border-emerald-300 bg-emerald-500 text-emerald-950"
                      : "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
                    : isActive
                      ? "border-transparent bg-emerald-500 text-emerald-950"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {day.id}
                {isToday && (
                  <span className="ml-1 text-[0.6rem] uppercase">(Today)</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollDays(1)}
          aria-label="Scroll to later days"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800"
        >
          →
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          Start a new line with this day&apos;s tasks.
        </p>
        <button
          type="button"
          onClick={onPlanNextDay}
          className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/20 sm:py-1.5 sm:text-xs"
        >
          {nextDayExists ? "Open next day" : "+ Plan next day"}
        </button>
      </div>
    </section>
  );
}
