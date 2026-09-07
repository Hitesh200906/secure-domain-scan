import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";

/**
 * The first basic (Starter) scan is free. It stays free — and is shown as free
 * everywhere — until the user has actually started/used a scan.
 */
export function useFreeScan() {
  const { user } = useAuth();
  const [used, setUsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setUsed(false);
      setReady(true);
      return;
    }
    setReady(false);
    api
      .listScans()
      .then(({ scans }) => {
        if (alive) setUsed((scans?.length ?? 0) > 0);
      })
      .catch(() => { /* assume unused */ })
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [user]);

  return { freeScanAvailable: !used, ready };
}
