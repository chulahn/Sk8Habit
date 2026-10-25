"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

const DevelopmentModeContext = createContext<
  [boolean, (enabled: boolean) => void] | null
>(null);

export function DevelopmentModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  return (
    <DevelopmentModeContext.Provider value={[enabled, setEnabled]}>
      {children}
    </DevelopmentModeContext.Provider>
  );
}

export function useDevelopmentMode() {
  const context = useContext(DevelopmentModeContext);
  if (!context) {
    throw new Error(
      "useDevelopmentMode must be used inside DevelopmentModeProvider",
    );
  }
  return context;
}
