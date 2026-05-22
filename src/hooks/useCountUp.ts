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
  const displayRef = useRef<number>(value);
  const startValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = displayRef.current;
    startTimeRef.current = null;

    let animationFrameId: number | null = null;

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
      const rounded = Math.round(next * factor) / factor;
      displayRef.current = rounded;
      setDisplay(rounded);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
        animationRef.current = animationFrameId;
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    animationRef.current = animationFrameId;

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration, decimals]);

  return display;
}
