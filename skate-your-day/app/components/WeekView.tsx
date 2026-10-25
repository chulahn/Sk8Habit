"use client";

import { useEffect, useRef, useState } from "react";
import type { DayData, Habit } from "./types";

type Props = {
  days: DayData[];
  weekDayIds: string[];
  todayId: string;
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  onPlanDay: (dayId: string) => void;
  onToggleHabit: (dayId: string, habitId: number) => void;
};

function getDayLabel(dayId: string) {
  const [year, month, day] = dayId.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
    date: new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(date),
  };
}

function getLinePoints(habits: Habit[]) {
  return habits
    .filter((habit) => habit.completed)
    .sort((a, b) => a.timeMins - b.timeMins)
    .map(
      (habit) =>
        `${(habit.timeMins / (24 * 60)) * 100},${habit.y}`,
    )
    .join(" ");
}

export default function WeekView({
  days,
  weekDayIds,
  todayId,
  activeDayId,
  onSelectDay,
  onPlanDay,
  onToggleHabit,
}: Props) {
  const [expandedDayIds, setExpandedDayIds] = useState<Set<string>>(
    () => new Set(),
  );
  const previousCompletedHabits = useRef(new Map<string, Set<number>>());
  const weekScrollerRef = useRef<HTMLDivElement>(null);

  const daysById = new Map(days.map((day) => [day.id, day]));

  const scrollWeek = (direction: -1 | 1) => {
    const scroller = weekScrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: scroller.clientWidth * direction,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const completedByDay = new Map(
      days.map((day) => [
        day.id,
        new Set(
          day.habits
            .filter((habit) => habit.completed)
            .map((habit) => habit.id),
        ),
      ]),
    );
    const newlyCompletedDayIds = days
      .filter((day) => {
        const previous = previousCompletedHabits.current.get(day.id);
        return day.habits.some(
          (habit) => habit.completed && !previous?.has(habit.id),
        );
      })
      .map((day) => day.id);

    previousCompletedHabits.current = completedByDay;
    if (newlyCompletedDayIds.length > 0) {
      setExpandedDayIds((current) => {
        const next = new Set(current);
        newlyCompletedDayIds.forEach((dayId) => next.add(dayId));
        return next;
      });
    }
  }, [days]);

  return (
    <section aria-label="Week overview" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Your weekly line</h2>
          <p className="text-sm text-slate-400">
            Swipe through your week and check off tasks as you land them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden text-xs text-slate-500 sm:block">
            {weekDayIds[0]} — {weekDayIds[weekDayIds.length - 1]}
          </p>
          <button
            type="button"
            onClick={() => scrollWeek(-1)}
            aria-label="Scroll to previous days"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollWeek(1)}
            aria-label="Scroll to next days"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={weekScrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
      >
        {weekDayIds.map((dayId) => {
          const day = daysById.get(dayId);
          const { weekday, date } = getDayLabel(dayId);
          const completedCount =
            day?.habits.filter((habit) => habit.completed).length ?? 0;
          const hasCompletedTasks = completedCount > 0;
          const pathPoints = day ? getLinePoints(day.habits) : "";

          return (
            <article
              key={dayId}
              className={`min-w-0 flex-none basis-[calc((100%-1.5rem)/3)] snap-start rounded-xl border p-3 sm:basis-[calc((100%-2.25rem)/4)] ${
                hasCompletedTasks
                  ? activeDayId === dayId
                    ? "border-emerald-400 bg-emerald-400/15"
                    : "border-emerald-500/40 bg-emerald-500/[0.08]"
                  : activeDayId === dayId
                    ? "border-emerald-400/70 bg-emerald-400/5"
                    : "border-slate-700 bg-slate-900/80"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (!day) {
                    onPlanDay(dayId);
                    return;
                  }
                  onSelectDay(dayId);
                }}
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-label={
                  day
                    ? `Select ${weekday}, ${date}`
                    : `Plan a line for ${weekday}, ${date}`
                }
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-100">
                    {weekday}
                    {dayId === todayId && (
                      <span className="ml-1 text-[0.6rem] uppercase text-cyan-300">
                        Today
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">{date}</span>
                </span>
                {day && (
                  <span className="flex items-center gap-1.5">
                    {hasCompletedTasks && (
                      <span
                        aria-label="Tasks completed"
                        title="Tasks completed"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-300"
                      >
                        ✓
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {completedCount}/{day.habits.length}
                    </span>
                  </span>
                )}
              </button>

              {day ? (
                <>
                  <div className="mt-3 h-20 overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/80 p-1">
                    <svg
                      viewBox="0 0 100 100"
                      role="img"
                      aria-label={`${completedCount} completed tasks plotted on the line`}
                      className="h-full w-full"
                    >
                      {[25, 50, 75].map((x) => (
                        <line
                          key={x}
                          x1={x}
                          y1="8"
                          x2={x}
                          y2="92"
                          stroke="rgba(148,163,184,0.18)"
                          strokeWidth="1"
                        />
                      ))}
                      {pathPoints && (
                        <polyline
                          points={pathPoints}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      {day.habits.map((habit) => (
                        <circle
                          key={habit.id}
                          cx={(habit.timeMins / (24 * 60)) * 100}
                          cy={habit.y}
                          r={habit.completed ? 4 : 3}
                          fill={
                            habit.completed
                              ? "#22c55e"
                              : "rgba(148,163,184,0.8)"
                          }
                        />
                      ))}
                    </svg>
                  </div>
                  <button
                    type="button"
                    aria-expanded={expandedDayIds.has(dayId)}
                    onClick={() =>
                      setExpandedDayIds((current) => {
                        const next = new Set(current);
                        if (next.has(dayId)) next.delete(dayId);
                        else next.add(dayId);
                        return next;
                      })
                    }
                    className="mt-2 w-full rounded px-1 py-1 text-left text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    {expandedDayIds.has(dayId)
                      ? "Hide tasks −"
                      : "Show tasks +"}
                  </button>
                  {expandedDayIds.has(dayId) && (
                    <ul className="mt-1 space-y-1">
                      {day.habits.length === 0 ? (
                        <li className="px-1 py-1 text-xs text-slate-500">
                          No tasks planned yet.
                        </li>
                      ) : (
                        day.habits
                          .slice()
                          .sort((a, b) => a.timeMins - b.timeMins)
                          .map((habit) => (
                            <li key={habit.id}>
                              <button
                                type="button"
                                onClick={() => onToggleHabit(dayId, habit.id)}
                                className="flex w-full items-start gap-2 rounded px-1 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
                              >
                                <span
                                  aria-hidden="true"
                                  className={
                                    habit.completed
                                      ? "text-emerald-400"
                                      : "text-slate-500"
                                  }
                                >
                                  {habit.completed ? "✓" : "○"}
                                </span>
                                <span
                                  className={
                                    habit.completed
                                      ? "line-through opacity-70"
                                      : ""
                                  }
                                >
                                  {habit.name}
                                </span>
                              </button>
                            </li>
                          ))
                      )}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onPlanDay(dayId)}
                  className="mt-3 flex h-20 w-full items-center justify-center rounded-lg border border-dashed border-slate-700 text-xs text-slate-400 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
                >
                  + Plan this day
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
