"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Track window width in a SSR-safe way and optionally derive a breakpoint label.
 */
export function useWindowWidth(): { width: number; breakpoint: Breakpoint } {
  const getWidth = () => window.innerWidth;

  const computeBreakpoint = (width: number): Breakpoint => {
    if (width >= 1024) return "desktop";
    if (width >= 640) return "tablet";
    return "mobile";
  };

  // Keep first render deterministic between SSR and CSR to avoid hydration mismatch.
  const [width, setWidth] = useState<number>(0);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");

  useEffect(() => {
    const handleResize = () => {
      const nextWidth = getWidth();
      setWidth(nextWidth);
      setBreakpoint(computeBreakpoint(nextWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, breakpoint };
}
