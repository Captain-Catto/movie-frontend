import type { Notification, PaginationMeta } from "@/types/notifications.types";
import { NOTIFICATION_TYPE_COLORS } from "@/types/notifications.types";

interface NotificationsTableProps {
  notifications: Notification[];
  loading: boolean;
  pagination: PaginationMeta;
  onPaginationChange: (pagination: PaginationMeta) => void;
  onDeleteNotification: (id: number) => void;
}

export default function NotificationsTable({
  notifications,
  loading,
  pagination,
  onPaginationChange,
  onDeleteNotification,
}: NotificationsTableProps) {
  return (
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
              <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          ) : !Array.isArray(notifications) ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                Error: Invalid notifications data format
              </td>
            </tr>
          ) : notifications.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
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
                      NOTIFICATION_TYPE_COLORS[notification.type]
                    }`}
                  >
                    {notification.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {notification.targetType}
                  {notification.targetValue && ` (${notification.targetValue})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-gray-500">Delivered</span>
                      <span className="font-semibold text-yellow-400">
                        {notification.analytics?.deliveredCount ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-gray-500">Read</span>
                      <span className="font-semibold text-green-400">
                        {notification.analytics?.readCount ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-gray-500">Unread</span>
                      <span className="font-semibold text-purple-400">
                        {Math.max(
                          (notification.analytics?.deliveredCount ?? 0) -
                            (notification.analytics?.readCount ?? 0),
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-gray-500">Targeted</span>
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
                    onClick={() => onDeleteNotification(notification.id)}
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
                onPaginationChange({
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
                onPaginationChange({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
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
                      onClick={() => onPaginationChange({ ...pagination, page })}
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
                onPaginationChange({ ...pagination, page: pagination.page + 1 })
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
  );
}
