import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type SecuritySection = "scan" | "report" | "pricing";

type Ctx = {
  /** True when the Nexefy Security console overlay is open. */
  open: boolean;
  /** True while rendering *inside* the overlay (shells drop their own chrome). */
  inConsole: boolean;
  section: SecuritySection;
  openConsole: (section?: SecuritySection) => void;
  closeConsole: () => void;
  setSection: (section: SecuritySection) => void;
};

const noop = () => {};
const SecurityConsoleContext = createContext<Ctx>({
  open: false,
  inConsole: false,
  section: "scan",
  openConsole: noop,
  closeConsole: noop,
  setSection: noop,
});

export function SecurityConsoleProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SecuritySection>("scan");

  const value = useMemo<Ctx>(
    () => ({
      open,
      inConsole: false,
      section,
      openConsole: (s?: SecuritySection) => {
        if (s) setSection(s);
        setOpen(true);
      },
      closeConsole: () => setOpen(false),
      setSection,
    }),
    [open, section],
  );

  return <SecurityConsoleContext.Provider value={value}>{children}</SecurityConsoleContext.Provider>;
}

/** Marks the subtree as rendering inside the overlay. */
export function InSecurityConsole({ children }: { children: ReactNode }) {
  const parent = useContext(SecurityConsoleContext);
  const value = useMemo<Ctx>(() => ({ ...parent, inConsole: true }), [parent]);
  return <SecurityConsoleContext.Provider value={value}>{children}</SecurityConsoleContext.Provider>;
}

export function useSecurityConsole() {
  return useContext(SecurityConsoleContext);
}
