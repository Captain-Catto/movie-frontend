"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  duration?: number; // ms
  decimals?: number; // decimal places to keep
}

/**
 * Simple count-up animation when value changes.
 */
export function useCountUp(
  value: number,
  { duration = 500, decimals = 0 }: UseCountUpOptions = {}
) {
  const [display, setDisplay] = useState<number>(value);
  const startValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = display;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const next =
        startValueRef.current +
        (value - startValueRef.current) * progress;

      const factor = Math.pow(10, decimals);
      setDisplay(Math.round(next * factor) / factor);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // value change triggers animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, decimals]);

  return display;
}
