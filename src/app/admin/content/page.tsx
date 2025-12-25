"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";

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

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("movies");
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContentStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [blockModal, setBlockModal] = useState<{
    open: boolean;
    content: ContentItem | null;
  }>({ open: false, content: null });
  const [blockReason, setBlockReason] = useState("");
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
    }),
    []
  );

  const fetchMovies = useCallback(
    async (pageToLoad: number) => {
      if (!adminApi.isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: PAGE_SIZE.toString(),
          status: filter,
          contentType: CONTENT_TYPE_PARAM.movies,
        });

        if (appliedSearchTerm) {
          params.append("search", appliedSearchTerm);
        }

        const response = await adminApi.get<{ items: RawContentItem[]; total: number; totalPages: number; page: number }>(
          `/admin/content/list?${params.toString()}`
        );

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) => normalizeContent(item, "movie")
          );
          setContents(normalized);
          setTotalItems(response.data.total || 0);
          setTotalPages(Math.max(1, response.data.totalPages || 1));
          setPage(response.data.page || pageToLoad);
        } else {
          setContents([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setContents([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [PAGE_SIZE, appliedSearchTerm, filter, normalizeContent, adminApi]
  );

  const fetchTVSeries = useCallback(
    async (pageToLoad: number) => {
      if (!adminApi.isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: PAGE_SIZE.toString(),
          status: filter,
          contentType: CONTENT_TYPE_PARAM.tv,
        });

        if (appliedSearchTerm) {
          params.append("search", appliedSearchTerm);
        }

        const response = await adminApi.get<{ items: RawContentItem[]; total: number; totalPages: number; page: number }>(
          `/admin/content/list?${params.toString()}`
        );

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) => normalizeContent(item, "tv_series")
          );
          setContents(normalized);
          setTotalItems(response.data.total || 0);
          setTotalPages(Math.max(1, response.data.totalPages || 1));
          setPage(response.data.page || pageToLoad);
        } else {
          setContents([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching TV series:", error);
        setContents([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [PAGE_SIZE, appliedSearchTerm, filter, normalizeContent, adminApi]
  );

  const fetchTrending = useCallback(
    async (pageToLoad: number) => {
      if (!adminApi.isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
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
          setContents(normalized);
          setTotalItems(response.data.total || 0);
          setTotalPages(Math.max(1, response.data.totalPages || 1));
          setPage(response.data.page || pageToLoad);
        } else {
          setContents([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching trending content:", error);
        setContents([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
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
    setPage(1);
    setAppliedSearchTerm(searchTerm.trim());
  };

  const handleFilterChange = (status: ContentStatusFilter) => {
    setFilter(status);
    setPage(1);
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setPage(1);
    setContents([]);
    setTotalItems(0);
    setTotalPages(1);

    if (tab === "trending") {
      setFilter("all");
      setSearchTerm("");
      setAppliedSearchTerm("");
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
        setBlockModal({ open: false, content: null });
        setBlockReason("");
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
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Content Management</h1>
            <p className="text-gray-400 mt-1 max-w-2xl">{sectionDescription}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
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

        {/* Filters */}
        {!isTrendingTab ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex space-x-2">
              {(["all", "active", "blocked"] as ContentStatusFilter[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange(status)}
                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === status
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 md:w-80"
              />
              <button
                onClick={handleSearch}
                className="cursor-pointer px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
            Trending data is fetched from TMDB daily. Use the actions below to
            hide or re-enable specific items in the trending carousel.
          </div>
        )}

        {/* Content Table */}
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
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : contents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No content found
                    </td>
                  </tr>
                ) : (
                  contents.map((content) => (
                    <tr key={`${content.contentType}-${content.tmdbId}`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {content.title}
                        </div>
                        {isTrendingTab && (
                          <div className="mt-1 text-xs text-gray-400">
                            Rating:{" "}
                            {content.voteAverage
                              ? formatNumber(content.voteAverage, 1)
                              : "N/A"}
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
                        {content.isBlocked ? (
                          <button
                            onClick={() => handleUnblockContent(content)}
                            className="cursor-pointer px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            {activeTab === "trending" ? "Unhide" : "Unblock"}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBlockReason("");
                              setBlockModal({ open: true, content });
                            }}
                            className="cursor-pointer px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            {activeTab === "trending" ? "Hide" : "Block"}
                          </button>
                        )}
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
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  if (newPage !== page) {
                    setPage(newPage);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Block Modal */}
        {blockModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                {isTrendingTab ? "Hide Content" : "Block Content"}
              </h3>
              <p className="text-gray-400 mb-4">
                {isTrendingTab ? (
                  <>
                    Hide &ldquo;{blockModal.content?.title}&rdquo; from the
                    trending carousel.
                  </>
                ) : (
                  <>Block &ldquo;{blockModal.content?.title}&rdquo;.</>
                )}
              </p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={
                  isTrendingTab
                    ? "Enter reason for hiding..."
                    : "Enter reason for blocking..."
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 min-h-24"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setBlockModal({ open: false, content: null });
                    setBlockReason("");
                  }}
                  className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockContent}
                  disabled={!blockReason}
                  className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTrendingTab ? "Hide Content" : "Block Content"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
