import type { UserLog } from "./types";
import { formatDateTime } from "./utils";

interface AdminUserLogsTabProps {
  logFilter: string;
  logsLoading: boolean;
  userLogs: UserLog[];
  onLogFilterChange: (value: string) => void;
  onClose: () => void;
}

export default function AdminUserLogsTab({
  logFilter,
  logsLoading,
  userLogs,
  onLogFilterChange,
  onClose,
}: AdminUserLogsTabProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          User activity history including logins, actions, and events
        </p>
        <select
          aria-label="Filter by action"
          value={logFilter}
          onChange={(e) => onLogFilterChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All Actions</option>
          <option value="login">Login</option>
          <option value="watch">Watch</option>
          <option value="favorite">Favorite</option>
          <option value="comment">Comment</option>
          <option value="search">Search</option>
        </select>
      </div>

      <div className="bg-gray-700/30 rounded-lg border border-gray-600 max-h-96 overflow-y-auto">
        {logsLoading ? (
          <div className="p-8 text-center text-gray-400">Loading logs…</div>
        ) : userLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No activity logs found</div>
        ) : (
          <div className="divide-y divide-gray-600">
            {userLogs.flatMap((log) =>
              logFilter === "all" || log.action.toLowerCase().includes(logFilter.toLowerCase())
                ? [
                    <div key={log.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium text-white">{log.action}</span>
                            <span className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-300">{log.description}</p>
                          {log.ipAddress && <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</p>}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                                View details
                              </summary>
                              <pre className="text-xs text-gray-300 mt-1 p-2 bg-gray-800 rounded overflow-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>,
                  ]
                : []
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </>
  );
}
