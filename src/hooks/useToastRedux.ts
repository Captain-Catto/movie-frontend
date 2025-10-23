import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addToast, removeToast, type Toast } from "@/store/toastSlice";

export interface UseToastReturn {
  showToast: (toast: Omit<Toast, "id">) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

/**
 * Redux-based Toast Hook
 * Replacement for useToast from ToastContext
 */
export function useToastRedux(): UseToastReturn {
  const dispatch = useAppDispatch();

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      dispatch(addToast(toast));
    },
    [dispatch]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      dispatch(addToast({ title, message, type: "success" }));
    },
    [dispatch]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      dispatch(addToast({ title, message, type: "error" }));
    },
    [dispatch]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      dispatch(addToast({ title, message, type: "info" }));
    },
    [dispatch]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      dispatch(addToast({ title, message, type: "warning" }));
    },
    [dispatch]
  );

  const handleRemoveToast = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch]
  );

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast: handleRemoveToast,
  };
}
