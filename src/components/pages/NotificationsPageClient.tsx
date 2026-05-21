"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios-instance";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocaleFromLanguage } from "@/constants/app.constants";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  getNotificationsPageUiMessages,
  type NotificationUiType,
} from "@/lib/ui-messages";
import { formatRelativeTimeByLanguage } from "@/utils/dateFormatter";
import NotificationDetailModal, { type NotificationDetailItem } from "@/components/notifications/NotificationDetailModal";

interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  actionUrl?: string;
  type: NotificationUiType;
  createdAt: string;
  isRead?: boolean;
  metadata?: {
    movieId?: number;
    tvId?: number;
    commentId?: number;
    parentId?: number;
    [key: string]: unknown;
  };
}

function getLocalizedNotif(
  n: { title: string; message: string; titleVi?: string; messageVi?: string; titleEn?: string; messageEn?: string },
  language: string
) {
  if (language === "vi") return { title: n.titleVi || n.title, message: n.messageVi || n.message };
  return { title: n.titleEn || n.title, message: n.messageEn || n.message };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { language } = useLanguage();
  const labels = getNotificationsPageUiMessages(language);
  const locale = getLocaleFromLanguage(language);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDetailItem | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 50, unreadOnly: showUnreadOnly || undefined },
        });

        if (
          response.data?.success &&
          Array.isArray(response.data.data?.notifications)
        ) {
          const items = response.data.data.notifications.map(
            (n: Partial<NotificationItem>) => ({
              id: n.id ?? crypto.randomUUID(),
              title: n.title ?? labels.fallbackTitle,
              message: n.message ?? "",
              titleVi: n.titleVi,
              messageVi: n.messageVi,
              titleEn: n.titleEn,
              messageEn: n.messageEn,
              actionUrl: n.actionUrl,
              type: (n.type as NotificationItem["type"]) || "info",
              createdAt: n.createdAt ?? new Date().toISOString(),
              isRead: n.isRead,
              metadata: n.metadata,
            })
          ) as NotificationItem[];
          setNotifications(items);
          setIsEmpty(items.length === 0);
        } else {
          setError(labels.noNotificationsFound);
          setIsEmpty(true);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError(labels.cannotLoadNotifications);
        setIsEmpty(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [
    labels.cannotLoadNotifications,
    labels.fallbackTitle,
    labels.noNotificationsFound,
    showUnreadOnly,
  ]);

  const badgeStyles: Record<NotificationItem["type"], string> = {
    info: "bg-blue-900/50 text-blue-200 border border-blue-700/60",
    success: "bg-green-900/50 text-green-200 border border-green-700/60",
    warning: "bg-yellow-900/40 text-yellow-200 border border-yellow-700/60",
    error: "bg-red-900/40 text-red-200 border border-red-700/60",
    system: "bg-purple-900/40 text-purple-200 border border-purple-700/60",
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;
  const filteredEmpty = filteredNotifications.length === 0;

  // Group notifications by date (YYYY-MM-DD)
  const groupedByDate = filteredNotifications.reduce<
    Record<string, NotificationItem[]>
  >((acc, notif) => {
    const dateKey = new Date(notif.createdAt).toISOString().split("T")[0];
    acc[dateKey] = acc[dateKey] ? [...acc[dateKey], notif] : [notif];
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) =>
    a < b ? 1 : -1
  );

  const resolveTargetUrl = (notif: NotificationItem): string | null => {
    if (notif.actionUrl) return notif.actionUrl;
    const meta = notif.metadata;
    if (meta?.movieId) return `/watch/movie-${meta.movieId}`;
    if (meta?.tvId) return `/watch/tv-${meta.tvId}`;
    return null;
  };

  const markNotificationAsRead = async (notif: NotificationItem) => {
    if (notif.isRead) return;

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notif.id ? { ...item, isRead: true } : item
      )
    );

    try {
      await axiosInstance.put(`/notifications/${notif.id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notif.id ? { ...item, isRead: false } : item
        )
      );
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif);
    const url = resolveTargetUrl(notif);
    if (url) {
      router.push(url);
    } else {
      setSelectedNotification(notif);
    }
  };

  const handleDeleteNotification = async (notif: NotificationItem) => {
    const previousNotifications = notifications;
    setNotifications((prev) => prev.filter((item) => item.id !== notif.id));
    setIsEmpty(previousNotifications.length <= 1);

    try {
      await axiosInstance.delete(`/notifications/${notif.id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setNotifications(previousNotifications);
      setIsEmpty(previousNotifications.length === 0);
    }
  };

  const handleClearNotifications = async () => {
    const previousNotifications = notifications;
    setNotifications([]);
    setIsEmpty(true);

    try {
      await axiosInstance.delete("/notifications");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      setNotifications(previousNotifications);
      setIsEmpty(previousNotifications.length === 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
      <Header />
      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-800 shadow-xl p-6 mb-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">{labels.pageTitle}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {labels.pageSubtitle}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {notifications.length > 0
                    ? labels.notificationsCount(notifications.length)
                    : labels.noNotifications}
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border bg-red-950/40 border-red-800/60 text-red-200 hover:bg-red-900/50 cursor-pointer"
                    title={labels.clearNotifications}
                  >
                    <Trash2 size={14} />
                    {labels.clearNotifications}
                  </button>
                )}
                <button
                  onClick={() => setShowUnreadOnly((v) => !v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border cursor-pointer ${
                    showUnreadOnly
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750"
                  }`}
                >
                  {showUnreadOnly ? labels.showAll : labels.unreadOnly}
                </button>
              </div>
            </div>
          </div>

          {loading || isLoading ? (
            <div className="text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-4">
              {labels.loading}
            </div>
          ) : null}

          {error && (
            <div className="text-red-300 bg-red-900/40 border border-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {!loading && !isLoading && !error && (
            <>
              {isEmpty ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-300 min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    {labels.noNotificationsYet}
                  </div>
                  <p className="text-sm text-gray-400">
                    {labels.noNotificationsDesc}
                  </p>
                </div>
              ) : filteredEmpty ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-300 min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    {labels.noUnread}
                  </div>
                  <p className="text-sm text-gray-400">
                    {labels.noUnreadDesc}
                  </p>
                </div>
              ) : null}
            </>
          )}

          {sortedDateKeys.length > 0 && (
            <div className="space-y-6">
              {sortedDateKeys.map((dateKey) => {
                const day = new Date(dateKey);
                const dayLabel = day.toLocaleDateString(locale, {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div key={dateKey} className="space-y-3">
                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1">
                      {dayLabel}
                    </div>
                    {groupedByDate[dateKey].map((notif) => {
                      return (
                        <div
                          key={notif.id}
                          className={`bg-gray-850/60 border rounded-xl p-5 shadow-lg transition-all duration-200 hover:bg-gray-850 hover:shadow-xl cursor-pointer ${
                            notif.isRead
                              ? "border-gray-750/50"
                              : "border-blue-700/40 bg-gray-850/80"
                          }`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNotificationClick(notif)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleNotificationClick(notif);
                            }
                          }}
                        >
                        <div className="flex items-start gap-4">
                          {/* Type Icon/Badge */}
                          <div
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold capitalize shadow-sm ${
                              badgeStyles[notif.type]
                            }`}
                          >
                            {labels.typeLabels[notif.type]}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {(() => {
                              const { title, message } = getLocalizedNotif(notif, language);
                              return (
                                <>
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="text-white font-semibold text-base leading-tight">
                                      {title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatRelativeTimeByLanguage(
                                          new Date(notif.createdAt),
                                          language
                                        )}
                                      </div>
                                      <button
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleDeleteNotification(notif);
                                        }}
                                        className="inline-flex size-8 items-center justify-center rounded-md text-red-300 hover:bg-red-950/40 hover:text-red-200 cursor-pointer"
                                        title={labels.deleteNotification}
                                        aria-label={labels.deleteNotification}
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-sm leading-relaxed">
                                    {message}
                                  </p>
                                </>
                              );
                            })()}

                            {/* Unread indicator */}
                            {!notif.isRead && (
                              <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md">
                                <span className="size-2 bg-blue-400 rounded-full animate-pulse"></span>
                                <span className="text-xs text-blue-300 font-medium">
                                  {labels.new}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
