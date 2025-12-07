"use client";

import { ReactNode } from "react";
import { useIsHydrated } from "@/hooks/useIsHydrated";

interface ClientOnlyProps {
  children: ReactNode; // Nội dung chỉ render sau khi hydration xong
  fallback?: ReactNode; // UI thay thế khi SSR (mặc định: null)
}

/**
 * Component chỉ render children sau khi hydration hoàn tất.
 *
 * Khi SSR: hiển thị fallback (hoặc không hiển thị gì).
 * Sau hydration: hiển thị children.
 *
 * Dùng khi component cần browser API (localStorage, window, etc.)
 * hoặc để tránh hydration mismatch.
 *
 * @example
 * // Ẩn khi SSR, hiện sau hydration
 * <ClientOnly>
 *   <UserPreferences />
 * </ClientOnly>
 *
 * // Với loading skeleton
 * <ClientOnly fallback={<Skeleton />}>
 *   <DynamicContent />
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isHydrated = useIsHydrated();

  return isHydrated ? <>{children}</> : <>{fallback}</>;
}
