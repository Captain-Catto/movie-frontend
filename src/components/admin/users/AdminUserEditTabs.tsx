import type { AdminUsersTab } from "./types";

interface AdminUserEditTabsProps {
  activeTab: AdminUsersTab;
  onSelectTab: (tab: AdminUsersTab) => void;
  onLoadLogs: () => void;
}

export default function AdminUserEditTabs({
  activeTab,
  onSelectTab,
  onLoadLogs,
}: AdminUserEditTabsProps) {
  return (
    <div className="flex gap-x-1 mb-6 border-b border-gray-700">
      <button
        type="button"
        onClick={() => onSelectTab("info")}
        className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
          activeTab === "info"
            ? "text-white border-b-2 border-red-600"
            : "text-gray-400 hover:text-white"
        }`}
      >
        User Info
      </button>
      <button
        type="button"
        onClick={() => onSelectTab("watch")}
        className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
          activeTab === "watch"
            ? "text-white border-b-2 border-red-600"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Watch History
      </button>
      <button
        type="button"
        onClick={() => {
          onSelectTab("logs");
          onLoadLogs();
        }}
        className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
          activeTab === "logs"
            ? "text-white border-b-2 border-red-600"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Activity Logs
      </button>
    </div>
  );
}
