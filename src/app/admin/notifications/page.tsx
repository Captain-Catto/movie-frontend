"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { API_BASE_URL } from "@/services/api";

interface NotificationAnalyticsSummary {
  totalTargetedUsers: number;
  deliveredCount: number;
  readCount: number;
  dismissedCount: number;
  clickCount: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  targetType: "all" | "role" | "user";
  targetValue?: string;
  createdAt: string;
  analytics?: NotificationAnalyticsSummary;
  createdBy?: {
    id: number;
    email: string;
    name: string;
  } | null;
}

interface NotificationStats {
  totalSent: number;
  totalUsers: number;
  totalRead: number;
  totalUnread: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    type: "all" as "all" | "info" | "warning" | "success" | "error",
    startDate: "",
    endDate: "",
  });
  const [sendModal, setSendModal] = useState<{
    open: boolean;
    type: "broadcast" | "role" | "user" | "maintenance";
  }>({ open: false, type: "broadcast" });

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "all" as "all" | "role" | "user",
    targetValue: "",
    notificationType: "info" as "info" | "warning" | "success" | "error",
    userId: "",
    role: "user" as "user" | "admin",
    maintenanceStartTime: "",
    maintenanceEndTime: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      targetType: "all",
      targetValue: "",
      notificationType: "info",
      userId: "",
      role: "user",
      maintenanceStartTime: "",
      maintenanceEndTime: "",
    });
  };

  const handleCloseModal = () => {
    setSendModal({ open: false, type: "broadcast" });
    resetForm();
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Build query params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.type !== "all") {
        params.append("type", filters.type);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/notifications?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Ensure data is always an array
        const notificationsArray: unknown[] = Array.isArray(
          data.data?.notifications
        )
          ? data.data.notifications
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const normalizedNotifications: Notification[] = notificationsArray.map(
          (notification: unknown) => {
            const notif = notification as Record<string, unknown>;
            return {
              ...notif,
              analytics: {
                totalTargetedUsers:
                  (notif.analytics as NotificationAnalyticsSummary | undefined)?.totalTargetedUsers ?? 0,
                deliveredCount: (notif.analytics as NotificationAnalyticsSummary | undefined)?.deliveredCount ?? 0,
                readCount: (notif.analytics as NotificationAnalyticsSummary | undefined)?.readCount ?? 0,
                dismissedCount: (notif.analytics as NotificationAnalyticsSummary | undefined)?.dismissedCount ?? 0,
                clickCount: (notif.analytics as NotificationAnalyticsSummary | undefined)?.clickCount ?? 0,
              },
              createdBy: notif.createdBy as Notification["createdBy"] ?? null,
            } as Notification;
          }
        );

        setNotifications(normalizedNotifications);

        // Update pagination meta if available
        if (data.meta || data.pagination) {
          const meta = data.meta || data.pagination;
          setPagination({
            total: meta.total || 0,
            page: meta.page || pagination.page,
            limit: meta.limit || pagination.limit,
            totalPages:
              meta.totalPages ||
              Math.ceil((meta.total || 0) / (meta.limit || 10)),
          });
        }
      } else {
        console.error("❌ Failed to fetch notifications:", response.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "${API_BASE_URL}/admin/notifications/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setStats({
            totalSent: data.data.totalSent ?? 0,
            totalUsers: data.data.totalUsers ?? 0,
            totalRead: data.data.totalRead ?? 0,
            totalUnread: data.data.totalUnread ?? 0,
          });
        } else {
          setStats(null);
        }
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  };

  const handleSendNotification = async () => {
    try {
      const token = localStorage.getItem("authToken");
      let url = `${API_BASE_URL}/admin/notifications/`;
      const payload: {
        title: string;
        message: string;
        type: string;
        targetType?: string;
        role?: string;
        userId?: number;
        priority?: number;
        metadata?: Record<string, string>;
      } = {
        title: formData.title,
        message: formData.message,
        type: formData.notificationType,
      };

      switch (sendModal.type) {
        case "broadcast":
          url += "broadcast";
          payload.targetType = "all";
          break;
        case "role":
          url += "role";
          payload.role = formData.role;
          break;
        case "user":
          url += "user";
          payload.userId = parseInt(formData.userId);
          break;
        case "maintenance":
          url += "maintenance";
          payload.targetType = "all";
          payload.priority = 3; // High priority
          payload.type = "warning"; // Force warning type for maintenance
          payload.metadata = {};
          if (formData.maintenanceStartTime) {
            payload.metadata.startTime = formData.maintenanceStartTime;
          }
          if (formData.maintenanceEndTime) {
            payload.metadata.endTime = formData.maintenanceEndTime;
          }
          break;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        handleCloseModal();
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/admin/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Notification Management
          </h1>
          <p className="text-gray-400">
            Send and manage notifications to users
          </p>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300">
                  Targeted Users
                </h3>
                <p className="text-2xl font-bold text-blue-500">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300">
                  Delivered
                </h3>
                <p className="text-2xl font-bold text-yellow-500">
                  {stats.totalSent}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300">Read</h3>
                <p className="text-2xl font-bold text-green-500">
                  {stats.totalRead}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300">Unread</h3>
                <p className="text-2xl font-bold text-purple-500">
                  {stats.totalUnread}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type: e.target.value as typeof filters.type,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ type: "all", startDate: "", endDate: "" });
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Send Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setSendModal({ open: true, type: "broadcast" })}
                className="bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 mt-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div className="flex-1">
                    <div className="font-bold mb-1">Send Broadcast</div>
                    <p className="text-xs text-blue-200 opacity-90">
                      Send general announcement to all users
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setSendModal({ open: true, type: "role" })}
                className="bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 mt-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <div className="flex-1">
                    <div className="font-bold mb-1">Send to Role</div>
                    <p className="text-xs text-green-200 opacity-90">
                      Target users by their role (user/admin)
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSendModal({ open: true, type: "user" })}
                className="bg-purple-600 text-white p-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 mt-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="font-bold mb-1">Send to User</div>
                    <p className="text-xs text-purple-200 opacity-90">
                      Send notification to specific user by ID
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSendModal({ open: true, type: "maintenance" });
                  setFormData({
                    ...formData,
                    title: "Scheduled System Maintenance",
                    message: "We will be performing scheduled maintenance. Services may be temporarily unavailable during this time. Please specify the maintenance time below. We apologize for any inconvenience.",
                    notificationType: "warning",
                  });
                }}
                className="bg-orange-600 text-white p-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 mt-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="font-bold mb-1">Maintenance Notice</div>
                    <p className="text-xs text-orange-200 opacity-90">
                      High priority system maintenance alert with schedule
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
          <table className="min-w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : !Array.isArray(notifications) ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-red-500"
                  >
                    Error: Invalid notifications data format
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No notifications found
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {notification.message.length > 50
                            ? `${notification.message.substring(0, 50)}...`
                            : notification.message}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          notification.type === "success"
                            ? "bg-green-900 text-green-300"
                            : notification.type === "error"
                            ? "bg-red-900 text-red-300"
                            : notification.type === "warning"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-blue-900 text-blue-300"
                        }`}
                      >
                        {notification.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {notification.targetType}
                      {notification.targetValue &&
                        ` (${notification.targetValue})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase text-gray-500">
                            Delivered
                          </span>
                          <span className="font-semibold text-yellow-400">
                            {notification.analytics?.deliveredCount ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase text-gray-500">
                            Read
                          </span>
                          <span className="font-semibold text-green-400">
                            {notification.analytics?.readCount ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase text-gray-500">
                            Unread
                          </span>
                          <span className="font-semibold text-purple-400">
                            {Math.max(
                              (notification.analytics?.deliveredCount ?? 0) -
                                (notification.analytics?.readCount ?? 0),
                              0
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase text-gray-500">
                            Targeted
                          </span>
                          <span className="font-semibold text-blue-400">
                            {notification.analytics?.totalTargetedUsers ?? 0}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {!loading && notifications.length > 0 && (
            <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={pagination.limit}
                  onChange={(e) =>
                    setPagination({
                      ...pagination,
                      limit: parseInt(e.target.value),
                      page: 1,
                    })
                  }
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setPagination({ ...pagination, page })}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            pagination.page === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Send Notification Modal */}
        {sendModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Send{" "}
                  {sendModal.type === "broadcast"
                    ? "Broadcast"
                    : sendModal.type === "role"
                    ? "Role"
                    : sendModal.type === "user"
                    ? "User"
                    : "Maintenance"}{" "}
                  Notification
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter notification message"
                  />
                </div>

                {sendModal.type === "maintenance" && (
                  <div className="p-2.5 bg-orange-900 bg-opacity-50 border border-orange-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-orange-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-orange-200">
                        High priority warning sent to all users
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.notificationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notificationType: e.target.value as "info" | "warning" | "success" | "error",
                      })
                    }
                    disabled={sendModal.type === "maintenance"}
                    className={`w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      sendModal.type === "maintenance"
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                  {sendModal.type === "maintenance" && (
                    <p className="text-xs text-gray-400 mt-1">
                      Maintenance notifications are always sent as warnings
                    </p>
                  )}
                </div>

                {sendModal.type === "role" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "user" | "admin",
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                {sendModal.type === "user" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User ID
                    </label>
                    <input
                      type="number"
                      value={formData.userId}
                      onChange={(e) =>
                        setFormData({ ...formData, userId: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter user ID"
                    />
                  </div>
                )}

                {sendModal.type === "maintenance" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        Start Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.maintenanceStartTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maintenanceStartTime: e.target.value,
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        End Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.maintenanceEndTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maintenanceEndTime: e.target.value,
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
