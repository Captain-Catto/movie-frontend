"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios-instance";
import { formatRelativeTime } from "@/utils/dateFormatter";

interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: string;
  isRead?: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Thông báo</h1>
          <p className="text-gray-400 text-sm mt-1">
            Những cập nhật mới nhất cho tài khoản của bạn.
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {notifications.length > 0 && `${notifications.length} thông báo`}
        </div>
      </div>

      {loading && (
        <div className="text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-4">
          Đang tải thông báo...
        </div>
      )}

      {error && (
        <div className="text-red-300 bg-red-900/40 border border-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {!loading && isEmpty && !error && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-300">
          <div className="text-lg font-semibold text-white mb-2">Chưa có thông báo</div>
          <p className="text-sm text-gray-400">
            Khi có cập nhật mới, thông báo sẽ xuất hiện ở đây.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notif) => (
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
    </div>
  );
}
