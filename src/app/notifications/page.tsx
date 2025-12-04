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
        } else {
          setError("Không tìm thấy thông báo nào");
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError("Không thể tải thông báo. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-white mb-6">Notifications</h1>

      {loading && (
        <div className="text-gray-300">Đang tải thông báo...</div>
      )}

      {error && (
        <div className="text-red-400 bg-red-900/30 border border-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="text-gray-300">Bạn chưa có thông báo nào.</div>
      )}

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-medium">{notif.title}</div>
                <div className="text-gray-300 text-sm mt-1">
                  {notif.message}
                </div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {formatRelativeTime(new Date(notif.createdAt))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
