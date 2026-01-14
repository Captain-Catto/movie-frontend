import type {
  NotificationFilters,
  SendModalType,
  NotificationFormData,
} from "@/types/notifications.types";
import { SEND_MODAL_BUTTONS } from "@/types/notifications.types";

interface NotificationsHeaderProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  onClearFilters: () => void;
  onOpenSendModal: (type: SendModalType) => void;
  setFormData: React.Dispatch<React.SetStateAction<NotificationFormData>>;
  formData: NotificationFormData;
  title?: string;
  description?: string;
  showTitle?: boolean;
}

// SVG Icon Components
const MailIcon = () => (
  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const ICON_MAP = {
  mail: MailIcon,
  users: UsersIcon,
  user: UserIcon,
  warning: WarningIcon,
};

export default function NotificationsHeader({
  filters,
  onFiltersChange,
  onClearFilters,
  onOpenSendModal,
  setFormData,
  formData,
  title = "Notification Management",
  description = "Send and manage notifications to users",
  showTitle = true,
}: NotificationsHeaderProps) {
  const handleMaintenanceClick = () => {
    onOpenSendModal("maintenance");
    setFormData({
      ...formData,
      title: "Scheduled System Maintenance",
      message:
        "We will be performing scheduled maintenance. Services may be temporarily unavailable during this time. Please specify the maintenance time below. We apologize for any inconvenience.",
      notificationType: "warning",
    });
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                onFiltersChange({ ...filters, startDate: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:bg-gray-600 transition-colors cursor-pointer"
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
          {SEND_MODAL_BUTTONS.map((button) => {
            const IconComponent = ICON_MAP[button.icon as keyof typeof ICON_MAP];
            const buttonColor = `${button.bgColor} ${button.hoverColor}`;

            return (
              <button
                key={button.type}
                onClick={() =>
                  button.type === "maintenance"
                    ? handleMaintenanceClick()
                    : onOpenSendModal(button.type)
                }
                className={`${buttonColor} text-white p-4 rounded-lg font-semibold transition-colors text-left cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent />
                  <div className="flex-1">
                    <div className="font-bold mb-1">{button.title}</div>
                    <p
                      className={`text-xs opacity-90 ${
                        button.type === "broadcast"
                          ? "text-blue-200"
                          : button.type === "role"
                          ? "text-green-200"
                          : button.type === "user"
                          ? "text-purple-200"
                          : "text-orange-200"
                      }`}
                    >
                      {button.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
