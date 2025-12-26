"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface HydrationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Fallback UI when hydration error occurs
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Callback when error is caught
}

interface HydrationBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary specialized in catching and handling React hydration errors.
 *
 * Catches errors when server HTML doesn't match client render.
 * Provides fallback UI or auto-recovers when errors occur.
 *
 * @example
 * // Basic
 * <HydrationBoundary>
 *   <ComponentThatMightFail />
 * </HydrationBoundary>
 *
 * // With fallback UI
 * <HydrationBoundary fallback={<div>Unable to load content</div>}>
 *   <DynamicContent />
 * </HydrationBoundary>
 *
 * // With error logging
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
    // Check if it's a hydration error
    const isHydrationError =
      error.message.includes("Hydration") ||
      error.message.includes("hydration") ||
      error.message.includes("did not match");

    if (isHydrationError) {
      return { hasError: true, error };
    }

    throw error; // Re-throw other errors (non-hydration)
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isHydrationError =
      error.message.includes("Hydration") ||
      error.message.includes("hydration") ||
      error.message.includes("did not match");

    if (isHydrationError) {
      console.error("HydrationBoundary caught an error:", error, errorInfo);

      this.props.onError?.(error, errorInfo); // Call callback if provided

      // Show debug info in development
      if (process.env.NODE_ENV === "development") {
        console.group("🔍 Hydration Error Debug Info");
        console.log("Error:", error.message);
        console.log("Component Stack:", errorInfo.componentStack);
        console.log("Tip: Check for timestamps, random numbers, or different conditional renders between server/client");
        console.groupEnd();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // If fallback UI is provided, use it
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // No fallback → try rendering children (auto-recover)
      return this.props.children;
    }

    return this.props.children;
  }
}
