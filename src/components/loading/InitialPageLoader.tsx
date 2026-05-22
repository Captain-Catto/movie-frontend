'use client';

import { useEffect, useReducer } from "react";
import { usePathname } from "next/navigation";
import { useIsHydrated } from "@/hooks/useIsHydrated";

const ENABLE_INITIAL_PAGE_LOADER =
  process.env.NEXT_PUBLIC_ENABLE_INITIAL_LOADER === "true";

/**
 * Full-screen loader shown only on the first page load of the session.
 */
export function InitialPageLoader() {
  const pathname = usePathname();
  const isHydrated = useIsHydrated();
  const isHome =
    typeof window !== "undefined"
      ? window.location.pathname === "/"
      : pathname === "/";
  type LoaderState = { isVisible: boolean; shouldRender: boolean };
  const [loaderState, dispatch] = useReducer(
    (s: LoaderState, p: Partial<LoaderState>): LoaderState => ({ ...s, ...p }),
    { isVisible: false, shouldRender: false }
  );
  const { isVisible, shouldRender } = loaderState;

  useEffect(() => {
    if (!ENABLE_INITIAL_PAGE_LOADER) return;

    if (!isHydrated) return;

    if (!isHome) {
      sessionStorage.setItem("initial-loader-dismissed", "true");
      dispatch({ isVisible: false, shouldRender: false });
      return;
    }

    const hasSeenLoader = sessionStorage.getItem("initial-loader-dismissed");
    let removeTimer: number | undefined;

    if (hasSeenLoader) {
      dispatch({ shouldRender: false });
      return;
    }

    dispatch({ shouldRender: true, isVisible: true });

    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem("initial-loader-dismissed", "true");
      dispatch({ isVisible: false });

      removeTimer = window.setTimeout(() => dispatch({ shouldRender: false }), 450);
    }, 1000);

    return () => {
      window.clearTimeout(hideTimer);
      if (removeTimer) {
        window.clearTimeout(removeTimer);
      }
    };
  }, [isHydrated, isHome]);

  if (!ENABLE_INITIAL_PAGE_LOADER) {
    return null;
  }

  if (!isHome) {
    return null;
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <output
      className={`initial-loader ${!isVisible ? "initial-loader--hidden" : ""}`}
      aria-live="polite"
    >
      <div className="initial-loader__content">
        <div className="initial-loader__logo">
          <span className="initial-loader__logo-main">Movie</span>
          <span className="initial-loader__logo-accent">Stream</span>
        </div>
      </div>
    </output>
  );
}
