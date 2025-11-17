"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  FormEvent,
} from "react";

type Habit = {
  id: number;
  name: string;
  timeLabel: string; // "HH:MM"
  timeMins: number;  // minutes since midnight
  y: number;         // vertical position 0–100
  completed: boolean;
};

type DayData = {
  id: string; // "YYYY-MM-DD"
  habits: Habit[];
};

// ---------- helpers ----------

function getTodayId() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTimeHHMM() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Base template for NEW days (not hardcoded ones)
const baseHabitsTemplate = [
  {
    id: 1,
    name: "Drink water",
    timeLabel: "08:00",
    timeMins: 8 * 60,
  },
  {
    id: 2,
    name: "Read 10 pages",
    timeLabel: "11:30",
    timeMins: 11 * 60 + 30,
  },
  {
    id: 3,
    name: "Stretch 5 min",
    timeLabel: "15:00",
    timeMins: 15 * 60,
  },
  {
    id: 4,
    name: "Code 30 min",
    timeLabel: "21:15",
    timeMins: 21 * 60 + 15,
  },
];

// Hardcoded test data so you can see multiple days/tabs immediately
// Note: y is fixed numbers here, not random
const testDaysSeed: DayData[] = [
  {
    id: "2025-11-14",
    habits: [
      {
        id: 1,
        name: "Morning stretch",
        timeLabel: "08:00",
        timeMins: 8 * 60,
        y: 30,
        completed: true,
      },
      {
        id: 2,
        name: "Read 10 pages",
        timeLabel: "10:15",
        timeMins: 10 * 60 + 15,
        y: 55,
        completed: true,
      },
      {
        id: 3,
        name: "Skate practice",
        timeLabel: "16:30",
        timeMins: 16 * 60 + 30,
        y: 70,
        completed: false,
      },
    ],
  },
  {
    id: "2025-11-15",
    habits: [
      {
        id: 1,
        name: "Hydrate",
        timeLabel: "09:00",
        timeMins: 9 * 60,
        y: 25,
        completed: true,
      },
      {
        id: 2,
        name: "Code 30 min",
        timeLabel: "13:45",
        timeMins: 13 * 60 + 45,
        y: 60,
        completed: true,
      },
      {
        id: 3,
        name: "Evening walk",
        timeLabel: "20:10",
        timeMins: 20 * 60 + 10,
        y: 45,
        completed: true,
      },
    ],
  },
  {
    id: "2025-11-16",
    habits: [
      {
        id: 1,
        name: "Journal",
        timeLabel: "07:30",
        timeMins: 7 * 60 + 30,
        y: 40,
        completed: false,
      },
      {
        id: 2,
        name: "Stretch 5 min",
        timeLabel: "12:00",
        timeMins: 12 * 60,
        y: 65,
        completed: false,
      },
      {
        id: 3,
        name: "Skate clips",
        timeLabel: "18:20",
        timeMins: 18 * 60 + 20,
        y: 35,
        completed: false,
      },
    ],
  },
];

// For brand-new days only: assign random y once per habit
function createDay(id: string): DayData {
  return {
    id,
    habits: baseHabitsTemplate.map((h) => ({
      ...h,
      y: Math.floor(20 + Math.random() * 60), // random ONCE per habit
      completed: false,
    })),
  };
}

export default function Home() {
  // ---------- days + active day ----------

  const [days, setDays] = useState<DayData[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skateDays");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as DayData[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
    }
    // If nothing saved, start with test data so you can see multiple tabs
    return testDaysSeed;
  });

  const [activeDayId, setActiveDayId] = useState<string>(getTodayId);

  // After days load / change, make sure we have an active day
  useEffect(() => {
    const todayId = getTodayId();
    if (days.some((d) => d.id === todayId)) {
      setActiveDayId(todayId);
    } else if (days.length > 0) {
      setActiveDayId(days[0].id);
    }
  }, [days]);

  // Ensure today exists as a day (random y assigned only here for new days)
  useEffect(() => {
    const todayId = getTodayId();
    setDays((prev) => {
      if (prev.some((d) => d.id === todayId)) return prev;
      return [...prev, createDay(todayId)];
    });
  }, []);

  // Persist days whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skateDays", JSON.stringify(days));
    }
  }, [days]);

  const activeDay =
    days.find((d) => d.id === activeDayId) ?? days[0] ?? null;
  const habits: Habit[] = activeDay?.habits ?? [];

  // ---------- animation + form state ----------

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 → 1 along path

  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState(""); // empty = use current time
  const [formError, setFormError] = useState("");

  // Only letters, numbers, spaces, and simple punctuation
  const nameRegex = /^[a-zA-Z0-9\s.,'!?#-]{1,50}$/;

  // Reset animation when switching day
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
  }, [activeDayId]);

  // ---------- derived path for the active day ----------

  const completedHabits = habits
    .filter((h) => h.completed)
    .sort((a, b) => a.timeMins - b.timeMins);

  const pathPoints = completedHabits.map(
    (h) =>
      [
        (h.timeMins / (24 * 60)) * 100, // time 0–1440 → x 0–100
        h.y,
      ] as [number, number]
  );

  const { segments, totalLength } = useMemo(() => {
    if (pathPoints.length < 2) {
      return {
        segments: [] as {
          from: [number, number];
          to: [number, number];
          length: number;
        }[],
        totalLength: 0,
      };
    }

    const segs: {
      from: [number, number];
      to: [number, number];
      length: number;
    }[] = [];
    let lengthSum = 0;

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const from = pathPoints[i];
      const to = pathPoints[i + 1];
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        segs.push({ from, to, length: len });
        lengthSum += len;
      }
    }

    return { segments: segs, totalLength: lengthSum };
  }, [pathPoints]);

  // ---------- actions ----------

  const toggleHabit = (habitId: number) => {
    if (!activeDay) return;
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== activeDay.id) return day;
        return {
          ...day,
          habits: day.habits.map((h) =>
            h.id === habitId ? { ...h, completed: !h.completed } : h
          ),
        };
      })
    );
  };

  const handlePlay = () => {
    if (pathPoints.length < 2) return;
    setProgress(0);
    setIsPlaying(true);
  };

  const handleReplay = () => {
    if (pathPoints.length < 2) return;
    setProgress(0);
    setIsPlaying(true);
  };

  const handleAddHabit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDay) return;

    const trimmed = newName.trim();

    if (!trimmed) {
      setFormError("Habit name can’t be empty.");
      return;
    }
    if (trimmed.length > 50) {
      setFormError("Max 50 characters.");
      return;
    }
    if (!nameRegex.test(trimmed)) {
      setFormError(
        "Use only letters, numbers, spaces, and simple punctuation."
      );
      return;
    }

    // Time logic: if empty, use current time
    let chosenTime = newTime;
    if (!chosenTime || chosenTime.trim() === "") {
      chosenTime = getCurrentTimeHHMM();
    }

    if (!/^\d{2}:\d{2}$/.test(chosenTime)) {
      setFormError("Please choose a valid time.");
      return;
    }

    const [hStr, mStr] = chosenTime.split(":");
    const hours = Number(hStr);
    const mins = Number(mStr);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(mins) ||
      hours < 0 ||
      hours > 23 ||
      mins < 0 ||
      mins > 59
    ) {
      setFormError("Please choose a valid time.");
      return;
    }

    const timeMins = hours * 60 + mins;

    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== activeDay.id) return day;
        const nextId =
          day.habits.length > 0
            ? Math.max(...day.habits.map((h) => h.id)) + 1
            : 1;
        return {
          ...day,
          habits: [
            ...day.habits,
            {
              id: nextId,
              name: trimmed,
              timeLabel: chosenTime,
              timeMins,
              y: Math.floor(20 + Math.random() * 60), // random ONCE for new habit
              completed: false,
            },
          ],
        };
      })
    );

    setNewName("");
    setNewTime("");
    setFormError("");
  };

  // ---------- animation ----------

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || totalLength <= 0) return;

    const duration = 4000; // ms for full run
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const nextProgress = Math.min(elapsed / duration, 1);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalLength]);

  const skaterPosition = useMemo(() => {
    if (pathPoints.length === 0) return null;
    if (pathPoints.length === 1 || totalLength === 0) {
      return pathPoints[0];
    }

    let distanceAlong = progress * totalLength;

    for (const seg of segments) {
      if (distanceAlong <= seg.length) {
        const t = distanceAlong / seg.length;
        const x = seg.from[0] + (seg.to[0] - seg.from[0]) * t;
        const y = seg.from[1] + (seg.to[1] - seg.from[1]) * t;
        return [x, y] as [number, number];
      } else {
        distanceAlong -= seg.length;
      }
    }

    const last = segments[segments.length - 1];
    return last ? last.to : pathPoints[pathPoints.length - 1];
  }, [pathPoints, segments, totalLength, progress]);

  const canPlay = pathPoints.length >= 2 && !isPlaying;
  const canReplay = pathPoints.length >= 2 && !isPlaying && progress >= 1;

  const todayId = getTodayId();

  return (
    <main className="min-h-screen flex flex-col gap-6 p-4 sm:p-8 bg-slate-950 text-slate-100">
      <h1 className="text-2xl sm:text-3xl font-bold">Skate Your Day 🛹</h1>

      {/* Day tabs */}
      <section className="flex flex-wrap gap-2 mb-2">
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  isActive
                    ? "bg-emerald-500 text-emerald-950 border-transparent"
                    : "bg-slate-900 text-slate-200 border-slate-700"
                }`}
              >
                {day.id}
                {isToday && (
                  <span className="ml-1 text-[0.6rem] uppercase">
                    (Today)
                  </span>
                )}
              </button>
            );
          })}
      </section>

      {/* Add habit form */}
      <section className="max-w-xl space-y-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Add a habit for {activeDay?.id ?? "…"}
        </h2>
        <form
          onSubmit={handleAddHabit}
          className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
        >
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              Habit name (max 50 chars)
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={50}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              placeholder="Skate warmup, journal, stretch..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              Time (blank = now)
            </label>
            <input
              type="time"
              value={newTime}
              placeholder="09:00"
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
            />
          </div>
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 font-semibold text-sm px-4 py-2 mt-1 sm:mt-0"
          >
            + Add
          </button>
        </form>
        {formError && (
          <p className="text-xs text-red-400 mt-1">{formError}</p>
        )}
        <p className="text-xs text-slate-500">
          Only letters, numbers, spaces, and simple punctuation are allowed.
        </p>
      </section>

      {/* Habit list */}
      <section className="flex flex-col gap-2 max-w-xl">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Habits on {activeDay?.id ?? "…"}
        </h2>
        {habits
          .slice()
          .sort((a, b) => a.timeMins - b.timeMins)
          .map((h) => (
            <button
              key={h.id}
              onClick={() => toggleHabit(h.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-full border text-sm ${
                h.completed
                  ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 border-transparent"
                  : "bg-slate-900/90 text-slate-100 border-slate-700/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">
                  {h.timeLabel}
                </span>
                <span>{h.name}</span>
              </div>
              <span className="text-xs opacity-80">
                {h.completed ? "✔" : "○"}
              </span>
            </button>
          ))}
      </section>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={handlePlay}
          disabled={!canPlay}
          className={`px-4 py-2 rounded-full font-semibold text-sm ${
            !canPlay
              ? "bg-slate-600/60 text-slate-900 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900"
          }`}
        >
          ▶ Play Day
        </button>

        <button
          onClick={handleReplay}
          disabled={!canReplay}
          className={`px-4 py-2 rounded-full font-semibold text-sm ${
            !canReplay
              ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-fuchsia-500 to-pink-400 text-slate-900"
          }`}
        >
          ↺ Replay
        </button>

        <span className="text-xs text-slate-400">
          Each tab is a separate day with its own skate line.
        </span>
      </div>

      {/* Timeline / skate map */}
      <div className="mt-2 w-full max-w-3xl aspect-[3/1] sm:aspect-[16/5] rounded-2xl p-3 bg-slate-950 border border-slate-700/70 bg-[radial-gradient(circle_at_top_left,#22c55e22,transparent_60%),radial-gradient(circle_at_bottom_right,#3b82f622,transparent_60%)]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* time grid */}
          {[0, 25, 50, 75, 100].map((x) => (
            <g key={x}>
              <line
                x1={x}
                y1="5"
                x2={x}
                y2="95"
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="0.4"
              />
            </g>
          ))}

          {/* time labels */}
          <text
            x={0}
            y={98}
            fontSize="3"
            fill="rgba(148,163,184,0.8)"
          >
            00:00
          </text>
          <text
            x={25}
            y={98}
            fontSize="3"
            fill="rgba(148,163,184,0.8)"
          >
            06:00
          </text>
          <text
            x={50}
            y={98}
            fontSize="3"
            fill="rgba(148,163,184,0.8)"
          >
            12:00
          </text>
          <text
            x={75}
            y={98}
            fontSize="3"
            fill="rgba(148,163,184,0.8)"
          >
            18:00
          </text>
          <text
            x={90}
            y={98}
            fontSize="3"
            fill="rgba(148,163,184,0.8)"
          >
            24:00
          </text>

          {/* path of completed habits */}
          {pathPoints.length >= 2 && (
            <polyline
              points={pathPoints.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* habit nodes */}
          {habits.map((h) => {
            const x = (h.timeMins / (24 * 60)) * 100;
            const y = h.y;
            return (
              <circle
                key={h.id}
                cx={x}
                cy={y}
                r={h.completed ? 3.5 : 2.5}
                fill={h.completed ? "#22c55e" : "rgba(148,163,184,0.8)"}
              />
            );
          })}

          {/* skater */}
          {skaterPosition && (
            <circle
              cx={skaterPosition[0]}
              cy={skaterPosition[1]}
              r={4}
              fill="#f97316"
            />
          )}
        </svg>
      </div>
    </main>
  );
}
