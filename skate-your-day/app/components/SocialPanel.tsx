"use client";

import { FormEvent } from "react";
import type { Friend } from "./types";

type LeaderboardEntry = {
  id: string;
  name: string;
  points: number;
  isYou?: boolean;
};

type Props = {
  friendName: string;
  setFriendName: (value: string) => void;
  friendPoints: string;
  setFriendPoints: (value: string) => void;
  friends: Friend[];
  leaderboard: LeaderboardEntry[];
  onAddFriend: (event: FormEvent) => void;
  onRemoveFriend: (id: number) => void;
};

export default function SocialPanel({
  friendName,
  setFriendName,
  friendPoints,
  setFriendPoints,
  friends,
  leaderboard,
  onAddFriend,
  onRemoveFriend,
}: Props) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Leaderboard
          </h2>
          <span className="text-xs text-slate-500">Top skaters</span>
        </div>

        <ol className="space-y-2">
          {leaderboard.map((entry, index) => (
            <li
              key={entry.id}
              className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2 text-sm ${
                entry.isYou
                  ? "bg-cyan-400/15 text-cyan-100"
                  : "bg-slate-950/70 text-slate-200"
              }`}
            >
              <span className="font-mono text-xs text-slate-400">
                #{index + 1}
              </span>
              <span className="truncate font-medium">
                {entry.name}
                {entry.isYou ? " (you)" : ""}
              </span>
              <span className="font-semibold">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Friend List
        </h2>

        <form onSubmit={onAddFriend} className="mt-3 grid gap-2">
          <input
            value={friendName}
            onChange={(event) => setFriendName(event.target.value)}
            placeholder="Friend name"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
          />
          <input
            value={friendPoints}
            onChange={(event) => setFriendPoints(event.target.value)}
            inputMode="numeric"
            placeholder="Starting points"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Add friend
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {friends.length === 0 ? (
            <p className="text-sm text-slate-500">No friends added yet.</p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-3 rounded-md bg-slate-950/70 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-100">
                    {friend.name}
                  </p>
                  <p className="text-xs text-slate-500">{friend.points} pts</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFriend(friend.id)}
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-red-400 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
