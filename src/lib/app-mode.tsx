import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AppMode = "nexus" | "security";

type Ctx = {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  toggle: () => void;
};

const AppModeContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "nexus-app-mode";

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("nexus");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "nexus" || stored === "security") setModeState(stored);
    } catch { /* ignore */ }
  }, []);

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "nexus" ? "security" : "nexus");
  }, [mode, setMode]);

  return (
    <AppModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) return { mode: "nexus" as AppMode, setMode: () => {}, toggle: () => {} };
  return ctx;
}
