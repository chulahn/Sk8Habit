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
  return (
    <section className="mb-4 flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {days
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((day) => {
            const isActive = day.id === activeDayId;
            const isToday = day.id === todayId;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all sm:py-1.5 sm:text-xs ${
                  isActive
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
      <div className="flex flex-wrap items-center gap-2">
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
