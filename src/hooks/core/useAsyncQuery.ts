import { useEffect, useCallback, useReducer, useRef } from 'react';

export interface UseAsyncQueryOptions<T> {
  queryFn: () => Promise<T>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

export interface UseAsyncQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFetched: boolean;
}

type QueryState<T> = {
  data: T | null;
  error: Error | null;
  status: "idle" | "loading" | "success" | "error";
};

type QueryAction<T> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; error: Error };

export function useAsyncQuery<T>(options: UseAsyncQueryOptions<T>): UseAsyncQueryResult<T> {
  const { queryFn, enabled = true, onSuccess, onError, initialData } = options;

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const [state, dispatch] = useReducer(
    (s: QueryState<T>, a: QueryAction<T>): QueryState<T> => {
      switch (a.type) {
        case "loading": return { ...s, status: "loading", error: null };
        case "success": return { data: a.data, error: null, status: "success" };
        case "error": return { ...s, error: a.error, status: "error" };
      }
    },
    { data: initialData ?? null, error: null, status: "idle" }
  );

  const { data, error, status } = state;
  const loading = status === "loading";
  const isFetched = status === "success";

  const execute = useCallback(async () => {
    if (!enabled) return;
    dispatch({ type: "loading" });
    try {
      const result = await queryFn();
      dispatch({ type: "success", data: result });
      onSuccessRef.current?.(result);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      dispatch({ type: "error", error: errorObj });
      onErrorRef.current?.(errorObj);
    }
  }, [queryFn, enabled]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute, isFetched };
}

