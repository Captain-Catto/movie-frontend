import { useEffect, RefObject, useRef } from "react";
import { useIsHydrated } from "./useIsHydrated";

/**
 * Hook that alerts clicks outside of the passed ref
 * Hydration-safe: delays event listener attachment until after hydration
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  const handlerRef = useRef(handler);
  const isHydrated = useIsHydrated();

  // Update handler ref whenever handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Don't attach listeners until after hydration
    if (!isHydrated) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      document.addEventListener("click", listener);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", listener);
    };
  }, [ref, isHydrated]); // Add isHydrated dependency
}
