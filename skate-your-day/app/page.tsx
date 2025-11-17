"use client";

import { useState, useEffect, useMemo, useRef } from "react";

const initialHabits = [
  { id: 1, name: "Drink water", x: 20, y: 80 },
  { id: 2, name: "Read 10 pages", x: 40, y: 60 },
  { id: 3, name: "Stretch 5 min", x: 70, y: 50 },
  { id: 4, name: "Code 30 min", x: 50, y: 20 },
];

export default function Home() {
  const [habits, setHabits] = useState(
    initialHabits.map((h) => ({
      ...h,
      completed: false,
      completedAt: null as number | null,
    }))
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> 1

  const completedHabits = habits
    .filter((h) => h.completed && h.completedAt != null)
    .sort((a, b) => (a.completedAt! - b.completedAt!));

  const pathPoints = completedHabits.map((h) => [h.x, h.y] as [number, number]);

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

  const toggleHabit = (id: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        if (!h.completed) {
          return {
            ...h,
            completed: true,
            completedAt: Date.now(),
          };
        } else {
          return {
            ...h,
            completed: false,
            completedAt: null,
          };
        }
      })
    );
    // if you change the path while playing, you *could* reset, but we'll skip for now
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

  // Animation
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

  return (
    <main className="min-h-screen flex flex-col gap-4 p-4 sm:p-8 bg-slate-950 text-slate-100">
      <h1 className="text-2xl sm:text-3xl font-bold">Skate Your Day 🛹</h1>

      {/* Habit list */}
      <div className="flex flex-col gap-2 max-w-md">
        {habits.map((h) => (
          <button
            key={h.id}
            onClick={() => toggleHabit(h.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-full border text-sm ${
              h.completed
                ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 border-transparent"
                : "bg-slate-900/90 text-slate-100 border-slate-700/70"
            }`}
          >
            <span>{h.name}</span>
            <span className="text-xs opacity-80">
              {h.completed ? "✔" : "○"}
            </span>
          </button>
        ))}
      </div>

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
          Complete at least 2 habits, then play & replay your day.
        </span>
      </div>

      {/* Skatepark map */}
      <div className="mt-4 w-full max-w-lg aspect-square rounded-2xl p-2 bg-slate-950 border border-slate-700/70 bg-[radial-gradient(circle_at_top_left,#22c55e22,transparent_60%),radial-gradient(circle_at_bottom_right,#3b82f622,transparent_60%)]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* grid */}
          {[20, 40, 60, 80].map((v) => (
            <g key={v}>
              <line
                x1={v}
                y1="0"
                x2={v}
                y2="100"
                stroke="rgba(148,163,184,0.2)"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1={v}
                x2="100"
                y2={v}
                stroke="rgba(148,163,184,0.2)"
                strokeWidth="0.5"
              />
            </g>
          ))}

          {/* path */}
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
          {habits.map((h) => (
            <circle
              key={h.id}
              cx={h.x}
              cy={h.y}
              r={h.completed ? 3.5 : 2.5}
              fill={h.completed ? "#22c55e" : "rgba(148,163,184,0.8)"}
            />
          ))}

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
