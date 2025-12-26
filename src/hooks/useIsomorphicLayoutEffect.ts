import { useEffect, useLayoutEffect } from "react";

/**
 * Hook that automatically chooses useLayoutEffect (client) or useEffect (server).
 *
 * Avoids SSR warnings since useLayoutEffect doesn't work on the server.
 * Use when you need to measure DOM or change layout before browser paints.
 *
 * @example
 * useIsomorphicLayoutEffect(() => {
 *   const height = ref.current?.getBoundingClientRect().height;
 *   setHeight(height); // Measure height before render
 * }, []);
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
