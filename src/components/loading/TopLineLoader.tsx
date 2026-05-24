"use client";

import { Suspense, useCallback, useEffect, useRef, useReducer } from "react";
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

interface LoaderState {
  isVisible: boolean;
  progress: number;
}

function loaderReducer(
  state: LoaderState,
  action: Partial<LoaderState> | ((prev: LoaderState) => Partial<LoaderState>)
): LoaderState {
  const patch = typeof action === "function" ? action(state) : action;
  return { ...state, ...patch };
}

function TopLineLoaderImpl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const pathWithSearch = `${pathname}${searchKey ? `?${searchKey}` : ""}`;

  const [state, dispatch] = useReducer(loaderReducer, {
    isVisible: false,
    progress: 0,
  });
  const { isVisible, progress } = state;

  const isActiveRef = useRef(false);
  const currentPathRef = useRef(pathWithSearch);
  const hasPendingLoadRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const stallTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (stallTimerRef.current !== null) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    hasPendingLoadRef.current = true;
    clearTimers();
    isActiveRef.current = true;

    dispatch((s) => ({
      isVisible: true,
      progress: s.progress > 0 ? s.progress : MIN_START_PROGRESS,
    }));

    progressIntervalRef.current = window.setInterval(() => {
      if (!isActiveRef.current) return;
      dispatch((s) => {
        const prev = s.progress;
        if (prev >= MAX_AUTO_PROGRESS) return {};
        const next = prev + Math.max((MAX_AUTO_PROGRESS - prev) * 0.12, 0.8);
        return { progress: Math.min(next, MAX_AUTO_PROGRESS) };
      });
    }, 140);

    stallTimerRef.current = window.setTimeout(() => {
      hasPendingLoadRef.current = false;
      isActiveRef.current = false;
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      dispatch({ progress: 100 });
      hideTimerRef.current = window.setTimeout(() => {
        dispatch({ isVisible: false, progress: 0 });
      }, HIDE_DELAY_MS);
    }, STALL_TIMEOUT_MS);
  }, [clearTimers]);

  const complete = useCallback(() => {
    if (!hasPendingLoadRef.current) {
      return;
    }
    hasPendingLoadRef.current = false;
    clearTimers();
    isActiveRef.current = false;
    dispatch({ progress: 100 });
    hideTimerRef.current = window.setTimeout(() => {
      dispatch({ isVisible: false, progress: 0 });
    }, HIDE_DELAY_MS);
  }, [clearTimers]);

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

    const onPopState = () => start();
    const onExternalStart = () => start();

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
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading progress"
    >
      <div
        className="route-top-loader__bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}

export function TopLineLoader() {
  return (
    <Suspense fallback={null}>
      <TopLineLoaderImpl />
    </Suspense>
  );
}
