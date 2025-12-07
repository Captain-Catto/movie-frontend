import { useEffect, useLayoutEffect } from "react";

/**
 * Hook tự động chọn useLayoutEffect (client) hoặc useEffect (server).
 *
 * Tránh warning khi SSR vì useLayoutEffect không hoạt động trên server.
 * Dùng khi cần đo DOM hoặc thay đổi layout trước khi browser vẽ màn hình.
 *
 * @example
 * useIsomorphicLayoutEffect(() => {
 *   const height = ref.current?.getBoundingClientRect().height;
 *   setHeight(height); // Đo chiều cao trước khi render
 * }, []);
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
