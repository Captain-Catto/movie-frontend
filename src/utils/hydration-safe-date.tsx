"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime as originalFormatRelativeTime } from "./dateFormatter";

/**
 * Hydration-safe relative time formatter hook.
 *
 * Prevents hydration mismatches by returning a stable timestamp during SSR/hydration,
 * then switching to live relative time after the component mounts on the client.
 *
 * **Problem it solves:**
 * - `Date.now()` returns different values on server vs client (time passes between renders)
 * - This causes "Text content did not match" hydration errors
 * - Relative times like "2 minutes ago" change constantly
 *
 * **How it works:**
 * 1. During SSR and initial render: Returns stable format ("Dec 6, 2025 at 2:30 PM")
 * 2. After hydration: Returns live relative time ("2 minutes ago", "3 hours ago", etc.)
 *
 * **Usage:**
 * ```tsx
 * const formattedTime = useHydrationSafeRelativeTime(notification.createdAt);
 * return <time suppressHydrationWarning>{formattedTime}</time>;
 * ```
 *
 * Or use the `<RelativeTime>` component wrapper instead for convenience.
 *
 * @param {string | Date | null | undefined} dateInput - The date to format
 * @returns {string} Formatted date string (stable during SSR, relative after hydration)
 *
 * @see {@link RelativeTime} - Component wrapper with built-in suppressHydrationWarning
 * @see https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content
 */
export function useHydrationSafeRelativeTime(
  dateInput: string | Date | null | undefined
): string {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR and first render, return stable ISO timestamp
  if (!isHydrated) {
    if (!dateInput) return "Unknown time";
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    // Return a stable format like "Dec 6, 2025 at 2:30 PM"
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // After hydration, use live relative time
  return originalFormatRelativeTime(dateInput);
}

/**
 * Component wrapper for hydration-safe relative time display.
 *
 * Renders relative time (e.g., "2 minutes ago") with built-in hydration safety.
 * Uses `suppressHydrationWarning` to prevent React warnings about SSR/client mismatch.
 *
 * **Features:**
 * - Automatic hydration safety (stable SSR, dynamic client)
 * - Semantic `<time>` element with proper datetime attribute
 * - Customizable className for styling
 * - Handles null/undefined dates gracefully
 *
 * **Usage:**
 * ```tsx
 * // Basic usage
 * <RelativeTime date={notification.createdAt} />
 *
 * // With custom styling
 * <RelativeTime
 *   date={comment.createdAt}
 *   className="text-xs text-gray-400"
 * />
 *
 * // In notification list
 * {notifications.map(notif => (
 *   <div key={notif.id}>
 *     <RelativeTime date={notif.createdAt} className="text-sm" />
 *   </div>
 * ))}
 * ```
 *
 * @param {Object} props - Component props
 * @param {string | Date | null | undefined} props.date - The date to format
 * @param {string} [props.className] - Optional CSS classes for styling
 * @returns {JSX.Element} A `<time>` element with formatted relative time
 *
 * @see {@link useHydrationSafeRelativeTime} - The underlying hook if you need more control
 */
export function RelativeTime({
  date,
  className,
}: {
  date: string | Date | null | undefined;
  className?: string;
}) {
  const formattedTime = useHydrationSafeRelativeTime(date);

  return (
    <time suppressHydrationWarning className={className}>
      {formattedTime}
    </time>
  );
}
