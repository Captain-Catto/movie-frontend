'use client';

import { useEffect, useState } from "react";

/**
 * Full-screen loader shown only on the first page load of the session.
 */
export function InitialPageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

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
    }, 1400);

    return () => {
      window.clearTimeout(hideTimer);
      if (removeTimer) {
        window.clearTimeout(removeTimer);
      }
    };
  }, []);

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
