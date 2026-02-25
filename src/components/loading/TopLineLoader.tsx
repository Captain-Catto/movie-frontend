"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_EVENT = "app-route-loading-start";
const MIN_START_PROGRESS = 8;
const MAX_AUTO_PROGRESS = 92;
const HIDE_DELAY_MS = 220;
const STALL_TIMEOUT_MS = 15000;

const isModifiedClick = (event: MouseEvent): boolean =>
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  event.button !== 0;

const shouldHandleAnchor = (
  anchor: HTMLAnchorElement,
  currentPathWithSearch: string
): boolean => {
  if (anchor.hasAttribute("download")) return false;
  if (anchor.getAttribute("target") === "_blank") return false;
  if (anchor.dataset.noRouteLoader === "true") return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;

  const targetPathWithSearch = `${url.pathname}${url.search}`;
  if (targetPathWithSearch === currentPathWithSearch) {
    return false;
  }

  return true;
};

export function TopLineLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const pathWithSearch = `${pathname}${searchKey ? `?${searchKey}` : ""}`;

  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const isFirstRenderRef = useRef(true);
  const currentPathRef = useRef(pathWithSearch);
  const hasPendingLoadRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const stallTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (stallTimerRef.current !== null) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    hasPendingLoadRef.current = true;
    clearTimers();
    setIsVisible(true);
    setIsActive(true);
    setProgress((prev) => (prev > 0 ? prev : MIN_START_PROGRESS));

    stallTimerRef.current = window.setTimeout(() => {
      hasPendingLoadRef.current = false;
      setIsActive(false);
      setProgress(100);
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, HIDE_DELAY_MS);
    }, STALL_TIMEOUT_MS);
  }, [clearTimers]);

  const complete = useCallback(() => {
    if (!hasPendingLoadRef.current) {
      return;
    }
    hasPendingLoadRef.current = false;
    clearTimers();
    setIsActive(false);
    setProgress(100);
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, HIDE_DELAY_MS);
  }, [clearTimers]);

  useEffect(() => {
    if (!isActive) return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= MAX_AUTO_PROGRESS) return prev;
        const next = prev + Math.max((MAX_AUTO_PROGRESS - prev) * 0.12, 0.8);
        return Math.min(next, MAX_AUTO_PROGRESS);
      });
    }, 140);

    return () => window.clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      if (shouldHandleAnchor(anchor, currentPathRef.current)) {
        start();
      }
    };

    const onPopState = () => {
      start();
    };

    const onExternalStart = () => {
      start();
    };

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener(START_EVENT, onExternalStart);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener(START_EVENT, onExternalStart);
    };
  }, [start]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      currentPathRef.current = pathWithSearch;
      return;
    }

    if (currentPathRef.current !== pathWithSearch) {
      currentPathRef.current = pathWithSearch;
      complete();
    }
  }, [pathWithSearch, complete]);

  useEffect(
    () => () => {
      clearTimers();
    },
    [clearTimers]
  );

  if (!isVisible) return null;

  return (
    <div
      className="route-top-loader"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Page loading progress"
    >
      <div
        className="route-top-loader__bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
