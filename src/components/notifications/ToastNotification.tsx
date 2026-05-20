"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ToastNotification {
  id: number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: Date;
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
    textColor: "text-blue-100",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
    textColor: "text-green-100",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-100",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
    textColor: "text-red-100",
  },
  system: {
    icon: Info,
    bgColor: "bg-purple-500",
    borderColor: "border-purple-500",
    textColor: "text-purple-100",
  },
};

export function ToastNotificationProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { latestNotification } = useNotificationSocket();
  const { language } = useLanguage();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    if (!latestNotification) return;

    const newToast: ToastNotification = {
      id: latestNotification.id,
      title: latestNotification.title,
      message: latestNotification.message,
      titleVi: latestNotification.titleVi,
      messageVi: latestNotification.messageVi,
      titleEn: latestNotification.titleEn,
      messageEn: latestNotification.messageEn,
      type: latestNotification.type,
      createdAt: latestNotification.createdAt,
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [latestNotification]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 pointer-events-none">
          {toasts.map((toast) => {
            const config = typeConfig[toast.type];
            const Icon = config.icon;

            return (
              <div
                key={toast.id}
                className={cn(
                  "relative w-80 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm pointer-events-auto",
                  "bg-gray-800/90 border-gray-600",
                  config.borderColor,
                  "animate-in slide-in-from-top duration-300"
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
                      {language.startsWith("vi") ? (toast.titleVi || toast.title) : (toast.titleEn || toast.title)}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {language.startsWith("vi") ? (toast.messageVi || toast.message) : (toast.messageEn || toast.message)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                      {new Date(toast.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
