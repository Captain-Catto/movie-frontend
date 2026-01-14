"use client";

interface AdminUser {
  name?: string;
  role?: string;
}

interface AdminTopBarProps {
  onMenuClick: () => void;
  user: AdminUser | null;
}

export default function AdminTopBar({ onMenuClick, user }: AdminTopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 z-50 shadow-lg">
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">
              Admin Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 shrink-0">
          <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="text-xs leading-tight">
            <p className="text-white font-medium">{user?.name || "Admin"}</p>
            <p className="text-gray-400 capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
