'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsHydrated } from "@/hooks/useIsHydrated";

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
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Don't run until hydrated (avoids SSR issues with sessionStorage)
    if (!isHydrated) return;

    if (!isHome) {
      sessionStorage.setItem("initial-loader-dismissed", "true");
      setIsVisible(false);
      setShouldRender(false);
      return;
    }

    const hasSeenLoader = sessionStorage.getItem("initial-loader-dismissed");
    let removeTimer: number | undefined;

    if (hasSeenLoader) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);
    setIsVisible(true);

    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem("initial-loader-dismissed", "true");
      setIsVisible(false);

      removeTimer = window.setTimeout(() => setShouldRender(false), 450);
    }, 1000);

    return () => {
      window.clearTimeout(hideTimer);
      if (removeTimer) {
        window.clearTimeout(removeTimer);
      }
    };
  }, [isHydrated, isHome]);

  if (!isHome) {
    return null;
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`initial-loader ${!isVisible ? "initial-loader--hidden" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="initial-loader__content">
        <div className="initial-loader__logo">
          <span className="initial-loader__logo-main">Movie</span>
          <span className="initial-loader__logo-accent">Stream</span>
        </div>
      </div>
    </div>
  );
}
