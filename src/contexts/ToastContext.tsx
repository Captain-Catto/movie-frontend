"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: "info" | "success" | "warning" | "error";
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

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

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    ({ title, message, type }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, title, message, type };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, type: "success" });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, type: "error" });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, type: "info" });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, type: "warning" });
    },
    [showToast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
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
                    <p className="text-sm font-medium text-white">
                      {toast.title}
                    </p>
                    {toast.message && (
                      <p className="text-sm text-gray-300 mt-1">
                        {toast.message}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
