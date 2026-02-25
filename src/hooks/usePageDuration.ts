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
 * Sends duration to analytics on unmount or tab close.
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
  const sentRef = useRef<boolean>(false);

  const sendDuration = useCallback(() => {
    if (sentRef.current || !enabled) return;

    let totalSeconds = accumulatedRef.current;
    if (isVisibleRef.current && startTimeRef.current > 0) {
      totalSeconds += (Date.now() - startTimeRef.current) / 1000;
    }

    totalSeconds = Math.round(totalSeconds);

    if (totalSeconds >= minDurationSeconds) {
      sentRef.current = true;
      analyticsService.trackDuration(
        contentId,
        contentType,
        totalSeconds,
        contentTitle
      );
    }
  }, [contentId, contentType, contentTitle, enabled, minDurationSeconds]);

  useEffect(() => {
    if (!enabled) return;

    // Reset state
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    isVisibleRef.current = true;
    sentRef.current = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - accumulate time
        if (isVisibleRef.current && startTimeRef.current > 0) {
          accumulatedRef.current +=
            (Date.now() - startTimeRef.current) / 1000;
        }
        isVisibleRef.current = false;
      } else {
        // Tab visible again - restart timer
        startTimeRef.current = Date.now();
        isVisibleRef.current = true;
      }
    };

    const handleBeforeUnload = () => {
      sendDuration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendDuration();
    };
  }, [enabled, sendDuration]);
}
