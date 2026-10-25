"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { DevelopmentModeProvider } from "./components/DevelopmentModeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DevelopmentModeProvider>{children}</DevelopmentModeProvider>
    </SessionProvider>
  );
}
