'use client';

import { useState, useEffect } from 'react';

interface UseLoadingProps {
  delay?: number;
}

export const useLoading = ({ delay = 1000 }: UseLoadingProps = {}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return { isLoading, setIsLoading };
};