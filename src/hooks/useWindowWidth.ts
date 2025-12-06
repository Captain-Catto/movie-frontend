import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Track window width in a SSR-safe way and optionally derive a breakpoint label.
 */
export function useWindowWidth(): { width: number; breakpoint: Breakpoint } {
  const getWidth = () =>
    typeof window === "undefined" ? 0 : window.innerWidth;

  const computeBreakpoint = (width: number): Breakpoint => {
    if (width >= 1024) return "desktop";
    if (width >= 640) return "tablet";
    return "mobile";
  };

  const [width, setWidth] = useState<number>(getWidth());
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    computeBreakpoint(getWidth())
  );

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
