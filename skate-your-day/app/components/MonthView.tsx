import { useRef } from "react";
import type { DayData } from "./types";

type Props = {
  days: DayData[];
  monthDayIds: string[];
  todayId: string;
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  onPlanDay: (dayId: string) => void;
};

function getMonthDayIds(year: number, month: number) {
  const firstOfMonth = new Date(year, month - 1, 1, 12);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  firstOfMonth.setDate(firstOfMonth.getDate() - startOffset);

  return Array.from({ length: 42 }, () => {
    const dayId = `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, "0")}-${String(firstOfMonth.getDate()).padStart(2, "0")}`;
    firstOfMonth.setDate(firstOfMonth.getDate() + 1);
    return dayId;
  });
}

function getDayNumber(dayId: string) {
  const [, , day] = dayId.split("-").map(Number);
  return day;
}

export default function MonthView({
  days,
  monthDayIds,
  todayId,
  activeDayId,
  onSelectDay,
  onPlanDay,
}: Props) {
  const daysById = new Map(days.map((day) => [day.id, day]));
  const monthScrollerRef = useRef<HTMLDivElement>(null);
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const activeMonthDate = new Date(
    Number((activeDayId || todayId).slice(0, 4)),
    Number((activeDayId || todayId).slice(5, 7)) - 1,
    Number((activeDayId || todayId).slice(8, 10)),
    12,
  );

  const monthPanels = [-1, 0, 1].map((offset) => {
    const monthDate = new Date(activeMonthDate);
    monthDate.setMonth(activeMonthDate.getMonth() + offset);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(monthDate);

    return {
      monthKey,
      monthLabel,
      dayIds: offset === 0 ? monthDayIds : getMonthDayIds(monthDate.getFullYear(), monthDate.getMonth() + 1),
    };
  });

  const scrollMonth = (direction: -1 | 1) => {
    const scroller = monthScrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: scroller.clientWidth * direction,
      behavior: "smooth",
    });
  };

  return (
    <section aria-label="Month overview" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Your monthly rhythm</h2>
          <p className="text-sm text-slate-400">
            Swipe or scroll between months and jump into any day.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollMonth(-1)}
            aria-label="Scroll to previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollMonth(1)}
            aria-label="Scroll to next month"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={monthScrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {monthPanels.map(({ monthKey, monthLabel: panelLabel, dayIds }) => {
          const activeMonthKey = (activeDayId || todayId).slice(0, 7);

          return (
            <div
              key={monthKey}
              className="min-w-[calc(100vw-2.5rem)] shrink-0 snap-center rounded-2xl border border-slate-800 bg-slate-950/80 p-1.5 sm:min-w-full sm:p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                <p className="text-xs font-semibold text-cyan-200 sm:text-sm">{panelLabel}</p>
                {monthKey === activeMonthKey && (
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-emerald-200 sm:px-2 sm:text-[10px]">
                    Current
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:gap-1 sm:text-[9px] sm:tracking-[0.1em]">
                {weekdayLabels.map((label) => (
                  <div key={`${monthKey}-${label}`} className="py-1">
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-1.5 grid grid-cols-7 gap-0.5 sm:mt-2 sm:gap-1">
                {dayIds.map((dayId) => {
                  const day = daysById.get(dayId);
                  const dayNumber = getDayNumber(dayId);
                  const isCurrentMonth = dayId.slice(0, 7) === monthKey;
                  const isActive = dayId === activeDayId;
                  const isToday = dayId === todayId;
                  const hasTasks = Boolean(day && day.habits.length > 0);
                  const hasCompletedTasks = Boolean(day && day.habits.some((habit) => habit.completed));
                  const completedCount = day?.habits.filter((habit) => habit.completed).length ?? 0;
                  const visibleHabits = day?.habits.slice(0, 2) ?? [];

                  return (
                    <button
                      key={`${monthKey}-${dayId}`}
                      type="button"
                      onClick={() => {
                        if (day) {
                          onSelectDay(dayId);
                          return;
                        }
                        onPlanDay(dayId);
                      }}
                      className={`min-h-[56px] rounded-lg border p-1 text-left transition-colors sm:min-h-[110px] sm:rounded-xl sm:p-2 ${
                        isActive
                          ? "border-emerald-400 bg-emerald-400/15"
                          : hasCompletedTasks
                            ? "border-emerald-500/70 bg-emerald-500/10 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)] hover:border-emerald-400 hover:bg-emerald-500/15"
                            : isCurrentMonth
                              ? "border-slate-700 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-800/80"
                              : "border-slate-800 bg-slate-950/70 text-slate-500"
                      }`}
                      aria-label={
                        day
                          ? `Select ${dayId}`
                          : `Plan a line for ${dayId}`
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-semibold sm:text-sm ${
                            isActive ? "text-emerald-100" : isCurrentMonth ? "text-slate-200" : "text-slate-400"
                          }`}
                        >
                          {dayNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {hasCompletedTasks && (
                            <span
                              className="inline-flex h-2 w-2 rounded-full bg-emerald-400"
                              aria-label="At least one task completed"
                              title="At least one task completed"
                            />
                          )}
                          {isToday && (
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" aria-label="Today" />
                          )}
                        </div>
                      </div>

                      {day ? (
                        <>
                          <div className="space-y-0.5 sm:space-y-1">
                            {visibleHabits.map((habit) => (
                              <div
                                key={`${monthKey}-${dayId}-${habit.id}`}
                                className="flex items-center gap-1 text-[6px] text-slate-300 sm:text-[10px]"
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    habit.completed ? "bg-emerald-400" : "bg-slate-600"
                                  }`}
                                />
                                <span className="truncate">{habit.name}</span>
                              </div>
                            ))}
                          </div>

                          {hasTasks && (
                            <div className="mt-1 text-[6px] font-medium text-slate-300 sm:mt-3 sm:text-[10px]">
                              {completedCount}/{day.habits.length} done
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mt-8 text-[10px] font-medium text-slate-400">
                          Plan line
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
