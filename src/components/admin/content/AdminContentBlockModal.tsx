export default function AdminContentBlockModal({
  open,
  title,
  reason,
  isTrendingTab,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  reason: string;
  isTrendingTab: boolean;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          {isTrendingTab ? "Hide Content" : "Block Content"}
        </h3>
        <p className="text-gray-400 mb-4">
          {isTrendingTab ? (
            <>Hide &ldquo;{title}&rdquo; from the trending carousel.</>
          ) : (
            <>Block &ldquo;{title}&rdquo;.</>
          )}
        </p>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          aria-label={isTrendingTab ? "Reason for hiding" : "Reason for blocking"}
          placeholder={
            isTrendingTab ? "Enter reason for hiding..." : "Enter reason for blocking..."
          }
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
            disabled={!reason}
            className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTrendingTab ? "Hide Content" : "Block Content"}
          </button>
        </div>
      </div>
    </div>
  );
}
