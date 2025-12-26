"use client";

import { ReactNode } from "react";
import { useIsHydrated } from "@/hooks/useIsHydrated";

interface ClientOnlyProps {
  children: ReactNode; // Content only renders after hydration completes
  fallback?: ReactNode; // Fallback UI during SSR (default: null)
}

/**
 * Component that only renders children after hydration completes.
 *
 * During SSR: shows fallback (or nothing).
 * After hydration: shows children.
 *
 * Use when component needs browser APIs (localStorage, window, etc.)
 * or to avoid hydration mismatch.
 *
 * @example
 * // Hide during SSR, show after hydration
 * <ClientOnly>
 *   <UserPreferences />
 * </ClientOnly>
 *
 * // With loading skeleton
 * <ClientOnly fallback={<Skeleton />}>
 *   <DynamicContent />
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isHydrated = useIsHydrated();

  return isHydrated ? <>{children}</> : <>{fallback}</>;
}
