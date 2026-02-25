"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";

type UserRole = "user" | "admin" | "super_admin" | "viewer";

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  provider?: string;
  bannedReason?: string;
  totalWatchTime?: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  lastLoginCountry?: string | null;
}

interface UserLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "banned">("all");
  const [banModal, setBanModal] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [banReason, setBanReason] = useState("");
  const [editModal, setEditModal] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [editForm, setEditForm] = useState<{
    name: string;
    role: UserRole;
    password: string;
  }>({
    name: "",
    role: "user",
    password: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "logs">("info");
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToastRedux();

  const fetchUsers = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    setLoading(true);
    try {
      const response = await adminApi.get<{ items: User[] }>(
        `/admin/users/list?status=${filter}`
      );

      if (response.success && response.data) {
        setUsers(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, adminApi]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanUser = async () => {
    if (!banModal.user || !banReason) return;

    const userName = banModal.user.name || banModal.user.email;

    try {
      const response = await adminApi.post("/admin/users/ban", {
        userId: banModal.user.id,
        reason: banReason,
      });

      if (response.success) {
        setBanModal({ open: false, user: null });
        setBanReason("");
        fetchUsers();
        showSuccess("User banned", `User "${userName}" has been banned`);
      } else {
        showError("Ban failed", response.error || "Failed to ban user");
      }
    } catch (error) {
      console.error("Error banning user:", error);
      showError("Ban failed", error instanceof Error ? error.message : "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.name || user?.email || `User #${userId}`;

    try {
      const response = await adminApi.post(`/admin/users/unban/${userId}`);

      if (response.success) {
        fetchUsers();
        showSuccess("User unbanned", `User "${userName}" has been unbanned`);
      } else {
        showError("Unban failed", response.error || "Failed to unban user");
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      showError("Unban failed", error instanceof Error ? error.message : "Failed to unban user");
    }
  };

  const roleOptions: UserRole[] = ["user", "admin", "super_admin", "viewer"];

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  };

  const countryCodeToFlag = (code?: string | null) => {
    if (!code || code.length !== 2) return "🏳️";
    const upper = code.toUpperCase();
    return upper
      .split("")
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join("");
  };

  const countryCodeToName = (code?: string | null) => {
    if (!code) return "N/A";
    try {
      const formatter = new Intl.DisplayNames(["en"], { type: "region" });
      return formatter.of(code.toUpperCase()) || code.toUpperCase();
    } catch {
      return code.toUpperCase();
    }
  };

  const countryFlagUrl = (code?: string | null) => {
    if (!code || code.length !== 2) return null;
    return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
  };

  const renderSignupAccess = (user: User) => {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-600 text-white">
            Register
          </span>
          <span className="text-sm text-gray-200">
            {formatDateTime(user.createdAt)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-red-600 text-white">
            Login
          </span>
          <span className="text-sm text-gray-200">
            {formatDateTime(user.lastLoginAt)}
          </span>
        </div>
      </div>
    );
  };

  const fetchUserLogs = useCallback(async (userId: number) => {
    setLogsLoading(true);
    try {
      const response = await adminApi.get<{ logs: UserLog[] }>(
        `/admin/users/${userId}/logs`
      );
      if (response.success && response.data) {
        setUserLogs(response.data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching user logs:", error);
      setUserLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [adminApi]);

  const openEditModal = (user: User) => {
    setEditModal({ open: true, user });
    setEditForm({
      name: user.name || "",
      role: user.role,
      password: "",
    });
    setEditError("");
    setActiveTab("info");
    setUserLogs([]);
    setLogFilter("all");
  };

  const closeEditModal = () => {
    setEditModal({ open: false, user: null });
    setEditError("");
    setEditSaving(false);
    setActiveTab("info");
    setUserLogs([]);
  };

  const handleUpdateUser = async () => {
    if (!editModal.user) return;

    const userName = editModal.user.name || editModal.user.email;

    setEditSaving(true);
    setEditError("");

    try {
      const payload: {
        name?: string;
        role?: UserRole;
        password?: string;
      } = {};

      if (editForm.name.trim()) {
        payload.name = editForm.name.trim();
      }

      payload.role = editForm.role;

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const response = await adminApi.put<User>(
        `/admin/users/${editModal.user.id}`,
        payload
      );

      if (response.success && response.data) {
        const updatedUser = response.data as User;

        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === updatedUser.id ? { ...u, ...updatedUser } : u
          )
        );
        closeEditModal();
        fetchUsers();
        showSuccess("User updated", `User "${userName}" has been updated successfully`);
      } else {
        setEditError(response.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setEditError("Failed to update user");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">
            Manage users, ban or unban accounts
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-300">
              Filter by status to quickly review active and banned accounts.
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "banned"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
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

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sign Up / Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Device / IP
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="cursor-pointer ml-3 text-left"
                            title="Edit user"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-white hover:text-red-300 transition-colors">
                                {user.name || "No name"}
                              </div>
                              {user.provider && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-200 capitalize">
                                  {user.provider}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.email}
                            </div>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-600 text-white capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                            Active
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white mb-1 w-fit">
                              Banned
                            </span>
                            {user.bannedReason && (
                              <span className="text-xs text-gray-400">
                                {user.bannedReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {renderSignupAccess(user)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.lastLoginCountry ? (
                          <>
                            {countryFlagUrl(user.lastLoginCountry) ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={
                                  countryFlagUrl(
                                    user.lastLoginCountry
                                  ) as string
                                }
                                alt={countryCodeToName(user.lastLoginCountry)}
                                title={countryCodeToName(user.lastLoginCountry)}
                                className="w-6 h-4 rounded border border-gray-600"
                                onError={(e) => {
                                  // Hide broken image, fallback to emoji
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span
                                className="text-xl"
                                title={countryCodeToName(user.lastLoginCountry)}
                              >
                                {countryCodeToFlag(user.lastLoginCountry)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex flex-col space-y-1">
                          <span className="capitalize">
                            {user.lastLoginDevice || "N/A"}
                          </span>
                          {user.lastLoginIp && (
                            <span className="text-xs text-gray-400">
                              IP: {user.lastLoginIp}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            Chi tiết
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => setBanModal({ open: true, user })}
                              className="cursor-pointer px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="cursor-pointer px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                            >
                              Unban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editModal.open && editModal.user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">User Details</h3>
                  <p className="text-gray-400 text-sm">
                    {editModal.user.email}
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                    activeTab === "info"
                      ? "text-white border-b-2 border-red-600"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  User Info
                </button>
                <button
                  onClick={() => {
                    setActiveTab("logs");
                    if (userLogs.length === 0 && !logsLoading && editModal.user) {
                      fetchUserLogs(editModal.user.id);
                    }
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

              {/* Tab Content: User Info */}
              {activeTab === "info" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Display name
                      </label>
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Display name"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Email (read-only)
                      </label>
                      <div className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
                        {editModal.user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Role
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            role: e.target.value as UserRole,
                          }))
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        {roleOptions.map((role) => (
                          <option
                            key={role}
                            value={role}
                            className="bg-gray-800 text-white"
                          >
                            {role.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Status
                      </label>
                      <div className="flex flex-col space-y-1">
                        {editModal.user.isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white w-fit">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white w-fit">
                            Banned
                          </span>
                        )}
                        {editModal.user.bannedReason && (
                          <span className="text-xs text-gray-400">
                            {editModal.user.bannedReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        New password
                      </label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Leave blank to keep current password"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Admins cannot change email. Set a new password only if
                        needed (min 6 characters).
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-2">
                      Last login details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white">
                      <div>
                        <div className="text-gray-400 text-xs">Last seen</div>
                        <div>{formatDateTime(editModal.user.lastLoginAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">IP</div>
                        <div>{editModal.user.lastLoginIp || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Device</div>
                        <div className="capitalize">
                          {editModal.user.lastLoginDevice || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {editError && (
                    <div className="mt-3 text-sm text-red-400">{editError}</div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={closeEditModal}
                      className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateUser}
                      disabled={editSaving}
                      className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editSaving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </>
              )}

              {/* Tab Content: Activity Logs */}
              {activeTab === "logs" && (
                <>
                  {/* Filter */}
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      User activity history including logins, actions, and events
                    </p>
                    <select
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
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

                  {/* Logs List */}
                  <div className="bg-gray-700/30 rounded-lg border border-gray-600 max-h-96 overflow-y-auto">
                    {logsLoading ? (
                      <div className="p-8 text-center text-gray-400">
                        Loading logs...
                      </div>
                    ) : userLogs.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        No activity logs found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-600">
                        {userLogs
                          .filter((log) =>
                            logFilter === "all" || log.action.toLowerCase().includes(logFilter.toLowerCase())
                          )
                          .map((log) => (
                            <div key={log.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-medium text-white">
                                      {log.action}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatDateTime(log.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300">
                                    {log.description}
                                  </p>
                                  {log.ipAddress && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      IP: {log.ipAddress}
                                    </p>
                                  )}
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
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={closeEditModal}
                      className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Ban Modal */}
        {banModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Ban User</h3>
              <p className="text-gray-400 mb-4">
                Ban user &quot;{banModal.user?.name}&quot; (
                {banModal.user?.email})
              </p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 min-h-24"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setBanModal({ open: false, user: null });
                    setBanReason("");
                  }}
                  className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={!banReason}
                  className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
