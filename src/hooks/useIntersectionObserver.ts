import { useEffect, useRef, useReducer } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '200px', // Start loading 200px before visible
    freezeOnceVisible = true,
  } = options;

  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, dispatchVisible] = useReducer((s: boolean, a: boolean) => a, false);
  const isFrozenRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already visible and freezeOnceVisible is true, don't observe
    if (freezeOnceVisible && isFrozenRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldUpdate = entry.isIntersecting;

        if (shouldUpdate) {
          dispatchVisible(true);

          // If freezeOnceVisible, disconnect after first intersection
          if (freezeOnceVisible) {
            isFrozenRef.current = true;
            observer.disconnect();
          }
        } else if (!freezeOnceVisible) {
          dispatchVisible(false);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [elementRef, isVisible];
}

