"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeToast } from "@/store/toastSlice";

const typeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
  },
};

/**
 * ToastContainer - Renders toasts from Redux store
 */
export function ToastContainer() {
  const toasts = useAppSelector((state) => state.toast.toasts);
  const dispatch = useAppDispatch();

  // Auto-remove toasts after 3 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 3000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dispatch]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              "relative w-80 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm",
              "bg-gray-800/90 border-gray-600",
              config.borderColor,
              "animate-in slide-in-from-right duration-300"
            )}
          >
            <div className="flex items-start space-x-3">
              <div
                className={cn(
                  "flex-shrink-0 p-1 rounded-full",
                  config.bgColor
                )}
              >
                <Icon size={16} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm text-gray-300 mt-1">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => dispatch(removeToast(toast.id))}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
