import { useState, useEffect, useCallback } from 'react';

/**
 * Options for useAsyncQuery hook
 */
export interface UseAsyncQueryOptions<T> {
  /** The async function to execute */
  queryFn: () => Promise<T>;
  /** Dependencies array for useEffect (when to re-run query) */
  dependencies?: React.DependencyList;
  /** Whether the query is enabled (default: true) */
  enabled?: boolean;
  /** Callback when query succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when query fails */
  onError?: (error: Error) => void;
  /** Initial data before query completes */
  initialData?: T;
}

/**
 * Result returned by useAsyncQuery hook
 */
export interface UseAsyncQueryResult<T> {
  /** Query result data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
  /** Whether query has been executed at least once */
  isFetched: boolean;
}

/**
 * Generic hook for handling async operations with loading/error states
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAsyncQuery({
 *   queryFn: async () => {
 *     const response = await apiService.getMovies();
 *     return response.data;
 *   },
 *   dependencies: [page, genre],
 *   onSuccess: (data) => console.log('Movies loaded:', data),
 *   onError: (error) => console.error('Failed to load:', error)
 * });
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <MovieList movies={data} onRefresh={refetch} />;
 * ```
 */
export function useAsyncQuery<T>(
  options: UseAsyncQueryOptions<T>
): UseAsyncQueryResult<T> {
  const {
    queryFn,
    dependencies = [],
    enabled = true,
    onSuccess,
    onError,
    initialData,
  } = options;

  const [data, setData] = useState<T | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  const execute = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      setIsFetched(true);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [queryFn, enabled, onSuccess, onError]);

  // Auto-execute on mount or when dependencies change
  useEffect(() => {
    if (enabled) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    isFetched,
  };
}
