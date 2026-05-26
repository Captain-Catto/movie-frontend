import { Eye } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ContentHoverPreview } from "@/components/admin/ContentHoverPreview";
import { ContentItem, TabKey } from "@/hooks/useAdminContent";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const TYPE_LABELS: Record<ContentItem["contentType"], string> = {
  movie: "Movie",
  tv_series: "TV Series",
};

const formatNumber = (value: number, fractionDigits = 0) => {
  if (Number.isNaN(value)) {
    return "0";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
};

export default function AdminContentTable({
  activeTab,
  isTrendingTab,
  contents,
  loading,
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  viewsLabel,
  clicksLabel,
  onOpenDetail,
  onOpenBlock,
  onUnblock,
  onPageChange,
}: {
  activeTab: TabKey;
  isTrendingTab: boolean;
  contents: ContentItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  viewsLabel: string;
  clicksLabel: string;
  onOpenDetail: (content: ContentItem) => void;
  onOpenBlock: (content: ContentItem) => void;
  onUnblock: (content: ContentItem) => void;
  onPageChange: (page: number) => void;
}) {
  const { isViewer } = useAuth();
  const { showWarning } = useToast();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                TMDB ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {viewsLabel}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {clicksLabel}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : contents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No content found
                </td>
              </tr>
            ) : (
              contents.map((content) => (
                <tr key={`${content.contentType}-${content.tmdbId}`}>
                  <td className="px-6 py-4">
                    <ContentHoverPreview
                      title={content.title}
                      posterUrl={content.posterUrl}
                      posterPath={content.posterPath}
                      voteAverage={content.voteAverage}
                      overview={content.overview}
                      contentType={content.contentType}
                    >
                      <div className="text-sm font-medium text-white cursor-pointer hover:text-red-400 transition-colors">
                        {content.title}
                      </div>
                    </ContentHoverPreview>
                    {isTrendingTab && (
                      <div className="mt-1 text-xs text-gray-400">
                        Rating:{" "}
                        {content.voteAverage ? formatNumber(content.voteAverage, 1) : "N/A"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white capitalize">
                      {TYPE_LABELS[content.contentType] || content.contentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {content.tmdbId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {isTrendingTab
                      ? formatNumber(content.viewCount, 1)
                      : formatNumber(content.viewCount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatNumber(content.clickCount)}
                  </td>
                  <td className="px-6 py-4">
                    {content.isBlocked ? (
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                          {activeTab === "trending" ? "Hidden" : "Blocked"}
                        </span>
                        {content.blockReason && (
                          <span className="text-xs text-gray-400 line-clamp-2">
                            {content.blockReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                        {activeTab === "trending" ? "Visible" : "Active"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(content)}
                        className="cursor-pointer px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                        title="View details"
                        aria-label="View details"
                      >
                        <Eye className="size-4" />
                      </button>
                      {content.isBlocked ? (
                        <button
                          type="button"
                          onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onUnblock(content); }}
                          className="cursor-pointer px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          {activeTab === "trending" ? "Unhide" : "Unblock"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onOpenBlock(content); }}
                          className="cursor-pointer px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          {activeTab === "trending" ? "Hide" : "Block"}
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

      {!loading && contents.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-700 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400">
            Showing {startItem}-{endItem} of {totalItems} items
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
