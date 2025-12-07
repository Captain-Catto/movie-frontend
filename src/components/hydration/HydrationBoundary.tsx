"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface HydrationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // UI thay thế khi lỗi hydration
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Callback khi bắt lỗi
}

interface HydrationBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary chuyên bắt và xử lý lỗi hydration của React.
 *
 * Bắt lỗi khi HTML từ server không khớp với render từ client.
 * Cung cấp fallback UI hoặc tự phục hồi khi xảy ra lỗi.
 *
 * @example
 * // Cơ bản
 * <HydrationBoundary>
 *   <ComponentCoTheLoi />
 * </HydrationBoundary>
 *
 * // Với fallback UI
 * <HydrationBoundary fallback={<div>Không thể tải nội dung</div>}>
 *   <DynamicContent />
 * </HydrationBoundary>
 *
 * // Với error logging
 * <HydrationBoundary onError={(error) => console.error(error)}>
 *   <ComplexComponent />
 * </HydrationBoundary>
 */
export class HydrationBoundary extends Component<
  HydrationBoundaryProps,
  HydrationBoundaryState
> {
  constructor(props: HydrationBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): HydrationBoundaryState {
    // Kiểm tra có phải lỗi hydration không
    const isHydrationError =
      error.message.includes("Hydration") ||
      error.message.includes("hydration") ||
      error.message.includes("did not match");

    if (isHydrationError) {
      return { hasError: true, error };
    }

    throw error; // Ném lại lỗi khác (không phải hydration)
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isHydrationError =
      error.message.includes("Hydration") ||
      error.message.includes("hydration") ||
      error.message.includes("did not match");

    if (isHydrationError) {
      console.error("HydrationBoundary caught an error:", error, errorInfo);

      this.props.onError?.(error, errorInfo); // Gọi callback nếu có

      // Hiển thị debug info khi dev
      if (process.env.NODE_ENV === "development") {
        console.group("🔍 Hydration Error Debug Info");
        console.log("Error:", error.message);
        console.log("Component Stack:", errorInfo.componentStack);
        console.log("Tip: Kiểm tra timestamp, số random, hoặc conditional render khác nhau giữa server/client");
        console.groupEnd();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Nếu có fallback UI thì dùng
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // Không có fallback → thử render children (tự phục hồi)
      return this.props.children;
    }

    return this.props.children;
  }
}
