import type { User, EditFormState, UserRole } from "./types";
import { formatDateTime } from "./utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface AdminUserInfoTabProps {
  user: User;
  editForm: EditFormState;
  roleOptions: UserRole[];
  editError: string;
  editSaving: boolean;
  onEditFormChange: (patch: Partial<EditFormState>) => void;
  onClose: () => void;
  onUpdateUser: () => void;
}

export default function AdminUserInfoTab({
  user,
  editForm,
  roleOptions,
  editError,
  editSaving,
  onEditFormChange,
  onClose,
  onUpdateUser,
}: AdminUserInfoTabProps) {
  const { isViewer } = useAuth();
  const { showWarning } = useToast();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="admin-user-display-name" className="block text-sm text-gray-400 mb-1">
            Display name
          </label>
          <input
            id="admin-user-display-name"
            aria-label="Admin user display name"
            value={editForm.name}
            onChange={(e) => onEditFormChange({ name: e.target.value })}
            placeholder="Display name"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <div>
          <label htmlFor="admin-user-email" className="block text-sm text-gray-400 mb-1">
            Email (read-only)
          </label>
          <input
            id="admin-user-email"
            aria-label="Admin user email"
            value={user.email}
            readOnly
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
          />
        </div>
        <div>
          <label htmlFor="admin-user-role" className="block text-sm text-gray-400 mb-1">
            Role
          </label>
          <select
            id="admin-user-role"
            aria-label="Admin user role"
            value={editForm.role}
            onChange={(e) => onEditFormChange({ role: e.target.value as UserRole })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role} className="bg-gray-800 text-white">
                {role.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="block text-sm text-gray-400 mb-1">Status</div>
          <div className="flex flex-col gap-y-1">
            {user.isActive ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white w-fit">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white w-fit">
                Banned
              </span>
            )}
            {user.bannedReason && (
              <span className="text-xs text-gray-400">{user.bannedReason}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="admin-user-new-password" className="block text-sm text-gray-400 mb-1">
            New password
          </label>
          <input
            id="admin-user-new-password"
            type="password"
            aria-label="Admin user new password"
            value={editForm.password}
            onChange={(e) => onEditFormChange({ password: e.target.value })}
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            Admins cannot change email. Set a new password only if needed (min 6 characters).
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
        <div className="text-sm text-gray-400 mb-2">Last login details</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white">
          <div>
            <div className="text-gray-400 text-xs">Last seen</div>
            <div>{formatDateTime(user.lastLoginAt)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">IP</div>
            <div>{user.lastLoginIp || "N/A"}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Device</div>
            <div className="capitalize">{user.lastLoginDevice || "N/A"}</div>
          </div>
        </div>
      </div>

      {editError && <div className="mt-3 text-sm text-red-400">{editError}</div>}

      <div className="flex justify-end gap-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onUpdateUser(); }}
          disabled={editSaving}
          className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  );
}
