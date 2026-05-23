import type { BanModalState } from "./types";

interface AdminUsersBanModalProps {
  banModal: BanModalState;
  banReason: string;
  onBanReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AdminUsersBanModal({
  banModal,
  banReason,
  onBanReasonChange,
  onCancel,
  onConfirm,
}: AdminUsersBanModalProps) {
  if (!banModal.open) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ban User</h3>
        <p className="text-gray-400 mb-4">
          Ban user &quot;{banModal.user?.name}&quot; ({banModal.user?.email})
        </p>
        <textarea
          value={banReason}
          onChange={(e) => onBanReasonChange(e.target.value)}
          aria-label="Reason for banning"
          placeholder="Enter reason for banning..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 min-h-24"
        />
        <div className="flex justify-end gap-x-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!banReason}
            className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ban User
          </button>
        </div>
      </div>
    </div>
  );
}
