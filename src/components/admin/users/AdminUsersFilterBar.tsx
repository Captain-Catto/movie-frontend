import type { UserFilter } from "./types";

interface AdminUsersFilterBarProps {
  filter: UserFilter;
  onFilterChange: (filter: UserFilter) => void;
}

export default function AdminUsersFilterBar({
  filter,
  onFilterChange,
}: AdminUsersFilterBarProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-300">
          Filter by status to quickly review active and banned accounts.
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "banned"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onFilterChange(status)}
              className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
