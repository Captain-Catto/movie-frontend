"use client";

import { useState, useEffect } from "react";

/**
 * Hook phát hiện khi React đã hoàn thành hydration trên client.
 *
 * Trả về `false` khi SSR và lần render đầu, `true` sau khi component mount.
 * Dùng để tránh lỗi hydration mismatch khi render nội dung phụ thuộc browser API.
 *
 * @example
 * const isHydrated = useIsHydrated();
 * if (!isHydrated) return null; // Ẩn content cho đến khi hydration xong
 * return <ClientOnlyComponent />;
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true); // Chỉ chạy trên client sau hydration
  }, []);

  return isHydrated;
}
