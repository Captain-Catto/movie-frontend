"use client";

interface AdminTopBarProps {
  onMenuClick: () => void;
  user: any;
}

export default function AdminTopBar({ onMenuClick, user }: AdminTopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-700">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{user?.name || "Admin"}</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role || "admin"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
