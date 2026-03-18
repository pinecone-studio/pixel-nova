"use client";

import { createContext, useContext, useMemo, useState } from "react";

type HrOverlayContextValue = {
  blurred: boolean;
  setBlurred: (value: boolean) => void;
};

const HrOverlayContext = createContext<HrOverlayContextValue | null>(null);

export function HrOverlayProvider({ children }: { children: React.ReactNode }) {
  const [blurred, setBlurred] = useState(false);
  const value = useMemo(() => ({ blurred, setBlurred }), [blurred]);

  return (
    <HrOverlayContext.Provider value={value}>
      {children}
    </HrOverlayContext.Provider>
  );
}

export function useHrOverlay() {
  const ctx = useContext(HrOverlayContext);
  if (!ctx) {
    throw new Error("useHrOverlay must be used within HrOverlayProvider");
  }
  return ctx;
}
