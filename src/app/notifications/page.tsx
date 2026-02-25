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
import { getCommonUiMessages } from "@/lib/ui-messages";
import { formatRelativeTimeByLanguage } from "@/utils/dateFormatter";

interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
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

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const common = getCommonUiMessages(language);
  const locale = getLocaleFromLanguage(language);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const labels = {
    fallbackTitle: isVietnamese ? "Thông báo" : "Notification",
    noNotificationsFound: isVietnamese
      ? "Không tìm thấy thông báo"
      : "No notifications found",
    cannotLoadNotifications: isVietnamese
      ? "Không thể tải thông báo. Vui lòng thử lại."
      : "Unable to load notifications. Please try again.",
    pageTitle: isVietnamese ? "Thông báo" : "Notifications",
    pageSubtitle: isVietnamese
      ? "Cập nhật mới nhất cho tài khoản của bạn."
      : "Latest updates for your account.",
    notificationsCount: (count: number) =>
      isVietnamese
        ? `${count} thông báo`
        : `${count} notification${count === 1 ? "" : "s"}`,
    noNotifications: isVietnamese ? "Không có thông báo" : "No notifications",
    showAll: common.showAll,
    unreadOnly: common.unreadOnly,
    loading: isVietnamese ? "Đang tải thông báo..." : common.loading,
    noNotificationsYet: isVietnamese ? "Chưa có thông báo" : "No notifications yet",
    noNotificationsDesc: isVietnamese
      ? "Khi có cập nhật mới, thông báo sẽ xuất hiện tại đây."
      : "When there are new updates, notifications will appear here.",
    noUnread: isVietnamese ? "Không có thông báo chưa đọc" : "No unread notifications",
    noUnreadDesc: isVietnamese
      ? 'Bạn đã đọc hết thông báo. Chuyển sang "Hiện tất cả" để xem lịch sử.'
      : 'You\'ve read all notifications. Switch to "Show all" to view history.',
    new: isVietnamese ? "Mới" : "New",
  };

  const typeLabels: Record<NotificationItem["type"], string> = {
    info: isVietnamese ? "Thông tin" : "Info",
    success: isVietnamese ? "Thành công" : "Success",
    warning: isVietnamese ? "Cảnh báo" : "Warning",
    error: isVietnamese ? "Lỗi" : "Error",
    system: isVietnamese ? "Hệ thống" : "System",
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 50 },
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
  }, [labels.cannotLoadNotifications, labels.fallbackTitle, labels.noNotificationsFound]);

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

  const resolveTargetUrl = (metadata?: NotificationItem["metadata"]) => {
    if (!metadata) return null;
    if (metadata.movieId) return `/watch/movie-${metadata.movieId}`;
    if (metadata.tvId) return `/watch/tv-${metadata.tvId}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
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
                      const targetUrl = resolveTargetUrl(notif.metadata);
                      const isClickable = Boolean(targetUrl);
                      return (
                        <div
                          key={notif.id}
                          className={`bg-gray-850/60 border rounded-xl p-5 shadow-lg transition-all duration-200 hover:bg-gray-850 hover:shadow-xl ${
                            notif.isRead
                              ? "border-gray-750/50"
                              : "border-blue-700/40 bg-gray-850/80"
                          } ${isClickable ? "cursor-pointer" : ""}`}
                          role={isClickable ? "button" : undefined}
                          tabIndex={isClickable ? 0 : undefined}
                          onClick={() => {
                            if (targetUrl) {
                              router.push(targetUrl);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (!isClickable) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (targetUrl) router.push(targetUrl);
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
                            {typeLabels[notif.type]}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-white font-semibold text-base leading-tight">
                                {notif.title}
                              </h3>
                              <div className="text-xs text-gray-500 whitespace-nowrap">
                                {formatRelativeTimeByLanguage(
                                  new Date(notif.createdAt),
                                  language
                                )}
                              </div>
                            </div>

                            <p className="text-gray-300 text-sm leading-relaxed">
                              {notif.message}
                            </p>

                            {/* Unread indicator */}
                            {!notif.isRead && (
                              <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
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
