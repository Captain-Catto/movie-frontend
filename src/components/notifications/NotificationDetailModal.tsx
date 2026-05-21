"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RelativeTime } from "@/utils/hydration-safe-date";

export interface NotificationDetailItem {
  id: string | number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  type: string;
  createdAt: Date | string;
  metadata?: { imageUrl?: string; [key: string]: unknown };
}

interface Props {
  notification: NotificationDetailItem;
  onClose: () => void;
}

function getLocalizedNotif(
  n: { title: string; message: string; titleVi?: string; messageVi?: string; titleEn?: string; messageEn?: string },
  language: string
) {
  if (language.startsWith("vi")) return { title: n.titleVi || n.title, message: n.messageVi || n.message };
  return { title: n.titleEn || n.title, message: n.messageEn || n.message };
}

const TYPE_CONFIG: Record<string, { badge: string; label: string; headerGradient: string; icon: React.ReactNode }> = {
  warning: {
    badge: "bg-yellow-900/70 text-yellow-200 border border-yellow-700/60",
    label: "Warning",
    headerGradient: "from-yellow-950 via-orange-950 to-gray-900",
    icon: (
      <svg className="w-14 h-14 text-yellow-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    badge: "bg-blue-900/70 text-blue-200 border border-blue-700/60",
    label: "Info",
    headerGradient: "from-blue-950 via-blue-900 to-gray-900",
    icon: (
      <svg className="w-14 h-14 text-blue-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
  success: {
    badge: "bg-green-900/70 text-green-200 border border-green-700/60",
    label: "Success",
    headerGradient: "from-green-950 via-emerald-950 to-gray-900",
    icon: (
      <svg className="w-14 h-14 text-green-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    badge: "bg-red-900/70 text-red-200 border border-red-700/60",
    label: "Error",
    headerGradient: "from-red-950 via-red-900 to-gray-900",
    icon: (
      <svg className="w-14 h-14 text-red-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  system: {
    badge: "bg-purple-900/70 text-purple-200 border border-purple-700/60",
    label: "System",
    headerGradient: "from-purple-950 via-purple-900 to-gray-900",
    icon: (
      <svg className="w-14 h-14 text-purple-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
};

export default function NotificationDetailModal({ notification, onClose }: Props) {
  const { language } = useLanguage();
  const { title, message } = getLocalizedNotif(notification, language);
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;
  const imageUrl = notification.metadata?.imageUrl as string | undefined;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="presentation"
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header — image or type illustration */}
        {imageUrl ? (
          <div className="relative w-full aspect-video bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          </div>
        ) : (
          <div className={`w-full h-36 bg-gradient-to-br ${config.headerGradient} flex items-center justify-center`}>
            <div className="flex flex-col items-center gap-2 opacity-90">
              {config.icon}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Badge + time */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
              {config.label}
            </span>
            <RelativeTime
              date={notification.createdAt}
              className="text-xs text-gray-500"
              language={language}
            />
          </div>

          {/* Title */}
          <h2 className="text-white font-semibold text-lg leading-snug">{title}</h2>

          {/* Message */}
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
