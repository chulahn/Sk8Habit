"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  const loggedIn = status === "authenticated" && session?.user;
  const [statusInfo, setStatusInfo] = React.useState<{
    db: { url: string | null; type: string };
    nextAuth: { secretSet: boolean; providers: string[] };
  } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setStatusInfo(d as any);
      })
      .catch(() => {
        if (mounted) setStatusInfo(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 pointer-events-none`}> 
      <div
        className={`w-full px-2 sm:px-4 py-1 sm:py-1.5 text-xs flex items-center justify-between gap-2 transition-colors pointer-events-auto ${
          loggedIn ? "bg-emerald-600 text-slate-900" : "bg-slate-700 text-slate-200"
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs truncate">
            {loggedIn ? (
              <span>
                <strong>{session?.user?.name ?? session?.user?.email}</strong>
              </span>
            ) : (
              <span>Not signed in</span>
            )}
          </div>

          <div className="text-xs text-slate-100/80 truncate hidden sm:inline">
            {statusInfo ? (
              <>
                {statusInfo.db.type === "postgres" ? "Postgres" : "SQLite"}
                {" • "}
                {statusInfo.nextAuth.secretSet ? "NextAuth ✓" : "NextAuth ⚠"}
              </>
            ) : (
              <span>…</span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {loggedIn ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-100 text-xs whitespace-nowrap"
            >
              Sign out
            </button>
          ) : (
            <a href="/auth/signin" className="px-2 py-0.5 rounded bg-slate-600 text-slate-100 text-xs whitespace-nowrap">Sign in</a>
          )}
        </div>
      </div>
      <div style={{ height: 300 }} className="pointer-events-none" />
    </div>
  );
}
