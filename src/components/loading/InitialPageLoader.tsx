'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Full-screen loader shown only on the first page load of the session.
 */
export function InitialPageLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("initial-loader-dismissed");
  });

  const [isMounted, setIsMounted] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("initial-loader-dismissed");
  });

  useEffect(() => {
    const hasSeenLoader = sessionStorage.getItem("initial-loader-dismissed");
    let removeTimer: number | undefined;

    if (hasSeenLoader) {
      setIsMounted(false);
      return;
    }

    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem("initial-loader-dismissed", "true");
      setIsVisible(false);

      removeTimer = window.setTimeout(() => setIsMounted(false), 450);
    }, 1000);

    return () => {
      window.clearTimeout(hideTimer);
      if (removeTimer) {
        window.clearTimeout(removeTimer);
      }
    };
  }, []);

  if (pathname !== "/") {
    return null;
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`initial-loader ${!isVisible ? "initial-loader--hidden" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="initial-loader__content">
        <div className="initial-loader__spinner" aria-hidden="true" />
        <div className="initial-loader__logo">
          <span className="initial-loader__logo-main">Movie</span>
          <span className="initial-loader__logo-accent">Stream</span>
        </div>
      </div>
    </div>
  );
}
