import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Size variant for container max-width
   * - default: max-w-7xl (1280px) - for content pages
   * - narrow: max-w-4xl (896px) - for forms/settings
   * - wide: max-w-screen-2xl (1536px) - for wide content
   * - full: no max-width limit - for full-width content
   */
  size?: "default" | "narrow" | "wide" | "full";
  /**
   * Padding preset
   * - default: wider responsive padding (px-6 sm:px-8 lg:px-12) to match updated page gutters
   * - tight: minimal padding (px-4)
   * - none: no padding
   */
  padding?: "default" | "tight" | "none";
  /**
   * Add top padding for pages with fixed header
   */
  withHeaderOffset?: boolean;
  /**
   * Custom element type (default: div)
   */
  as?: React.ElementType;
}

export const Container = ({
  children,
  className,
  size = "default",
  padding = "default",
  withHeaderOffset = false,
  as: Component = "div",
}: ContainerProps) => {
  const sizeClasses = {
    default: "max-w-7xl",
    narrow: "max-w-4xl",
    wide: "max-w-screen-2xl",
    full: "",
  };

  const paddingClasses = {
    default: "px-4 sm:px-6 lg:px-8",
    tight: "px-4",
    none: "",
  };

  return (
    <Component
      className={cn(
        // Base styles
        "mx-auto",
        // Size
        sizeClasses[size],
        // Padding
        paddingClasses[padding],
        // Header offset
        withHeaderOffset && "pt-16 lg:pt-18",
        // Custom classes
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Container;
