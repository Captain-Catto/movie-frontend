"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios-instance";
import { formatRelativeTime } from "@/utils/dateFormatter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";

interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: string;
  isRead?: boolean;
}

export default function NotificationsPage() {
  const { isLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 50 },
        });

        if (response.data?.success && Array.isArray(response.data.data?.notifications)) {
          const items = response.data.data.notifications.map((n: Partial<NotificationItem>) => ({
            id: n.id ?? crypto.randomUUID(),
            title: n.title ?? "Notification",
            message: n.message ?? "",
            type: (n.type as NotificationItem["type"]) || "info",
            createdAt: n.createdAt ?? new Date().toISOString(),
            isRead: n.isRead,
          })) as NotificationItem[];
          setNotifications(items);
          setIsEmpty(items.length === 0);
        } else {
          setError("Không tìm thấy thông báo nào");
          setIsEmpty(true);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError("Không thể tải thông báo. Vui lòng thử lại.");
        setIsEmpty(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-800 shadow-xl p-6 mb-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">Thông báo</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Những cập nhật mới nhất dành cho tài khoản của bạn.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {notifications.length > 0
                    ? `${notifications.length} thông báo`
                    : "Không có thông báo"}
                </span>
                <button
                  onClick={() => setShowUnreadOnly((v) => !v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                    showUnreadOnly
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750"
                  }`}
                >
                  {showUnreadOnly ? "Hiển thị tất cả" : "Chỉ chưa đọc"}
                </button>
              </div>
            </div>
          </div>

          {loading || isLoading ? (
            <div className="text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-4">
              Đang tải thông báo...
            </div>
          ) : null}

          {error && (
            <div className="text-red-300 bg-red-900/40 border border-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {!loading && !isLoading && isEmpty && !error && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-300">
              <div className="text-lg font-semibold text-white mb-2">Chưa có thông báo</div>
              <p className="text-sm text-gray-400">
                Khi có cập nhật mới, thông báo sẽ xuất hiện ở đây.
              </p>
            </div>
          )}

          {sortedDateKeys.length > 0 && (
            <div className="space-y-6">
              {sortedDateKeys.map((dateKey) => {
                const day = new Date(dateKey);
                const dayLabel = day.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div key={dateKey} className="space-y-3">
                    <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                      {dayLabel}
                    </div>
                    {groupedByDate[dateKey].map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-gray-850 border border-gray-750 rounded-xl p-4 shadow flex items-start gap-4"
                      >
                        <div
                          className={`px-2 py-1 text-xs rounded-md font-semibold capitalize ${badgeStyles[notif.type]}`}
                        >
                          {notif.type}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-white font-semibold">{notif.title}</div>
                              <div className="text-gray-300 text-sm mt-1 leading-relaxed">
                                {notif.message}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {formatRelativeTime(new Date(notif.createdAt))}
                            </div>
                          </div>
                          {!notif.isRead && (
                            <div className="mt-2 text-xs text-blue-300 font-semibold">
                              Chưa đọc
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
