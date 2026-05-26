"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export default function LazySection({
  children,
  fallback,
  rootMargin = "200px", // Load content 200px before it enters the viewport
  threshold = 0.01,
}: LazySectionProps) {
  const [isIntersected, setIsIntersected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
        }
      },
      { rootMargin, threshold }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [isIntersected, rootMargin, threshold]);

  return (
    <div ref={containerRef} className="w-full">
      {isIntersected ? children : fallback}
    </div>
  );
}
