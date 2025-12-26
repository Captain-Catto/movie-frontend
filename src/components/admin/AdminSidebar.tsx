"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ChevronDown, LogOut, User } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  user?: {
    id?: number | null;
    name?: string | null;
    role?: string | null;
    email?: string | null;
  } | null;
}

export default function AdminSidebar({ isOpen, user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const adminApi = useAdminApi();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    password: "",
  });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setProfileForm({ name: user?.name ?? "", password: "" });
  }, [user?.name]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuOpen) return;
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: (
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
            d="M9.75 3a1.5 1.5 0 00-1.48 1.23l-.26 1.3a1.5 1.5 0 01-1.02 1.14l-1.24.41a1.5 1.5 0 00-.92 1.9l.45 1.23a1.5 1.5 0 010 1l-.45 1.23a1.5 1.5 0 00.92 1.9l1.24.41a1.5 1.5 0 011.02 1.14l.26 1.3A1.5 1.5 0 009.75 21h4.5a1.5 1.5 0 001.48-1.23l.26-1.3a1.5 1.5 0 011.02-1.14l1.24-.41a1.5 1.5 0 00.92-1.9l-.45-1.23a1.5 1.5 0 010-1l.45-1.23a1.5 1.5 0 00-.92-1.9l-1.24-.41a1.5 1.5 0 01-1.02-1.14l-.26-1.3A1.5 1.5 0 0014.25 3h-4.5z"
          />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      title: "Content",
      href: "/admin/content",
      icon: (
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
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
      ),
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: (
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      title: "SEO",
      href: "/admin/seo",
      icon: (
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      title: "Sync Data",
      href: "/admin/sync-data",
      icon: (
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <div className="p-4 border-b border-gray-800 bg-gray-900 relative">
        <button
          ref={menuButtonRef}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 text-left "
        >
          <div className="w-12 h-12 rounded-full bg-red-600 text-white font-bold flex items-center justify-center cursor-pointer">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1  cursor-pointer">
            <p className="text-white font-semibold truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role || "admin"}
            </p>
            {user?.email && (
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform  cursor-pointer ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute left-4 right-4 mt-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 divide-y divide-gray-700"
          >
            <button
              onClick={() => {
                setProfileOpen(true);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-200 hover:bg-red-600/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-800 bg-gray-900">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Back to Site</span>
        </Link>
      </div>

      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => {
            setProfileOpen(false);
            setProfileForm({ name: user?.name ?? "", password: "" });
            setProfileError("");
          }}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <p className="text-sm text-gray-400">
                  Update your information
                </p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close profile modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Display name
                </label>
                <input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Email
                </label>
                <div className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                  {user?.email || "No email"}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="••••••••"
                />
              </div>

              {profileError && (
                <div className="text-sm text-red-400">{profileError}</div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setProfileForm({ name: user?.name ?? "", password: "" });
                  setProfileError("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!user?.id) {
                    setProfileError("User information not found");
                    return;
                  }

                  setProfileSaving(true);
                  setProfileError("");
                  try {
                    const payload: { name?: string; password?: string } = {};
                    if (profileForm.name.trim()) {
                      payload.name = profileForm.name.trim();
                    }
                    if (profileForm.password.trim()) {
                      payload.password = profileForm.password.trim();
                    }

                    const res = await adminApi.put(
                      `/admin/users/${user.id}`,
                      payload
                    );
                    if (!res.success) {
                      setProfileError(res.error || "Update failed");
                      return;
                    }
                    setProfileOpen(false);
                    setProfileForm({
                      name: payload.name ?? user.name ?? "",
                      password: "",
                    });
                  } catch (err) {
                    console.error("Update profile error:", err);
                    setProfileError("Unable to update");
                  } finally {
                    setProfileSaving(false);
                  }
                }}
                disabled={profileSaving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {profileSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
