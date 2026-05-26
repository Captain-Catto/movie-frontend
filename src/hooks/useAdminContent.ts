import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";

export type TabKey = "movies" | "tv" | "trending";
export type ContentStatusFilter = "all" | "active" | "blocked";

export interface ContentItem {
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

export interface RawContentItem {
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

export const TAB_DESCRIPTIONS: Record<TabKey, string> = {
  movies:
    "Review catalog movies, track performance and quickly block titles that should not be shown.",
  tv: "Manage TV series availability and visibility across the platform.",
  trending:
    "Keep the trending carousel clean by hiding titles you do not want users to see.",
};

const CONTENT_TYPE_PARAM: Record<Exclude<TabKey, "trending">, "movie" | "tv_series"> = {
  movies: "movie",
  tv: "tv_series",
};

const PAGE_SIZE = 20;

const toTmdbPosterUrl = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `https://image.tmdb.org/t/p/w342${value}`;
  return value;
};

export function useAdminContent() {
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

  const {
    activeTab,
    contents,
    loading,
    filter,
    searchTerm,
    page,
    totalPages,
    totalItems,
    blockModal,
    blockReason,
    detailModal,
  } = state;

  const appliedSearchTermRef = useRef("");
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToast();

  const isTrendingTab = activeTab === "trending";

  const startItem = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(startItem + contents.length - 1, totalItems);

  const viewsLabel = isTrendingTab ? "Popularity" : "Views";
  const clicksLabel = isTrendingTab ? "Votes" : "Clicks";

  const normalizeContent = useCallback(
    (item: RawContentItem, mediaType: "movie" | "tv_series"): ContentItem => ({
      tmdbId: Number(item.tmdbId),
      title: item.title,
      contentType: mediaType,
      viewCount: Number(item.viewCount ?? item.popularity ?? 0),
      clickCount: Number(item.clickCount ?? item.voteCount ?? 0),
      isBlocked: Boolean(item.isBlocked ?? item.isHidden ?? false),
      blockReason: item.blockReason ?? item.hiddenReason ?? undefined,
      posterPath: item.posterPath ?? undefined,
      posterUrl: toTmdbPosterUrl(item.posterUrl) ?? toTmdbPosterUrl(item.posterPath),
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

        const response = await adminApi.get<{
          items: RawContentItem[];
          total: number;
          totalPages: number;
          page: number;
        }>(`/admin/content/list?${params.toString()}`);

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) => normalizeContent(item, "movie")
          );
          dispatch({
            contents: normalized,
            totalItems: response.data.total || 0,
            totalPages: Math.max(1, response.data.totalPages || 1),
            page: response.data.page || pageToLoad,
          });
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
    [filter, normalizeContent, adminApi]
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

        const response = await adminApi.get<{
          items: RawContentItem[];
          total: number;
          totalPages: number;
          page: number;
        }>(`/admin/content/list?${params.toString()}`);

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) => normalizeContent(item, "tv_series")
          );
          dispatch({
            contents: normalized,
            totalItems: response.data.total || 0,
            totalPages: Math.max(1, response.data.totalPages || 1),
            page: response.data.page || pageToLoad,
          });
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
    [filter, normalizeContent, adminApi]
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

        const response = await adminApi.get<{
          items: RawContentItem[];
          total: number;
          totalPages: number;
          page: number;
        }>(`/admin/content/trending?${params.toString()}`);

        if (response.success && response.data) {
          const normalized: ContentItem[] = (response.data.items || []).map(
            (item: RawContentItem) =>
              normalizeContent(item, item.contentType === "tv_series" ? "tv_series" : "movie")
          );
          dispatch({
            contents: normalized,
            totalItems: response.data.total || 0,
            totalPages: Math.max(1, response.data.totalPages || 1),
            page: response.data.page || pageToLoad,
          });
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
    [normalizeContent, adminApi]
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
    appliedSearchTermRef.current = searchTerm.trim();

    if (page !== 1) {
      dispatch({ page: 1 });
      return;
    }

    if (activeTab === "movies") {
      fetchMovies(1);
    } else if (activeTab === "tv") {
      fetchTVSeries(1);
    }
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
      const endpoint = isTrendingTab ? "/admin/content/trending/block" : "/admin/content/block";
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
      const endpoint = isTrendingTab ? "/admin/content/trending/unblock" : "/admin/content/unblock";
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

  const sectionDescription = useMemo(() => TAB_DESCRIPTIONS[activeTab], [activeTab]);

  return {
    activeTab,
    contents,
    loading,
    filter,
    searchTerm,
    page,
    totalPages,
    totalItems,
    blockModal,
    blockReason,
    detailModal,
    isTrendingTab,
    startItem,
    endItem,
    viewsLabel,
    clicksLabel,
    sectionDescription,
    dispatch,
    handleSearch,
    handleFilterChange,
    handleTabChange,
    handleBlockContent,
    handleUnblockContent,
    refreshCurrentTab,
    fetchMovies,
    fetchTVSeries,
    fetchTrending,
  };
}
