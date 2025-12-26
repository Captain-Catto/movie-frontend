"use client";

import { useState, useEffect } from "react";

/**
 * Hook that detects when React has completed hydration on the client.
 *
 * Returns `false` during SSR and first render, `true` after component mounts.
 * Use to avoid hydration mismatch errors when rendering content that depends on browser APIs.
 *
 * @example
 * const isHydrated = useIsHydrated();
 * if (!isHydrated) return null; // Hide content until hydration is done
 * return <ClientOnlyComponent />;
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true); // Only runs on client after hydration
  }, []);

  return isHydrated;
}
