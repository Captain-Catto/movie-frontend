"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { Eye } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";
import { ContentDetailModal } from "@/components/admin/ContentDetailModal";
import { ContentHoverPreview } from "@/components/admin/ContentHoverPreview";

type TabKey = "movies" | "tv" | "trending";
type ContentStatusFilter = "all" | "active" | "blocked";

interface ContentItem {
  tmdbId: number;
  title: string;
  contentType: "movie" | "tv_series";
  viewCount: number;
  clickCount: number;
  isBlocked: boolean;
  blockReason?: string;
  posterPath?: string;
  posterUrl?: string;
  voteAverage?: number;
  popularity?: number;
  mediaType?: "movie" | "tv";
  overview?: string;
}

interface RawContentItem {
  tmdbId: number | string;
  title: string;
  viewCount?: number | string;
  clickCount?: number | string;
  voteCount?: number | string;
  isBlocked?: boolean;
   isHidden?: boolean;
  blockReason?: string | null;
   hiddenReason?: string | null;
  posterPath?: string | null;
  posterUrl?: string | null;
  voteAverage?: number | string | null;
  popularity?: number | string | null;
  mediaType?: string | null;
  contentType?: string | null;
  overview?: string | null;
}

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: "movies", label: "Movie Management" },
  { key: "tv", label: "TV Show Management" },
  { key: "trending", label: "Trending" },
];

const CONTENT_TYPE_PARAM: Record<Exclude<TabKey, "trending">, "movie" | "tv_series"> =
  {
    movies: "movie",
    tv: "tv_series",
  };

const TYPE_LABELS: Record<ContentItem["contentType"], string> = {
  movie: "Movie",
  tv_series: "TV Series",
};

const TAB_DESCRIPTIONS: Record<TabKey, string> = {
  movies:
    "Review catalog movies, track performance and quickly block titles that should not be shown.",
  tv: "Manage TV series availability and visibility across the platform.",
  trending:
    "Keep the trending carousel clean by hiding titles you do not want users to see.",
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

function AdminContentHeader({
  activeTab,
  sectionDescription,
  onTabChange,
}: {
  activeTab: TabKey;
  sectionDescription: string;
  onTabChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-white">Content Management</h1>
        <p className="text-gray-400 mt-1 max-w-2xl">{sectionDescription}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminContentFilters({
  isTrendingTab,
  filter,
  searchTerm,
  onFilterChange,
  onSearchTermChange,
  onSearch,
}: {
  isTrendingTab: boolean;
  filter: ContentStatusFilter;
  searchTerm: string;
  onFilterChange: (status: ContentStatusFilter) => void;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="min-h-[88px] md:min-h-[44px]">
      {!isTrendingTab ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-x-2">
            {(["all", "active", "blocked"] as ContentStatusFilter[]).map((status) => (
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

          <div className="flex w-full items-center gap-2 md:w-auto">
            <input
              type="text"
              placeholder="Search content..."
              aria-label="Search content"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 md:w-80"
            />
            <button
              type="button"
              onClick={onSearch}
              className="cursor-pointer px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
          Trending data is fetched from TMDB daily. Use the actions below to hide
          or re-enable specific items in the trending carousel.
        </div>
      )}
    </div>
  );
}

function AdminContentTable({
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
                          onClick={() => onUnblock(content)}
                          className="cursor-pointer px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          {activeTab === "trending" ? "Unhide" : "Unblock"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenBlock(content)}
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

function AdminContentBlockModal({
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

export default function AdminContentPage() {
  type PageState = {
    activeTab: TabKey;
    contents: ContentItem[];
    loading: boolean;
    filter: ContentStatusFilter;
    searchTerm: string;
    page: number;
    totalPages: number;
    totalItems: number;
    blockModal: { open: boolean; content: ContentItem | null };
    blockReason: string;
    detailModal: { open: boolean; tmdbId: number; contentType: "movie" | "tv" };
  };
  const [state, dispatch] = useReducer(
    (s: PageState, a: Partial<PageState>): PageState => ({ ...s, ...a }),
    {
      activeTab: "movies",
      contents: [],
      loading: true,
      filter: "all",
      searchTerm: "",
      page: 1,
      totalPages: 1,
      totalItems: 0,
      blockModal: { open: false, content: null },
      blockReason: "",
      detailModal: { open: false, tmdbId: 0, contentType: "movie" },
    }
  );
  const { activeTab, contents, loading, filter, searchTerm, page, totalPages, totalItems, blockModal, blockReason, detailModal } = state;
  const appliedSearchTermRef = useRef("");
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToastRedux();

  const PAGE_SIZE = 20;

  const isTrendingTab = activeTab === "trending";

  const startItem =
    totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem =
    totalItems === 0
      ? 0
      : Math.min(startItem + contents.length - 1, totalItems);

  const viewsLabel = isTrendingTab ? "Popularity" : "Views";
  const clicksLabel = isTrendingTab ? "Votes" : "Clicks";

  const normalizeContent = useCallback(
    (item: RawContentItem, mediaType: "movie" | "tv_series"): ContentItem => ({
      tmdbId: Number(item.tmdbId),
      title: item.title,
      contentType: mediaType,
      viewCount: Number(item.viewCount ?? item.popularity ?? 0),
      clickCount: Number(item.clickCount ?? item.voteCount ?? 0),
      isBlocked: Boolean(
        item.isBlocked ?? item.isHidden ?? false
      ),
      blockReason: item.blockReason ?? item.hiddenReason ?? undefined,
      posterPath: item.posterPath ?? undefined,
      posterUrl: item.posterUrl ?? item.posterPath ?? undefined,
      voteAverage:
        item.voteAverage !== undefined && item.voteAverage !== null
          ? Number(item.voteAverage)
          : undefined,
      popularity:
        item.popularity !== undefined && item.popularity !== null
          ? Number(item.popularity)
          : undefined,
      mediaType: mediaType === "movie" ? "movie" : "tv",
      overview: item.overview ?? undefined,
    }),
    []
  );

  const fetchMovies = useCallback(
    async (pageToLoad: number) => {
      if (!adminApi.isAuthenticated) {
        dispatch({ loading: false });
        return;
      }
      dispatch({ loading: true });
      try {
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: PAGE_SIZE.toString(),
          status: filter,
          contentType: CONTENT_TYPE_PARAM.movies,
        });

        if (appliedSearchTermRef.current) {
          params.append("search", appliedSearchTermRef.current);
        }

        const response = await adminApi.get<{ items: RawContentItem[]; total: number; totalPages: number; page: number }>(
          `/admin/content/list?${params.toString()}`
        );

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) => normalizeContent(item, "movie")
          );
          dispatch({ contents: normalized, totalItems: response.data.total || 0, totalPages: Math.max(1, response.data.totalPages || 1), page: response.data.page || pageToLoad });
        } else {
          dispatch({ contents: [], totalItems: 0, totalPages: 1 });
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        dispatch({ contents: [], totalItems: 0, totalPages: 1 });
      } finally {
        dispatch({ loading: false });
      }
    },
    [PAGE_SIZE, filter, normalizeContent, adminApi]
  );

  const fetchTVSeries = useCallback(
    async (pageToLoad: number) => {
      if (!adminApi.isAuthenticated) {
        dispatch({ loading: false });
        return;
      }
      dispatch({ loading: true });
      try {
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: PAGE_SIZE.toString(),
          status: filter,
          contentType: CONTENT_TYPE_PARAM.tv,
        });

        if (appliedSearchTermRef.current) {
          params.append("search", appliedSearchTermRef.current);
        }

        const response = await adminApi.get<{ items: RawContentItem[]; total: number; totalPages: number; page: number }>(
          `/admin/content/list?${params.toString()}`
        );

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) => normalizeContent(item, "tv_series")
          );
          dispatch({ contents: normalized, totalItems: response.data.total || 0, totalPages: Math.max(1, response.data.totalPages || 1), page: response.data.page || pageToLoad });
        } else {
          dispatch({ contents: [], totalItems: 0, totalPages: 1 });
        }
      } catch (error) {
        console.error("Error fetching TV series:", error);
        dispatch({ contents: [], totalItems: 0, totalPages: 1 });
      } finally {
        dispatch({ loading: false });
      }
    },
    [PAGE_SIZE, filter, normalizeContent, adminApi]
  );

  const fetchTrending = useCallback(
    async (pageToLoad: number) => {
      if (!adminApi.isAuthenticated) {
        dispatch({ loading: false });
        return;
      }
      dispatch({ loading: true });
      try {
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: PAGE_SIZE.toString(),
        });

        const response = await adminApi.get<{ items: RawContentItem[]; total: number; totalPages: number; page: number }>(
          `/admin/content/trending?${params.toString()}`
        );

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) =>
              normalizeContent(
                item,
                item.contentType === "tv_series" ? "tv_series" : "movie"
              )
          );
          dispatch({ contents: normalized, totalItems: response.data.total || 0, totalPages: Math.max(1, response.data.totalPages || 1), page: response.data.page || pageToLoad });
        } else {
          dispatch({ contents: [], totalItems: 0, totalPages: 1 });
        }
      } catch (error) {
        console.error("Error fetching trending content:", error);
        dispatch({ contents: [], totalItems: 0, totalPages: 1 });
      } finally {
        dispatch({ loading: false });
      }
    },
    [PAGE_SIZE, normalizeContent, adminApi]
  );

  const refreshCurrentTab = useCallback(() => {
    if (activeTab === "movies") {
      fetchMovies(page);
    } else if (activeTab === "tv") {
      fetchTVSeries(page);
    } else {
      fetchTrending(page);
    }
  }, [activeTab, fetchMovies, fetchTVSeries, fetchTrending, page]);

  useEffect(() => {
    if (activeTab === "movies") {
      fetchMovies(page);
    } else if (activeTab === "tv") {
      fetchTVSeries(page);
    } else {
      fetchTrending(page);
    }
  }, [activeTab, page, fetchMovies, fetchTVSeries, fetchTrending]);

  const handleSearch = () => {
    if (isTrendingTab) {
      return;
    }
    dispatch({ page: 1 });
    appliedSearchTermRef.current = searchTerm.trim();
  };

  const handleFilterChange = (status: ContentStatusFilter) => {
    dispatch({ filter: status });
    dispatch({ page: 1 });
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;

    dispatch({ activeTab: tab });
    dispatch({ page: 1 });
    dispatch({ contents: [], totalItems: 0, totalPages: 1 });

    if (tab === "trending") {
      dispatch({ filter: "all" });
      dispatch({ searchTerm: "" });
      appliedSearchTermRef.current = "";
    }
  };

  const handleBlockContent = async () => {
    if (!blockModal.content || !blockReason) return;

    const title = blockModal.content.title;

    try {
      const endpoint = isTrendingTab
        ? "/admin/content/trending/block"
        : "/admin/content/block";
      const payload = isTrendingTab
        ? {
            tmdbId: blockModal.content.tmdbId,
            mediaType:
              blockModal.content.mediaType ||
              (blockModal.content.contentType === "tv_series" ? "tv" : "movie"),
            reason: blockReason,
          }
        : {
            contentId: blockModal.content.tmdbId.toString(),
            contentType: blockModal.content.contentType,
            reason: blockReason,
          };

      const response = await adminApi.post(endpoint, payload);

      if (response.success) {
        dispatch({ blockModal: { open: false, content: null } });
        dispatch({ blockReason: "" });
        refreshCurrentTab();
        showSuccess(
          isTrendingTab ? "Hidden" : "Blocked",
          `Content "${title}" has been ${isTrendingTab ? "hidden" : "blocked"}`
        );
      } else {
        showError(
          isTrendingTab ? "Hide failed" : "Block failed",
          response.error || `Failed to ${isTrendingTab ? "hide" : "block"} content`
        );
      }
    } catch (error) {
      console.error("Error blocking content:", error);
      showError(
        isTrendingTab ? "Hide failed" : "Block failed",
        error instanceof Error ? error.message : `Failed to ${isTrendingTab ? "hide" : "block"} content`
      );
    }
  };

  const handleUnblockContent = async (content: ContentItem) => {
    const title = content.title;

    try {
      const endpoint = isTrendingTab
        ? "/admin/content/trending/unblock"
        : "/admin/content/unblock";
      const payload = isTrendingTab
        ? {
            tmdbId: content.tmdbId,
            mediaType:
              content.mediaType ||
              (content.contentType === "tv_series" ? "tv" : "movie"),
          }
        : {
            contentId: content.tmdbId.toString(),
            contentType: content.contentType,
          };

      const response = await adminApi.post(endpoint, payload);

      if (response.success) {
        refreshCurrentTab();
        showSuccess(
          isTrendingTab ? "Shown" : "Unblocked",
          `Content "${title}" has been ${isTrendingTab ? "unhidden" : "unblocked"}`
        );
      } else {
        showError(
          isTrendingTab ? "Unhide failed" : "Unblock failed",
          response.error || `Failed to ${isTrendingTab ? "unhide" : "unblock"} content`
        );
      }
    } catch (error) {
      console.error("Error unblocking content:", error);
      showError(
        isTrendingTab ? "Unhide failed" : "Unblock failed",
        error instanceof Error ? error.message : `Failed to ${isTrendingTab ? "unhide" : "unblock"} content`
      );
    }
  };

  const sectionDescription = useMemo(
    () => TAB_DESCRIPTIONS[activeTab],
    [activeTab]
  );

  return (
    <div className="gap-y-6">
      <AdminContentHeader
        activeTab={activeTab}
        sectionDescription={sectionDescription}
        onTabChange={handleTabChange}
      />
      <AdminContentFilters
        isTrendingTab={isTrendingTab}
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchTermChange={(value) => dispatch({ searchTerm: value })}
        onSearch={handleSearch}
      />
      <AdminContentTable
        activeTab={activeTab}
        isTrendingTab={isTrendingTab}
        contents={contents}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        viewsLabel={viewsLabel}
        clicksLabel={clicksLabel}
        onOpenDetail={(content) =>
          dispatch({
            detailModal: {
              open: true,
              tmdbId: content.tmdbId,
              contentType: content.contentType === "tv_series" ? "tv" : "movie",
            },
          })
        }
        onOpenBlock={(content) => {
          dispatch({ blockReason: "" });
          dispatch({ blockModal: { open: true, content } });
        }}
        onUnblock={handleUnblockContent}
        onPageChange={(newPage) => {
          if (newPage !== page) {
            dispatch({ page: newPage });
          }
        }}
      />

      <ContentDetailModal
        open={detailModal.open}
        onClose={() =>
          dispatch({ detailModal: { open: false, tmdbId: 0, contentType: "movie" } })
        }
        tmdbId={detailModal.tmdbId}
        contentType={detailModal.contentType}
      />

      <AdminContentBlockModal
        open={blockModal.open}
        title={blockModal.content?.title}
        reason={blockReason}
        isTrendingTab={isTrendingTab}
        onReasonChange={(value) => dispatch({ blockReason: value })}
        onCancel={() => {
          dispatch({ blockModal: { open: false, content: null } });
          dispatch({ blockReason: "" });
        }}
        onConfirm={handleBlockContent}
      />
    </div>
  );
}


