"use client";

import { useEffect, useRef, useCallback } from "react";
import { analyticsService } from "@/services/analytics.service";

interface UsePageDurationOptions {
  contentId: string;
  contentType: "movie" | "tv_series";
  contentTitle?: string;
  enabled?: boolean;
  minDurationSeconds?: number;
}

/**
 * Hook to track how long a user stays on a page.
 * Sends duration while the page is still open, then flushes the remaining
 * delta on tab hide/unmount. This avoids losing all watch time when the
 * browser cancels unload requests.
 * Pauses when tab is hidden (Page Visibility API).
 */
export function usePageDuration({
  contentId,
  contentType,
  contentTitle,
  enabled = true,
  minDurationSeconds = 5,
}: UsePageDurationOptions) {
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const sentSecondsRef = useRef<number>(0);

  const getTotalSeconds = useCallback(() => {
    let totalSeconds = accumulatedRef.current;

    if (isVisibleRef.current && startTimeRef.current > 0) {
      totalSeconds += (Date.now() - startTimeRef.current) / 1000;
    }

    return Math.round(totalSeconds);
  }, []);

  const sendDurationDelta = useCallback(
    (force = false) => {
      if (!enabled) return;

      const totalSeconds = getTotalSeconds();
      const deltaSeconds = totalSeconds - sentSecondsRef.current;

      if (deltaSeconds <= 0) return;
      if (!force && deltaSeconds < minDurationSeconds) return;

      sentSecondsRef.current = totalSeconds;
      analyticsService.trackDuration(
        contentId,
        contentType,
        deltaSeconds,
        contentTitle
      );
    },
    [contentId, contentType, contentTitle, enabled, getTotalSeconds, minDurationSeconds]
  );

  useEffect(() => {
    if (!enabled) return;

    // Reset state
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    isVisibleRef.current = true;
    sentSecondsRef.current = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - accumulate time
        if (isVisibleRef.current && startTimeRef.current > 0) {
          accumulatedRef.current +=
            (Date.now() - startTimeRef.current) / 1000;
        }
        isVisibleRef.current = false;
        sendDurationDelta(true);
      } else {
        // Tab visible again - restart timer
        startTimeRef.current = Date.now();
        isVisibleRef.current = true;
      }
    };

    const handleBeforeUnload = () => {
      sendDurationDelta(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    const intervalId = window.setInterval(() => {
      sendDurationDelta(false);
    }, 15000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.clearInterval(intervalId);
      sendDurationDelta(true);
    };
  }, [enabled, sendDurationDelta]);
}
