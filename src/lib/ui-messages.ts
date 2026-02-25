import type { BrowseFetchType } from "@/lib/page-data.types";

export type UiLocale = "vi" | "en";

export interface CommonUiMessages {
  loading: string;
  errorPrefix: string;
  retry: string;
  previous: string;
  next: string;
  page: string;
  viewMore: string;
  showAll: string;
  unreadOnly: string;
  saveChanges: string;
  saving: string;
  cancel: string;
  notAvailable: string;
  unknown: string;
}

const COMMON_MESSAGES: Record<UiLocale, CommonUiMessages> = {
  vi: {
    loading: "Đang tải...",
    errorPrefix: "Lỗi:",
    retry: "Thử lại",
    previous: "Trước",
    next: "Tiếp",
    page: "Trang",
    viewMore: "Xem thêm",
    showAll: "Hiện tất cả",
    unreadOnly: "Chỉ chưa đọc",
    saveChanges: "Lưu thay đổi",
    saving: "Đang lưu...",
    cancel: "Hủy",
    notAvailable: "Không có",
    unknown: "Không rõ",
  },
  en: {
    loading: "Loading...",
    errorPrefix: "Error:",
    retry: "Retry",
    previous: "Previous",
    next: "Next",
    page: "Page",
    viewMore: "View More",
    showAll: "Show all",
    unreadOnly: "Unread only",
    saveChanges: "Save changes",
    saving: "Saving...",
    cancel: "Cancel",
    notAvailable: "N/A",
    unknown: "Unknown",
  },
};

export const resolveUiLocale = (language: string | undefined): UiLocale =>
  language?.toLowerCase().startsWith("vi") ? "vi" : "en";

export const getCommonUiMessages = (language: string | undefined): CommonUiMessages =>
  COMMON_MESSAGES[resolveUiLocale(language)];

export interface MovieDetailUiMessages {
  unknown: string;
  unknownTitle: string;
  loadingContent: string;
  errorPrefix: string;
  watchNow: string;
  overview: string;
  cast: string;
  contentInfo: string;
  director: string;
  country: string;
  releaseYear: string;
  runtime: string;
  runtimeEpisode: string;
  quality: string;
  language: string;
  status: string;
  youMightAlsoLike: string;
  notAvailable: string;
}

const MOVIE_DETAIL_MESSAGES: Record<UiLocale, MovieDetailUiMessages> = {
  vi: {
    unknown: "Không rõ",
    unknownTitle: "Không rõ tiêu đề",
    loadingContent: "Không thể tải nội dung.",
    errorPrefix: "Lỗi:",
    watchNow: "Xem ngay",
    overview: "Tổng quan",
    cast: "Diễn viên",
    contentInfo: "Thông tin phim",
    director: "Đạo diễn:",
    country: "Quốc gia:",
    releaseYear: "Năm phát hành:",
    runtime: "Thời lượng:",
    runtimeEpisode: "Thời lượng/tập:",
    quality: "Chất lượng:",
    language: "Ngôn ngữ:",
    status: "Trạng thái:",
    youMightAlsoLike: "Có thể bạn cũng thích",
    notAvailable: "Không có",
  },
  en: {
    unknown: "Unknown",
    unknownTitle: "Unknown Title",
    loadingContent: "Unable to load content.",
    errorPrefix: "Error:",
    watchNow: "Watch Now",
    overview: "Overview",
    cast: "Cast",
    contentInfo: "Movie Info",
    director: "Director:",
    country: "Country:",
    releaseYear: "Release Year:",
    runtime: "Runtime:",
    runtimeEpisode: "Runtime/Episode:",
    quality: "Quality:",
    language: "Language:",
    status: "Status:",
    youMightAlsoLike: "You Might Also Like",
    notAvailable: "N/A",
  },
};

export interface TVDetailUiMessages {
  seriesInfo: string;
  createdBy: string;
  cast: string;
  country: string;
  firstAirDate: string;
  lastAirDate: string;
  seasons: string;
  episodes: string;
  runtimePerEpisode: string;
  language: string;
  status: string;
  loading: string;
  unknown: string;
  notAvailable: string;
  unableToLoad: string;
  tvSeriesTag: string;
  watchSeries: string;
  overview: string;
  readMore: string;
  showLess: string;
  noDescription: string;
  youMayAlsoLike: string;
  minutesPerEpisode: string;
}

const TV_DETAIL_MESSAGES: Record<UiLocale, TVDetailUiMessages> = {
  vi: {
    seriesInfo: "Thông Tin Series",
    createdBy: "Tạo bởi:",
    cast: "Diễn viên:",
    country: "Quốc gia:",
    firstAirDate: "Ngày phát sóng đầu:",
    lastAirDate: "Ngày phát sóng cuối:",
    seasons: "Số mùa:",
    episodes: "Số tập:",
    runtimePerEpisode: "Thời lượng/tập:",
    language: "Ngôn ngữ:",
    status: "Trạng thái:",
    loading: "Đang tải...",
    unknown: "Không rõ",
    notAvailable: "Không có",
    unableToLoad: "Không thể tải chi tiết phim bộ.",
    tvSeriesTag: "Phim bộ",
    watchSeries: "Xem phim bộ",
    overview: "Tổng quan",
    readMore: "Xem thêm",
    showLess: "Thu gọn",
    noDescription: "Chưa có mô tả.",
    youMayAlsoLike: "Có thể bạn cũng thích",
    minutesPerEpisode: "phút/tập",
  },
  en: {
    seriesInfo: "Series Info",
    createdBy: "Created by:",
    cast: "Cast:",
    country: "Country:",
    firstAirDate: "First Air Date:",
    lastAirDate: "Last Air Date:",
    seasons: "Seasons:",
    episodes: "Episodes:",
    runtimePerEpisode: "Runtime/Episode:",
    language: "Language:",
    status: "Status:",
    loading: "Loading...",
    unknown: "Unknown",
    notAvailable: "N/A",
    unableToLoad: "Unable to load TV series details.",
    tvSeriesTag: "TV Series",
    watchSeries: "Watch Series",
    overview: "Overview",
    readMore: "Read more",
    showLess: "Show less",
    noDescription: "No description available.",
    youMayAlsoLike: "You May Also Like",
    minutesPerEpisode: "min/ep",
  },
};

export interface WatchPageUiMessages {
  unableToLoad: string;
  fallbackSource: string;
  tvSeries: string;
  movie: string;
  season: string;
  seasons: string;
  episode: string;
  episodes: string;
  createdBy: string;
  seriesInfo: string;
  movieInfo: string;
  cast: string;
  noCast: string;
  youMayAlsoLike: string;
  noRecommendations: string;
  notAvailable: string;
  posterAltFallback: string;
}

const WATCH_PAGE_MESSAGES: Record<UiLocale, WatchPageUiMessages> = {
  vi: {
    unableToLoad: "Không thể tải dữ liệu trang xem.",
    fallbackSource: "Nguồn dự phòng",
    tvSeries: "Phim bộ",
    movie: "Phim lẻ",
    season: "mùa",
    seasons: "mùa",
    episode: "tập",
    episodes: "tập",
    createdBy: "Tạo bởi:",
    seriesInfo: "Thông tin series",
    movieInfo: "Thông tin phim",
    cast: "Diễn viên",
    noCast: "Không có thông tin diễn viên",
    youMayAlsoLike: "Có thể bạn cũng thích",
    noRecommendations: "Không có gợi ý liên quan",
    notAvailable: "Không có",
    posterAltFallback: "Poster phim",
  },
  en: {
    unableToLoad: "Unable to load watch page data.",
    fallbackSource: "Fallback source",
    tvSeries: "TV Series",
    movie: "Movie",
    season: "Season",
    seasons: "Seasons",
    episode: "Episode",
    episodes: "Episodes",
    createdBy: "Created by:",
    seriesInfo: "Series information",
    movieInfo: "Movie information",
    cast: "Cast",
    noCast: "No cast information available",
    youMayAlsoLike: "You May Also Like",
    noRecommendations: "No movie recommendations available",
    notAvailable: "N/A",
    posterAltFallback: "Movie poster",
  },
};

export interface PeopleDetailUiMessages {
  unableToLoad: string;
  dateOfBirth: string;
  placeOfBirth: string;
  dateOfDeath: string;
  biography: string;
  showLess: string;
  readMore: string;
  biographyNotAvailable: string;
  filmography: string;
  acting: string;
  crew: string;
  noActingCredits: string;
  noCrewCredits: string;
}

const PEOPLE_DETAIL_MESSAGES: Record<UiLocale, PeopleDetailUiMessages> = {
  vi: {
    unableToLoad: "Không thể tải thông tin nhân vật.",
    dateOfBirth: "Ngày sinh",
    placeOfBirth: "Nơi sinh",
    dateOfDeath: "Ngày mất",
    biography: "Tiểu sử",
    showLess: "Thu gọn",
    readMore: "Xem thêm",
    biographyNotAvailable: "Tiểu sử hiện chưa có",
    filmography: "Danh mục phim",
    acting: "Diễn xuất",
    crew: "Đoàn phim",
    noActingCredits: "Không có vai diễn",
    noCrewCredits: "Không có vai trò đoàn phim",
  },
  en: {
    unableToLoad: "Unable to load person details.",
    dateOfBirth: "Date of Birth",
    placeOfBirth: "Place of Birth",
    dateOfDeath: "Date of Death",
    biography: "Biography",
    showLess: "Show less",
    readMore: "Read more",
    biographyNotAvailable: "Biography not available yet",
    filmography: "Filmography",
    acting: "Acting",
    crew: "Crew",
    noActingCredits: "No acting credits available",
    noCrewCredits: "No crew credits available",
  },
};

export const getMovieDetailUiMessages = (
  language: string | undefined
): MovieDetailUiMessages => MOVIE_DETAIL_MESSAGES[resolveUiLocale(language)];

export const getTVDetailUiMessages = (
  language: string | undefined
): TVDetailUiMessages => TV_DETAIL_MESSAGES[resolveUiLocale(language)];

export const getWatchPageUiMessages = (
  language: string | undefined
): WatchPageUiMessages => WATCH_PAGE_MESSAGES[resolveUiLocale(language)];

export const getPeopleDetailUiMessages = (
  language: string | undefined
): PeopleDetailUiMessages => PEOPLE_DETAIL_MESSAGES[resolveUiLocale(language)];

export interface PublicListingUiMessages {
  moviesTitle: string;
  tvSeriesTitle: string;
  trendingTitle: string;
}

const PUBLIC_LISTING_MESSAGES: Record<UiLocale, PublicListingUiMessages> = {
  vi: {
    moviesTitle: "🎬 Phim lẻ",
    tvSeriesTitle: "📺 Phim bộ",
    trendingTitle: "🔥 Thịnh hành",
  },
  en: {
    moviesTitle: "🎬 Movies",
    tvSeriesTitle: "📺 TV Series",
    trendingTitle: "🔥 Trending",
  },
};

export interface BrowseUiMessages {
  movieTitle: string;
  tvTitle: string;
  trendingTitle: string;
  noResultsTitle: string;
  noResultsDescription: string;
  changeFilterHint: string;
}

const BROWSE_MESSAGES: Record<UiLocale, BrowseUiMessages> = {
  vi: {
    movieTitle: "🎬 Duyệt Phim Lẻ",
    tvTitle: "📺 Duyệt Phim Bộ",
    trendingTitle: "🔥 Duyệt Thịnh Hành",
    noResultsTitle: "Không tìm thấy nội dung",
    noResultsDescription: "Không có nội dung phù hợp với bộ lọc hiện tại.",
    changeFilterHint: "Hãy thử thay đổi bộ lọc để xem kết quả khác.",
  },
  en: {
    movieTitle: "🎬 Browse Movies",
    tvTitle: "📺 Browse TV Series",
    trendingTitle: "🔥 Browse Trending",
    noResultsTitle: "No movies found",
    noResultsDescription: "No movies found with the current filters.",
    changeFilterHint: "Try changing the filters to see different results.",
  },
};

export const getPublicListingUiMessages = (
  language: string | undefined
): PublicListingUiMessages => PUBLIC_LISTING_MESSAGES[resolveUiLocale(language)];

export const getBrowseUiMessages = (
  language: string | undefined
): BrowseUiMessages => BROWSE_MESSAGES[resolveUiLocale(language)];

export const getBrowseTitleByFetchType = (
  fetchType: BrowseFetchType,
  language: string | undefined
): string => {
  const messages = getBrowseUiMessages(language);

  switch (fetchType) {
    case "tv":
      return messages.tvTitle;
    case "trending":
      return messages.trendingTitle;
    default:
      return messages.movieTitle;
  }
};

export type CategoryListingRouteKey =
  | "movies-now-playing"
  | "movies-popular"
  | "movies-top-rated"
  | "movies-upcoming"
  | "tv-on-the-air"
  | "tv-popular"
  | "tv-top-rated";

export interface CategoryListingUiMessages {
  title: string;
  description: string;
  emptyMessage: string;
  totalItemsLabel: string;
}

const getCategoryListingDescription = (
  routeKey: CategoryListingRouteKey,
  locale: UiLocale,
  total: number
): string => {
  if (locale === "vi") {
    switch (routeKey) {
      case "movies-now-playing":
        return total > 0 ? `${total} phim đang chiếu ngoài rạp` : "";
      case "movies-popular":
        return total > 0 ? `${total} phim phổ biến` : "";
      case "movies-top-rated":
        return total > 0 ? `${total} phim đánh giá cao` : "";
      case "movies-upcoming":
        return total > 0 ? `${total} phim sắp chiếu` : "";
      case "tv-on-the-air":
        return "Theo dõi các series đang phát sóng tập mới.";
      case "tv-popular":
        return "Khám phá các phim bộ được khán giả xem và bàn luận nhiều nhất.";
      case "tv-top-rated":
        return "Các series được giới phê bình và khán giả đánh giá nổi bật.";
      default:
        return "";
    }
  }

  switch (routeKey) {
    case "movies-now-playing":
      return total > 0 ? `${total} movies now playing in theaters` : "";
    case "movies-popular":
      return total > 0 ? `${total} popular movies` : "";
    case "movies-top-rated":
      return total > 0 ? `${total} top rated movies` : "";
    case "movies-upcoming":
      return total > 0 ? `${total} upcoming movies` : "";
    case "tv-on-the-air":
      return "Stay current with series that are actively broadcasting new episodes.";
    case "tv-popular":
      return "Discover the TV shows audiences are watching and talking about the most.";
    case "tv-top-rated":
      return "Critically acclaimed series with outstanding ratings from viewers.";
    default:
      return "";
  }
};

export const getCategoryListingUiMessages = (
  routeKey: CategoryListingRouteKey,
  language: string | undefined,
  total: number
): CategoryListingUiMessages => {
  const locale = resolveUiLocale(language);

  if (locale === "vi") {
    switch (routeKey) {
      case "movies-now-playing":
        return {
          title: "Phim đang chiếu",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim",
          totalItemsLabel: "mục",
        };
      case "movies-popular":
        return {
          title: "Phim phổ biến",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim phổ biến",
          totalItemsLabel: "mục",
        };
      case "movies-top-rated":
        return {
          title: "Phim đánh giá cao",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim đánh giá cao",
          totalItemsLabel: "mục",
        };
      case "movies-upcoming":
        return {
          title: "Phim sắp chiếu",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim sắp chiếu",
          totalItemsLabel: "mục",
        };
      case "tv-on-the-air":
        return {
          title: "Phim bộ đang phát sóng",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim bộ đang phát sóng",
          totalItemsLabel: "mục",
        };
      case "tv-popular":
        return {
          title: "Phim bộ phổ biến",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim bộ phổ biến",
          totalItemsLabel: "mục",
        };
      case "tv-top-rated":
        return {
          title: "Phim bộ đánh giá cao",
          description: getCategoryListingDescription(routeKey, locale, total),
          emptyMessage: "Không tìm thấy phim bộ đánh giá cao",
          totalItemsLabel: "mục",
        };
      default:
        return {
          title: "",
          description: "",
          emptyMessage: "",
          totalItemsLabel: "mục",
        };
    }
  }

  switch (routeKey) {
    case "movies-now-playing":
      return {
        title: "Now Playing Movies",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No movies found",
        totalItemsLabel: "items",
      };
    case "movies-popular":
      return {
        title: "Popular Movies",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No popular movies found",
        totalItemsLabel: "items",
      };
    case "movies-top-rated":
      return {
        title: "Top Rated Movies",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No top rated movies found",
        totalItemsLabel: "items",
      };
    case "movies-upcoming":
      return {
        title: "Upcoming Movies",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No upcoming movies found",
        totalItemsLabel: "items",
      };
    case "tv-on-the-air":
      return {
        title: "Currently Airing TV Shows",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No currently airing TV shows found",
        totalItemsLabel: "items",
      };
    case "tv-popular":
      return {
        title: "Popular TV Shows",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No popular TV shows found",
        totalItemsLabel: "items",
      };
    case "tv-top-rated":
      return {
        title: "Top Rated TV Shows",
        description: getCategoryListingDescription(routeKey, locale, total),
        emptyMessage: "No top rated TV shows found",
        totalItemsLabel: "items",
      };
    default:
      return {
        title: "",
        description: "",
        emptyMessage: "",
        totalItemsLabel: "items",
      };
  }
};
