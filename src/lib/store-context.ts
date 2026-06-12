import { createContext, useContext } from "react";
import type { Store } from "@/lib/business";

export const StoreContext = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(StoreContext);
  if (!s) throw new Error("StoreContext missing");
  return s;
};
