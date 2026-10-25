"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDevelopmentMode } from "./DevelopmentModeContext";

type StatusInfo = {
  db: { url: string | null; type: string };
  nextAuth: { secretSet: boolean; providers: string[] };
};

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [developmentMode, setDevelopmentMode] = useDevelopmentMode();

  const loggedIn = status === "authenticated" && session?.user;
  const [statusInfo, setStatusInfo] = React.useState<StatusInfo | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/status")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load app status");
        return response.json() as Promise<StatusInfo>;
      })
      .then((info) => {
        if (mounted) setStatusInfo(info);
      })
      .catch(() => {
        if (mounted) setStatusInfo(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 pointer-events-none`}> 
      <div
        className={`w-full px-2 sm:px-4 py-1 sm:py-1.5 text-xs flex items-center justify-between gap-2 transition-colors pointer-events-auto ${
          loggedIn ? "bg-emerald-600 text-slate-900" : "bg-slate-700 text-slate-200"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs truncate">
            {loggedIn ? (
              <span>
                <strong>{session?.user?.name ?? session?.user?.email}</strong>
              </span>
            ) : (
              <span>Not signed in</span>
            )}
            </div>

            <div className="text-xs text-slate-100/80 truncate hidden sm:block">
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
          <button
            type="button"
            role="switch"
            aria-checked={developmentMode}
            onClick={() => setDevelopmentMode(!developmentMode)}
            className={`flex flex-none items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold whitespace-nowrap transition-colors ${
              developmentMode
                ? "bg-amber-300 text-slate-950"
                : "bg-slate-800/70 text-slate-100 hover:bg-slate-800"
            }`}
          >
            <span>Dev mode</span>
            <span className="uppercase">{developmentMode ? "On" : "Off"}</span>
          </button>
        </div>

        <div className="flex-shrink-0">
          {loggedIn ? (
            <button
              onClick={handleSignOut}
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
