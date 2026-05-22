import type {
  SendModalState,
  NotificationFormData,
} from "@/types/notifications.types";
import ImageUploadField from "@/components/notifications/ImageUploadField";

interface NotificationModalProps {
  sendModal: SendModalState;
  formData: NotificationFormData;
  onFormDataChange: (formData: NotificationFormData) => void;
  onClose: () => void;
  onSend: () => void;
}

export default function NotificationModal({
  sendModal,
  formData,
  onFormDataChange,
  onClose,
  onSend,
}: NotificationModalProps) {
  if (!sendModal.open) {
    return null;
  }

  const modalTitle =
    sendModal.type === "broadcast"
      ? "Broadcast"
      : sendModal.type === "role"
      ? "Role"
      : sendModal.type === "user"
      ? "User"
      : "Maintenance";

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Send {modalTitle} Notification
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="size-6"
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
          {/* Vietnamese */}
          <div className="rounded-lg border border-gray-600 p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🇻🇳 Tiếng Việt</p>
            <div>
              <label htmlFor="notification-title-vi" className="block text-sm font-medium text-gray-300 mb-1.5">Tiêu đề</label>
              <input
                id="notification-title-vi"
                type="text"
                aria-label="Vietnamese notification title"
                value={formData.titleVi}
                onChange={(e) => onFormDataChange({ ...formData, titleVi: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>
            <div>
              <label htmlFor="notification-message-vi" className="block text-sm font-medium text-gray-300 mb-1.5">Nội dung</label>
              <textarea
                id="notification-message-vi"
                aria-label="Vietnamese notification message"
                value={formData.messageVi}
                onChange={(e) => onFormDataChange({ ...formData, messageVi: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Nhập nội dung thông báo"
              />
            </div>
          </div>

          {/* English */}
          <div className="rounded-lg border border-gray-600 p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🇺🇸 English</p>
            <div>
              <label htmlFor="notification-title-en" className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
              <input
                id="notification-title-en"
                type="text"
                aria-label="English notification title"
                value={formData.titleEn}
                onChange={(e) => onFormDataChange({ ...formData, titleEn: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification title"
              />
            </div>
            <div>
              <label htmlFor="notification-message-en" className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
              <textarea
                id="notification-message-en"
                aria-label="English notification message"
                value={formData.messageEn}
                onChange={(e) => onFormDataChange({ ...formData, messageEn: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter notification message"
              />
            </div>
          </div>

          {sendModal.type === "maintenance" && (
            <div className="p-2.5 bg-orange-900 bg-opacity-50 border border-orange-700 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="size-4 text-orange-400 flex-shrink-0"
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
            <label htmlFor="notification-type" className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              id="notification-type"
              value={formData.notificationType}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  notificationType: e.target.value as
                    | "info"
                    | "warning"
                    | "success"
                    | "error",
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
              <label htmlFor="notification-role" className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                id="notification-role"
                value={formData.role}
                onChange={(e) =>
                  onFormDataChange({
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
              <label htmlFor="notification-user-id" className="block text-sm font-medium text-gray-300 mb-2">
                User ID
              </label>
              <input
                id="notification-user-id"
                type="number"
                aria-label="Notification target user ID"
                value={formData.userId}
                onChange={(e) =>
                  onFormDataChange({ ...formData, userId: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
            </div>
          )}

          {sendModal.type === "maintenance" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="notification-maintenance-start" className="block text-xs font-medium text-gray-300 mb-1.5">
                  Start Time (Optional)
                </label>
                <input
                  id="notification-maintenance-start"
                  type="datetime-local"
                  aria-label="Maintenance start time"
                  value={formData.maintenanceStartTime}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      maintenanceStartTime: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="notification-maintenance-end" className="block text-xs font-medium text-gray-300 mb-1.5">
                  End Time (Optional)
                </label>
                <input
                  id="notification-maintenance-end"
                  type="datetime-local"
                  aria-label="Maintenance end time"
                  value={formData.maintenanceEndTime}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      maintenanceEndTime: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notification-action-url" className="block text-sm font-medium text-gray-300 mb-1.5">
              Link (optional)
            </label>
              <input
                id="notification-action-url"
                type="text"
                aria-label="Notification action URL"
                value={formData.actionUrl}
              onChange={(e) => onFormDataChange({ ...formData, actionUrl: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/movie/12345 hoặc /tv/67890"
            />
            <p className="text-xs text-gray-500 mt-1">Người dùng sẽ được dẫn đến trang này khi bấm vào thông báo</p>
          </div>

          <ImageUploadField
            value={formData.imageUrl}
            onChange={(url) => onFormDataChange({ ...formData, imageUrl: url })}
          />
          <p className="text-xs text-gray-500 -mt-1">
            Ảnh hiển thị ở đầu popup khi người dùng bấm vào thông báo (nếu không có link dẫn)
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}
