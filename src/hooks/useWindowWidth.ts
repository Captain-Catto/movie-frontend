"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

// useLayoutEffect fires before paint on the client; fall back to useEffect on
// the server (where layout effects don't run) to silence the SSR warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const computeBreakpoint = (width: number): Breakpoint => {
  if (width >= 1024) return "desktop";
  if (width >= 640) return "tablet";
  return "mobile";
};

/**
 * Track window width in a SSR-safe way and optionally derive a breakpoint label.
 */
export function useWindowWidth(): { width: number; breakpoint: Breakpoint } {
  const [width, setWidth] = useState<number>(0);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => {
      const nextWidth = window.innerWidth;
      setWidth(nextWidth);
      setBreakpoint(computeBreakpoint(nextWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, breakpoint };
}
