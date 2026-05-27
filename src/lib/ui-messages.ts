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

export interface PaginationUiMessages {
  goTo: string;
  jumpToPageTitle: (totalPages: number) => string;
}

export const getPaginationUiMessages = (
  language: string | undefined
): PaginationUiMessages => {
  const locale = resolveUiLocale(language);

  return {
    goTo: locale === "vi" ? "Đến" : "Go to",
    jumpToPageTitle: (totalPages: number) =>
      locale === "vi"
        ? `Đi đến trang (1-${totalPages})`
        : `Jump to page (1-${totalPages})`,
  };
};

export interface DialogUiMessages {
  close: string;
}

const DIALOG_MESSAGES: Record<UiLocale, DialogUiMessages> = {
  vi: {
    close: "Đóng",
  },
  en: {
    close: "Close",
  },
};

export const getDialogUiMessages = (
  language: string | undefined
): DialogUiMessages => DIALOG_MESSAGES[resolveUiLocale(language)];

export interface RootSeoUiMessages {
  defaultTitle: string;
  description: string;
  openGraphDescription: string;
  twitterDescription: string;
  openGraphLocale: "vi_VN" | "en_US";
}

const ROOT_SEO_MESSAGES: Record<UiLocale, RootSeoUiMessages> = {
  vi: {
    defaultTitle: "MovieStream - Xem Phim & Series Trực Tuyến",
    description:
      "Xem hàng ngàn phim lẻ và phim bộ trực tuyến. Theo dõi nội dung mới nhất, thịnh hành và các tác phẩm kinh điển trên MovieStream.",
    openGraphDescription:
      "Xem hàng ngàn phim lẻ và phim bộ trực tuyến. Theo dõi nội dung mới nhất, thịnh hành và các tác phẩm kinh điển.",
    twitterDescription:
      "Xem hàng ngàn phim lẻ và phim bộ trực tuyến. Theo dõi nội dung mới nhất và thịnh hành.",
    openGraphLocale: "vi_VN",
  },
  en: {
    defaultTitle: "MovieStream - Watch Movies & TV Shows Online",
    description:
      "Stream thousands of movies and TV shows online. Watch the latest releases, trending content, and classic favorites on MovieStream.",
    openGraphDescription:
      "Stream thousands of movies and TV shows online. Watch the latest releases, trending content, and classic favorites.",
    twitterDescription:
      "Stream thousands of movies and TV shows online. Watch the latest releases and trending content.",
    openGraphLocale: "en_US",
  },
};

export const getRootSeoUiMessages = (
  language: string | undefined
): RootSeoUiMessages => ROOT_SEO_MESSAGES[resolveUiLocale(language)];

export interface TrailerModalUiMessages {
  selectVideoToPlay: string;
  videoList: string;
  noTrailersAvailable: string;
  official: string;
  fan: string;
}

const TRAILER_MODAL_MESSAGES: Record<UiLocale, TrailerModalUiMessages> = {
  vi: {
    selectVideoToPlay: "Chọn video để phát",
    videoList: "Danh sách video",
    noTrailersAvailable: "Không có trailer.",
    official: "Chính thức",
    fan: "Fan",
  },
  en: {
    selectVideoToPlay: "Select a video to play",
    videoList: "Video List",
    noTrailersAvailable: "No trailers available.",
    official: "Official",
    fan: "Fan",
  },
};

export const getTrailerModalUiMessages = (
  language: string | undefined
): TrailerModalUiMessages => TRAILER_MODAL_MESSAGES[resolveUiLocale(language)];

export interface HoverPreviewCardUiMessages {
  watch: string;
  details: string;
  genreFallback: (id: number) => string;
}

export const getHoverPreviewCardUiMessages = (
  language: string | undefined
): HoverPreviewCardUiMessages => {
  const locale = resolveUiLocale(language);
  return {
    watch: locale === "vi" ? "Xem" : "Watch",
    details: locale === "vi" ? "Chi tiết" : "Details",
    genreFallback: (id: number) => (locale === "vi" ? `Thể loại ${id}` : `Genre ${id}`),
  };
};

export interface MovieCardUiMessages {
  full: string;
  watch: string;
  watchNowAlt: (title: string) => string;
  episodePrefix: string;
}

export const getMovieCardUiMessages = (
  language: string | undefined
): MovieCardUiMessages => {
  const locale = resolveUiLocale(language);
  return {
    full: locale === "vi" ? "Trọn bộ" : "Full",
    watch: locale === "vi" ? "Xem" : "Watch",
    watchNowAlt: (title: string) =>
      locale === "vi" ? `Xem ngay ${title}` : `Watch Now ${title}`,
    episodePrefix: locale === "vi" ? "Tập" : "Ep",
  };
};

export interface MoviesGridUiMessages {
  noMoviesFound: string;
  movieListEmpty: string;
}

const MOVIES_GRID_MESSAGES: Record<UiLocale, MoviesGridUiMessages> = {
  vi: {
    noMoviesFound: "Không tìm thấy phim",
    movieListEmpty: "Danh sách phim hiện tại đang trống",
  },
  en: {
    noMoviesFound: "No movies found",
    movieListEmpty: "The current movie list is empty",
  },
};

export const getMoviesGridUiMessages = (
  language: string | undefined
): MoviesGridUiMessages => MOVIES_GRID_MESSAGES[resolveUiLocale(language)];

export interface CategoryGridUiMessages {
  popularCategories: string;
}

const CATEGORY_GRID_MESSAGES: Record<UiLocale, CategoryGridUiMessages> = {
  vi: {
    popularCategories: "Danh mục phổ biến",
  },
  en: {
    popularCategories: "Popular Categories",
  },
};

export const getCategoryGridUiMessages = (
  language: string | undefined
): CategoryGridUiMessages => CATEGORY_GRID_MESSAGES[resolveUiLocale(language)];

export interface FilterToggleUiMessages {
  title: string;
  integrated: string;
  hint: string;
}

const FILTER_TOGGLE_MESSAGES: Record<UiLocale, FilterToggleUiMessages> = {
  vi: {
    title: "Bộ lọc nâng cao",
    integrated: "Bộ lọc nâng cao đã được tích hợp",
    hint: "Hãy dùng bộ lọc ở trang chính để tìm phim phù hợp",
  },
  en: {
    title: "Advanced Filters",
    integrated: "Advanced filters are already integrated",
    hint: "Use filters on the main page to find suitable movies",
  },
};

export const getFilterToggleUiMessages = (
  language: string | undefined
): FilterToggleUiMessages => FILTER_TOGGLE_MESSAGES[resolveUiLocale(language)];

export interface MovieGridUiMessages {
  trending: string;
  latest: string;
}

const MOVIE_GRID_MESSAGES: Record<UiLocale, MovieGridUiMessages> = {
  vi: {
    trending: "Thịnh hành",
    latest: "Mới nhất",
  },
  en: {
    trending: "Trending",
    latest: "Latest",
  },
};

export const getMovieGridUiMessages = (
  language: string | undefined
): MovieGridUiMessages => MOVIE_GRID_MESSAGES[resolveUiLocale(language)];

export type NotificationUiType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "system";

export interface NotificationsPageUiMessages {
  fallbackTitle: string;
  noNotificationsFound: string;
  cannotLoadNotifications: string;
  pageTitle: string;
  pageSubtitle: string;
  noNotifications: string;
  showAll: string;
  unreadOnly: string;
  loading: string;
  noNotificationsYet: string;
  noNotificationsDesc: string;
  noUnread: string;
  noUnreadDesc: string;
  new: string;
  deleteNotification: string;
  clearNotifications: string;
  notificationsCount: (count: number) => string;
  typeLabels: Record<NotificationUiType, string>;
}

const NOTIFICATIONS_PAGE_MESSAGES = {
  vi: {
    fallbackTitle: "Thông báo",
    noNotificationsFound: "Không tìm thấy thông báo",
    cannotLoadNotifications: "Không thể tải thông báo. Vui lòng thử lại.",
    pageTitle: "Thông báo",
    pageSubtitle: "Cập nhật mới nhất cho tài khoản của bạn.",
    noNotifications: "Không có thông báo",
    showAll: "Hiện tất cả",
    unreadOnly: "Chỉ chưa đọc",
    loading: "Đang tải thông báo...",
    noNotificationsYet: "Chưa có thông báo",
    noNotificationsDesc: "Khi có cập nhật mới, thông báo sẽ xuất hiện tại đây.",
    noUnread: "Không có thông báo chưa đọc",
    noUnreadDesc: 'Bạn đã đọc hết thông báo. Chuyển sang "Hiện tất cả" để xem lịch sử.',
    new: "Mới",
    deleteNotification: "Xóa thông báo",
    clearNotifications: "Xóa tất cả",
    typeLabels: {
      info: "Thông tin",
      success: "Thành công",
      warning: "Cảnh báo",
      error: "Lỗi",
      system: "Hệ thống",
    } as Record<NotificationUiType, string>,
  },
  en: {
    fallbackTitle: "Notification",
    noNotificationsFound: "No notifications found",
    cannotLoadNotifications: "Unable to load notifications. Please try again.",
    pageTitle: "Notifications",
    pageSubtitle: "Latest updates for your account.",
    noNotifications: "No notifications",
    showAll: "Show all",
    unreadOnly: "Unread only",
    loading: "Loading notifications...",
    noNotificationsYet: "No notifications yet",
    noNotificationsDesc: "When there are new updates, notifications will appear here.",
    noUnread: "No unread notifications",
    noUnreadDesc: `You've read all notifications. Switch to "Show all" to view history.`,
    new: "New",
    deleteNotification: "Delete notification",
    clearNotifications: "Clear all",
    typeLabels: {
      info: "Info",
      success: "Success",
      warning: "Warning",
      error: "Error",
      system: "System",
    } as Record<NotificationUiType, string>,
  },
} as const;

export const getNotificationsPageUiMessages = (
  language: string | undefined
): NotificationsPageUiMessages => {
  const locale = resolveUiLocale(language);
  const base = NOTIFICATIONS_PAGE_MESSAGES[locale];

  return {
    ...base,
    notificationsCount: (count: number) =>
      locale === "vi"
        ? `${count} thông báo`
        : `${count} notification${count === 1 ? "" : "s"}`,
  };
};

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
  vietsub: string;
  statusReleased: string;
  statusRumored: string;
  statusPlanned: string;
  statusInProduction: string;
  statusPostProduction: string;
  statusCanceled: string;
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
    vietsub: "Phụ đề Việt",
    statusReleased: "Đã phát hành",
    statusRumored: "Tin đồn",
    statusPlanned: "Đã lên kế hoạch",
    statusInProduction: "Đang sản xuất",
    statusPostProduction: "Hậu kỳ",
    statusCanceled: "Đã hủy",
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
    vietsub: "Vietsub",
    statusReleased: "Released",
    statusRumored: "Rumored",
    statusPlanned: "Planned",
    statusInProduction: "In Production",
    statusPostProduction: "Post Production",
    statusCanceled: "Canceled",
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
  statusOnAir: string;
  statusEnded: string;
  statusCanceledSeries: string;
  statusInProductionSeries: string;
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
    statusOnAir: "Đang phát sóng",
    statusEnded: "Đã kết thúc",
    statusCanceledSeries: "Đã hủy",
    statusInProductionSeries: "Đang sản xuất",
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
    statusOnAir: "On Air",
    statusEnded: "Ended",
    statusCanceledSeries: "Canceled",
    statusInProductionSeries: "In Production",
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

export interface HeaderUiMessages {
  home: string;
  trending: string;
  movies: string;
  browse: string;
  tvSeries: string;
  actors: string;
  search: string;
  login: string;
  loginSignUp: string;
  closeMenu: string;
  openMenu: string;
  close: string;
  accountAria: string;
  profileAlt: string;
  defaultUser: string;
  guest: string;
  signedIn: string;
  notSignedIn: string;
  favorites: string;
  defaultAvatarInitial: string;
}

const HEADER_MESSAGES: Record<UiLocale, HeaderUiMessages> = {
  vi: {
    home: "Trang chủ",
    trending: "Thịnh hành",
    movies: "Phim lẻ",
    browse: "Duyệt",
    tvSeries: "Phim bộ",
    actors: "Diễn viên",
    search: "Tìm kiếm",
    login: "Đăng nhập",
    loginSignUp: "Đăng nhập / Đăng ký",
    closeMenu: "Đóng menu",
    openMenu: "Mở menu",
    close: "Đóng",
    accountAria: "Đi tới tài khoản",
    profileAlt: "Hồ sơ",
    defaultUser: "Người dùng",
    guest: "Khách",
    signedIn: "Đã đăng nhập",
    notSignedIn: "Chưa đăng nhập",
    favorites: "Yêu thích",
    defaultAvatarInitial: "U",
  },
  en: {
    home: "Home",
    trending: "Trending",
    movies: "Movies",
    browse: "Browse",
    tvSeries: "TV Series",
    actors: "Actors",
    search: "Search",
    login: "Login",
    loginSignUp: "Login / Sign up",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    close: "Close",
    accountAria: "Go to account",
    profileAlt: "Profile",
    defaultUser: "User",
    guest: "Guest",
    signedIn: "Signed in",
    notSignedIn: "Not signed in",
    favorites: "Favorites",
    defaultAvatarInitial: "U",
  },
};

export const getHeaderUiMessages = (language: string | undefined): HeaderUiMessages =>
  HEADER_MESSAGES[resolveUiLocale(language)];

export interface FooterUiMessages {
  tagline: string;
  quickLinks: string;
  home: string;
  newReleases: string;
  movies: string;
  tvSeries: string;
  trending: string;
  categories: string;
  action: string;
  romance: string;
  comedy: string;
  animation: string;
  horror: string;
  contact: string;
  copyright: string;
  terms: string;
  privacy: string;
  faq: string;
}

const FOOTER_MESSAGES: Record<UiLocale, FooterUiMessages> = {
  vi: {
    tagline: "Trải nghiệm giải trí đa dạng với kho phim phong phú của chúng tôi.",
    quickLinks: "Liên kết nhanh",
    home: "Trang chủ",
    newReleases: "Mới phát hành",
    movies: "Phim lẻ",
    tvSeries: "Phim bộ",
    trending: "Thịnh hành",
    categories: "Thể loại",
    action: "Hành động",
    romance: "Lãng mạn",
    comedy: "Hài",
    animation: "Hoạt hình",
    horror: "Kinh dị",
    contact: "Liên hệ",
    copyright: "© 2024 MovieStream. Bảo lưu mọi quyền.",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách bảo mật",
    faq: "FAQ",
  },
  en: {
    tagline: "Experience great entertainment with our diverse movie collection.",
    quickLinks: "Quick Links",
    home: "Home",
    newReleases: "New Releases",
    movies: "Movies",
    tvSeries: "TV Series",
    trending: "Trending",
    categories: "Categories",
    action: "Action",
    romance: "Romance",
    comedy: "Comedy",
    animation: "Animation",
    horror: "Horror",
    contact: "Contact",
    copyright: "© 2024 MovieStream. All rights reserved.",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    faq: "FAQ",
  },
};

export const getFooterUiMessages = (language: string | undefined): FooterUiMessages =>
  FOOTER_MESSAGES[resolveUiLocale(language)];

export interface UserMenuUiMessages {
  defaultUser: string;
  notifications: string;
  favorites: string;
  account: string;
  logout: string;
}

const USER_MENU_MESSAGES: Record<UiLocale, UserMenuUiMessages> = {
  vi: {
    defaultUser: "Người dùng",
    notifications: "Thông báo",
    favorites: "Yêu thích",
    account: "Tài khoản",
    logout: "Đăng xuất",
  },
  en: {
    defaultUser: "User",
    notifications: "Notifications",
    favorites: "Favorites",
    account: "Account",
    logout: "Logout",
  },
};

export const getUserMenuUiMessages = (
  language: string | undefined
): UserMenuUiMessages => USER_MENU_MESSAGES[resolveUiLocale(language)];

export interface NotificationDropdownUiMessages {
  unreadNotificationsTitle: (count: number) => string;
  notifications: string;
  cannotConnect: string;
  allRead: string;
  markAllRead: string;
  marking: string;
  noNotificationsYet: string;
  markAsRead: string;
  deleteNotification: string;
  clearNotifications: string;
  viewAllNotifications: string;
  connected: string;
  disconnected: string;
}

const NOTIFICATION_DROPDOWN_MESSAGES = {
  vi: {
    notifications: "Thông báo",
    cannotConnect: "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.",
    allRead: "Tất cả thông báo đã được đọc",
    markAllRead: "Đánh dấu đã đọc hết",
    marking: "Đang đánh dấu...",
    noNotificationsYet: "Chưa có thông báo",
    markAsRead: "Đánh dấu đã đọc",
    deleteNotification: "Xóa thông báo",
    clearNotifications: "Xóa tất cả",
    viewAllNotifications: "Xem tất cả thông báo",
    connected: "Đã kết nối",
    disconnected: "Mất kết nối",
  },
  en: {
    notifications: "Notifications",
    cannotConnect: "Cannot connect to server. Please check your network connection.",
    allRead: "All notifications have been read",
    markAllRead: "Mark all read",
    marking: "Marking...",
    noNotificationsYet: "No notifications yet",
    markAsRead: "Mark as read",
    deleteNotification: "Delete notification",
    clearNotifications: "Clear all",
    viewAllNotifications: "View all notifications",
    connected: "Connected",
    disconnected: "Disconnected",
  },
} as const;

export const getNotificationDropdownUiMessages = (
  language: string | undefined
): NotificationDropdownUiMessages => {
  const locale = resolveUiLocale(language);
  const base = NOTIFICATION_DROPDOWN_MESSAGES[locale];

  return {
    ...base,
    unreadNotificationsTitle: (count: number) =>
      locale === "vi"
        ? `${count} thông báo chưa đọc`
        : `${count} unread notification${count === 1 ? "" : "s"}`,
  };
};

export type SearchFilterType = "movie" | "tv" | "person" | "all";

export interface SearchUiMessages {
  title: string;
  placeholder: string;
  minCharsHint: string;
  tabAll: string;
  tabMovies: string;
  tabTvSeries: string;
  tabActors: string;
  noResultsTitle: string;
  noResultsDescription: string;
  updating: string;
  foundResults: (count: number) => string;
  loadMore: string;
  noRecentSearches: string;
  recentSearchesDescription: string;
  recentSearchesTitle: string;
  clearAll: string;
  recently: string;
  local: string;
  closeSearch: string;
  typeLabel: (type: SearchFilterType) => string;
}

const SEARCH_MESSAGES: Record<UiLocale, Omit<SearchUiMessages, "foundResults" | "typeLabel">> =
  {
    vi: {
      title: "Tìm kiếm",
      placeholder: "Tìm phim lẻ, phim bộ, diễn viên...",
      minCharsHint: "Nhập ít nhất 2 ký tự để tìm kiếm",
      tabAll: "Tất cả",
      tabMovies: "Phim lẻ",
      tabTvSeries: "Phim bộ",
      tabActors: "Diễn viên",
      noResultsTitle: "Không tìm thấy kết quả",
      noResultsDescription: "Hãy thử tìm bằng từ khóa khác",
      updating: "Đang cập nhật...",
      loadMore: "Xem thêm",
      noRecentSearches: "Chưa có tìm kiếm gần đây",
      recentSearchesDescription: "Lịch sử tìm kiếm sẽ hiển thị ở đây",
      recentSearchesTitle: "Tìm kiếm gần đây",
      clearAll: "Xóa tất cả",
      recently: "Vừa xong",
      local: "Máy cục bộ",
      closeSearch: "Đóng tìm kiếm",
    },
    en: {
      title: "Search",
      placeholder: "Search movies, TV shows, actors...",
      minCharsHint: "Enter at least 2 characters to search",
      tabAll: "All",
      tabMovies: "Movies",
      tabTvSeries: "TV Series",
      tabActors: "Actors",
      noResultsTitle: "No results found",
      noResultsDescription: "Try searching with different keywords",
      updating: "Updating...",
      loadMore: "Load more",
      noRecentSearches: "No recent searches",
      recentSearchesDescription: "Your searches will appear here",
      recentSearchesTitle: "Recent Searches",
      clearAll: "Clear all",
      recently: "Recently",
      local: "Local",
      closeSearch: "Close search",
    },
  };

export const getSearchUiMessages = (language: string | undefined): SearchUiMessages => {
  const locale = resolveUiLocale(language);
  const base = SEARCH_MESSAGES[locale];

  return {
    ...base,
    foundResults: (count: number) =>
      locale === "vi"
        ? `Tìm thấy ${count} kết quả`
        : `Found ${count} result${count === 1 ? "" : "s"}`,
    typeLabel: (type: SearchFilterType) => {
      if (type === "movie") {
        return base.tabMovies;
      }
      if (type === "tv") {
        return base.tabTvSeries;
      }
      if (type === "person") {
        return base.tabActors;
      }
      return base.tabAll;
    },
  };
};

export interface AuthModalUiMessages {
  loginTitle: string;
  registerTitle: string;
  loginDescription: string;
  registerDescription: string;
  loginTab: string;
  registerTab: string;
  registerSuccess: string;
  registerFailed: string;
  genericError: string;
  googleLoginSuccess: string;
  googleLoginFailed: string;
  googleLoginFailedRetry: string;
  loginSuccess: string;
  orContinueWith: string;
  orRegisterWith: string;
  processing: string;
  loginWithGoogle: string;
  registerWithGoogle: string;
  agreePrefix: string;
  termsOfService: string;
  and: string;
  privacyPolicy: string;
}

const AUTH_MODAL_MESSAGES: Record<UiLocale, AuthModalUiMessages> = {
  vi: {
    loginTitle: "Đăng nhập",
    registerTitle: "Đăng ký",
    loginDescription: "Đăng nhập để khám phá",
    registerDescription: "Tạo tài khoản mới",
    loginTab: "Đăng nhập",
    registerTab: "Đăng ký",
    registerSuccess: "Đăng ký thành công! Chào mừng bạn đến với MovieStream.",
    registerFailed: "Đăng ký thất bại",
    genericError: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    googleLoginSuccess: "Đăng nhập bằng Google thành công!",
    googleLoginFailed: "Đăng nhập bằng Google thất bại",
    googleLoginFailedRetry: "Đăng nhập bằng Google thất bại. Vui lòng thử lại.",
    loginSuccess: "Đăng nhập thành công!",
    orContinueWith: "Hoặc tiếp tục với",
    orRegisterWith: "Hoặc đăng ký với",
    processing: "Đang xử lý...",
    loginWithGoogle: "Đăng nhập với Google",
    registerWithGoogle: "Đăng ký với Google",
    agreePrefix: "Bằng việc tiếp tục, bạn đồng ý với",
    termsOfService: "Điều khoản Dịch vụ",
    and: "và",
    privacyPolicy: "Chính sách Bảo mật",
  },
  en: {
    loginTitle: "Login",
    registerTitle: "Register",
    loginDescription: "Login to explore",
    registerDescription: "Create an account",
    loginTab: "Login",
    registerTab: "Register",
    registerSuccess: "Register success! Welcome to MovieStream.",
    registerFailed: "Register failed",
    genericError: "An error occurred. Please try again.",
    googleLoginSuccess: "Login with Google succeeded!",
    googleLoginFailed: "Login with Google failed",
    googleLoginFailedRetry: "Login with Google failed. Please try again.",
    loginSuccess: "Login succeeded!",
    orContinueWith: "Or continue with",
    orRegisterWith: "Or register with",
    processing: "Processing...",
    loginWithGoogle: "Login with Google",
    registerWithGoogle: "Register with Google",
    agreePrefix: "By continuing, you agree to",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
  },
};

export const getAuthModalUiMessages = (
  language: string | undefined
): AuthModalUiMessages => AUTH_MODAL_MESSAGES[resolveUiLocale(language)];

export interface LoginFormUiMessages {
  email: string;
  password: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  loggingIn: string;
  login: string;
  enterEmail: string;
  invalidEmail: string;
  enterPassword: string;
  loginFailed: string;
  genericError: string;
}

const LOGIN_FORM_MESSAGES: Record<UiLocale, LoginFormUiMessages> = {
  vi: {
    email: "Email",
    password: "Mật khẩu",
    emailPlaceholder: "email@example.com",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Quên mật khẩu?",
    loggingIn: "Đang đăng nhập...",
    login: "Đăng nhập",
    enterEmail: "Vui lòng nhập email",
    invalidEmail: "Định dạng email không hợp lệ",
    enterPassword: "Vui lòng nhập mật khẩu",
    loginFailed: "Đăng nhập thất bại",
    genericError: "Đã có lỗi xảy ra. Vui lòng thử lại.",
  },
  en: {
    email: "Email",
    password: "Password",
    emailPlaceholder: "email@example.com",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Forgot password?",
    loggingIn: "Logging in...",
    login: "Login",
    enterEmail: "Please enter your email",
    invalidEmail: "Invalid email format",
    enterPassword: "Please enter your password",
    loginFailed: "Login failed",
    genericError: "An error occurred. Please try again.",
  },
};

export const getLoginFormUiMessages = (
  language: string | undefined
): LoginFormUiMessages => LOGIN_FORM_MESSAGES[resolveUiLocale(language)];

export interface RegisterFormUiMessages {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  usernamePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  registering: string;
  register: string;
  enterUsername: string;
  enterEmail: string;
  invalidEmail: string;
  enterPassword: string;
  passwordsDoNotMatch: string;
  genericError: string;
}

const REGISTER_FORM_MESSAGES: Record<UiLocale, RegisterFormUiMessages> = {
  vi: {
    username: "Tên đăng nhập",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    usernamePlaceholder: "ví dụ: john_doe",
    emailPlaceholder: "email@example.com",
    passwordPlaceholder: "••••••••",
    registering: "Đang đăng ký...",
    register: "Đăng ký",
    enterUsername: "Vui lòng nhập tên đăng nhập",
    enterEmail: "Vui lòng nhập email",
    invalidEmail: "Định dạng email không hợp lệ",
    enterPassword: "Vui lòng nhập mật khẩu",
    passwordsDoNotMatch: "Mật khẩu xác nhận không khớp",
    genericError: "Đã có lỗi xảy ra. Vui lòng thử lại.",
  },
  en: {
    username: "Username",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    usernamePlaceholder: "e.g., john_doe",
    emailPlaceholder: "email@example.com",
    passwordPlaceholder: "••••••••",
    registering: "Registering...",
    register: "Register",
    enterUsername: "Please enter your username",
    enterEmail: "Please enter your email",
    invalidEmail: "Invalid email format",
    enterPassword: "Please enter your password",
    passwordsDoNotMatch: "Passwords do not match",
    genericError: "An error occurred. Please try again.",
  },
};

export const getRegisterFormUiMessages = (
  language: string | undefined
): RegisterFormUiMessages => REGISTER_FORM_MESSAGES[resolveUiLocale(language)];

export interface FavoritesPageUiMessages {
  pageTitle: string;
  yourFavorites: string;
  pleaseLoginToViewFavorites: string;
  loadFailed: string;
  retry: string;
  favoritesCount: (count: number) => string;
  emptyTitle: string;
  emptyDescription: string;
}

const FAVORITES_PAGE_MESSAGES = {
  vi: {
    pageTitle: "Yêu thích của tôi",
    yourFavorites: "Danh sách yêu thích",
    pleaseLoginToViewFavorites: "Vui lòng đăng nhập để xem phim yêu thích",
    loadFailed: "Không thể tải danh sách yêu thích. Vui lòng thử lại.",
    retry: "Thử lại",
    emptyTitle: "Chưa có mục yêu thích",
    emptyDescription: "Hãy thêm phim vào danh sách yêu thích!",
  },
  en: {
    pageTitle: "My Favorites",
    yourFavorites: "Your Favorites",
    pleaseLoginToViewFavorites: "Please login to view your favorite movies",
    loadFailed: "Failed to load favorites. Please try again.",
    retry: "Retry",
    emptyTitle: "No favorites yet",
    emptyDescription: "Start adding movies to your favorites!",
  },
} as const;

export const getFavoritesPageUiMessages = (
  language: string | undefined
): FavoritesPageUiMessages => {
  const locale = resolveUiLocale(language);
  const base = FAVORITES_PAGE_MESSAGES[locale];

  return {
    ...base,
    favoritesCount: (count: number) =>
      locale === "vi"
        ? `${count} phim`
        : `${count} movie${count === 1 ? "" : "s"}`,
  };
};

export interface FavoriteButtonUiMessages {
  loginRequiredTitle: string;
  loginRequiredDescription: string;
  invalidMovieData: string;
  addedToFavorites: string;
  removedFromFavorites: string;
  updateFavoriteFailed: string;
  loading: string;
  titleAdd: string;
  titleRemove: string;
  processing: string;
  favorited: string;
  addToFavorites: string;
}

const FAVORITE_BUTTON_MESSAGES: Record<UiLocale, FavoriteButtonUiMessages> = {
  vi: {
    loginRequiredTitle: "Cần đăng nhập",
    loginRequiredDescription: "Bạn cần đăng nhập để sử dụng tính năng này",
    invalidMovieData: "Dữ liệu phim không hợp lệ",
    addedToFavorites: "Đã thêm vào yêu thích!",
    removedFromFavorites: "Đã xóa khỏi yêu thích",
    updateFavoriteFailed: "Không thể cập nhật trạng thái yêu thích",
    loading: "Đang tải...",
    titleAdd: "Thêm vào yêu thích",
    titleRemove: "Xóa khỏi yêu thích",
    processing: "Đang xử lý...",
    favorited: "Đã yêu thích",
    addToFavorites: "Thêm vào yêu thích",
  },
  en: {
    loginRequiredTitle: "Login required",
    loginRequiredDescription: "You have to login to use this feature",
    invalidMovieData: "Invalid movie data",
    addedToFavorites: "Added to favorites!",
    removedFromFavorites: "Removed from favorites",
    updateFavoriteFailed: "Failed to update favorite status",
    loading: "Loading...",
    titleAdd: "Add to favorites",
    titleRemove: "Remove from favorites",
    processing: "Processing...",
    favorited: "Favorited",
    addToFavorites: "Add to Favorites",
  },
};

export const getFavoriteButtonUiMessages = (
  language: string | undefined
): FavoriteButtonUiMessages => FAVORITE_BUTTON_MESSAGES[resolveUiLocale(language)];

export interface NotFoundUiMessages {
  title: string;
  description: string;
  goHome: string;
  browseMovies: string;
  trendingNow: string;
}

const NOT_FOUND_MESSAGES: Record<UiLocale, NotFoundUiMessages> = {
  vi: {
    title: "Không tìm thấy trang",
    description: "Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.",
    goHome: "Về trang chủ",
    browseMovies: "Duyệt phim",
    trendingNow: "Đang thịnh hành",
  },
  en: {
    title: "Page Not Found",
    description: "Sorry, the page you are looking for doesn't exist or has been moved.",
    goHome: "Go Back Home",
    browseMovies: "Browse Movies",
    trendingNow: "Trending Now",
  },
};

export const getNotFoundUiMessages = (
  language: string | undefined
): NotFoundUiMessages => NOT_FOUND_MESSAGES[resolveUiLocale(language)];

export interface ErrorPageUiMessages {
  title: string;
  description: string;
  errorId: string;
  tryAgain: string;
  goHome: string;
}

const ERROR_PAGE_MESSAGES: Record<UiLocale, ErrorPageUiMessages> = {
  vi: {
    title: "Đã xảy ra lỗi",
    description: "Đã có lỗi không mong muốn. Vui lòng thử lại.",
    errorId: "Mã lỗi:",
    tryAgain: "Thử lại",
    goHome: "Về trang chủ",
  },
  en: {
    title: "Something Went Wrong",
    description: "We encountered an unexpected error. Please try again.",
    errorId: "Error ID:",
    tryAgain: "Try Again",
    goHome: "Go Back Home",
  },
};

export const getErrorPageUiMessages = (
  language: string | undefined
): ErrorPageUiMessages => ERROR_PAGE_MESSAGES[resolveUiLocale(language)];

export interface GlobalErrorUiMessages {
  title: string;
  description: string;
  refreshPage: string;
}

const GLOBAL_ERROR_MESSAGES: Record<UiLocale, GlobalErrorUiMessages> = {
  vi: {
    title: "Lỗi nghiêm trọng",
    description: "Đã xảy ra lỗi nghiêm trọng. Vui lòng tải lại trang.",
    refreshPage: "Tải lại trang",
  },
  en: {
    title: "Critical Error",
    description: "A critical error occurred. Please refresh the page.",
    refreshPage: "Refresh Page",
  },
};

export const getGlobalErrorUiMessages = (
  language: string | undefined
): GlobalErrorUiMessages => GLOBAL_ERROR_MESSAGES[resolveUiLocale(language)];

export interface PageHookUiMessages {
  invalidContentId: string;
  anErrorOccurred: string;
  invalidTvSeriesId: string;
  unknownError: string;
  invalidPersonId: string;
  unableToLoadActorInformation: string;
  knownForActor: string;
  knownForDirector: string;
  knownForWriter: string;
  knownForProducer: string;
  knownForArtist: string;
  loadContentFailed: string;
  fetchStreamFailed: string;
  noStreamAvailable: string;
  loadStreamFailed: string;
}

const PAGE_HOOK_MESSAGES: Record<UiLocale, PageHookUiMessages> = {
  vi: {
    invalidContentId: "ID nội dung không hợp lệ",
    anErrorOccurred: "Đã xảy ra lỗi",
    invalidTvSeriesId: "ID phim bộ không hợp lệ",
    unknownError: "Lỗi không xác định",
    invalidPersonId: "ID nhân vật không hợp lệ",
    unableToLoadActorInformation: "Không thể tải thông tin diễn viên",
    knownForActor: "Diễn viên",
    knownForDirector: "Đạo diễn",
    knownForWriter: "Biên kịch",
    knownForProducer: "Nhà sản xuất",
    knownForArtist: "Nghệ sĩ",
    loadContentFailed: "Không thể tải thông tin nội dung",
    fetchStreamFailed: "Không thể lấy nguồn phát.",
    noStreamAvailable: "Hiện chưa có nguồn phát phù hợp.",
    loadStreamFailed: "Không thể tải nguồn phát từ các nhà cung cấp hiện có.",
  },
  en: {
    invalidContentId: "Invalid content ID",
    anErrorOccurred: "An error occurred",
    invalidTvSeriesId: "Invalid TV series ID",
    unknownError: "Unknown error",
    invalidPersonId: "Invalid person ID",
    unableToLoadActorInformation: "Unable to load actor information",
    knownForActor: "Actor",
    knownForDirector: "Director",
    knownForWriter: "Writer",
    knownForProducer: "Producer",
    knownForArtist: "Artist",
    loadContentFailed: "Unable to load content information",
    fetchStreamFailed: "Unable to fetch stream source.",
    noStreamAvailable: "No stream source available right now.",
    loadStreamFailed: "Unable to load stream from available providers.",
  },
};

export const getPageHookUiMessages = (
  language: string | undefined
): PageHookUiMessages => PAGE_HOOK_MESSAGES[resolveUiLocale(language)];

export interface CategoryFetchErrorUiMessages {
  failedToFetchNowPlayingMovies: string;
  failedToFetchPopularMovies: string;
  failedToFetchTopRatedMovies: string;
  failedToFetchUpcomingMovies: string;
  failedToFetchOnTheAirTVShows: string;
  failedToFetchPopularTVShows: string;
  failedToFetchTopRatedTVShows: string;
  unknownError: string;
}

const CATEGORY_FETCH_ERROR_MESSAGES: Record<UiLocale, CategoryFetchErrorUiMessages> = {
  vi: {
    failedToFetchNowPlayingMovies: "Không thể tải danh sách phim đang chiếu",
    failedToFetchPopularMovies: "Không thể tải danh sách phim phổ biến",
    failedToFetchTopRatedMovies: "Không thể tải danh sách phim đánh giá cao",
    failedToFetchUpcomingMovies: "Không thể tải danh sách phim sắp chiếu",
    failedToFetchOnTheAirTVShows: "Không thể tải danh sách phim bộ đang phát sóng",
    failedToFetchPopularTVShows: "Không thể tải danh sách phim bộ phổ biến",
    failedToFetchTopRatedTVShows: "Không thể tải danh sách phim bộ đánh giá cao",
    unknownError: "Lỗi không xác định",
  },
  en: {
    failedToFetchNowPlayingMovies: "Failed to fetch now playing movies",
    failedToFetchPopularMovies: "Failed to fetch popular movies",
    failedToFetchTopRatedMovies: "Failed to fetch top rated movies",
    failedToFetchUpcomingMovies: "Failed to fetch upcoming movies",
    failedToFetchOnTheAirTVShows: "Failed to fetch currently airing TV shows",
    failedToFetchPopularTVShows: "Failed to fetch popular TV shows",
    failedToFetchTopRatedTVShows: "Failed to fetch top rated TV shows",
    unknownError: "Unknown error",
  },
};

export const getCategoryFetchErrorUiMessages = (
  language: string | undefined
): CategoryFetchErrorUiMessages =>
  CATEGORY_FETCH_ERROR_MESSAGES[resolveUiLocale(language)];

export interface OAuthCallbackUiMessages {
  initialMessage: string;
  noIdTokenReceived: string;
  failedToExtractUserInfo: string;
  authenticatingWithServer: string;
  loginSuccessfulClosingWindow: string;
  authenticationFailed: string;
  unknownError: string;
  processingStatus: string;
  successStatus: string;
  errorStatus: string;
  closeWindow: string;
  errorPrefix: string;
}

const OAUTH_CALLBACK_MESSAGES: Record<UiLocale, OAuthCallbackUiMessages> = {
  vi: {
    initialMessage: "Đang xử lý đăng nhập Google...",
    noIdTokenReceived: "Không nhận được ID token từ Google",
    failedToExtractUserInfo: "Không thể trích xuất thông tin người dùng từ ID token",
    authenticatingWithServer: "Đang xác thực với máy chủ...",
    loginSuccessfulClosingWindow: "Đăng nhập thành công! Đang đóng cửa sổ...",
    authenticationFailed: "Xác thực thất bại",
    unknownError: "Lỗi không xác định",
    processingStatus: "Đang xử lý...",
    successStatus: "Thành công!",
    errorStatus: "Lỗi",
    closeWindow: "Đóng cửa sổ",
    errorPrefix: "Lỗi:",
  },
  en: {
    initialMessage: "Processing Google login...",
    noIdTokenReceived: "No ID token received from Google",
    failedToExtractUserInfo: "Failed to extract user info from ID token",
    authenticatingWithServer: "Authenticating with server...",
    loginSuccessfulClosingWindow: "Login successful! Closing window...",
    authenticationFailed: "Authentication failed",
    unknownError: "Unknown error",
    processingStatus: "Processing...",
    successStatus: "Success!",
    errorStatus: "Error",
    closeWindow: "Close Window",
    errorPrefix: "Error:",
  },
};

export const getOAuthCallbackUiMessages = (
  language: string | undefined
): OAuthCallbackUiMessages => OAUTH_CALLBACK_MESSAGES[resolveUiLocale(language)];

export interface CommentsUiMessages {
  pleaseLoginToComment: string;
  commentingAs: string;
  defaultUser: string;
  writeComment: string;
  searching: string;
  noUsersFound: string;
  enterAtLeast2CharsToSearch: string;
  cancel: string;
  update: string;
  send: string;
  loadingComments: string;
  loading: string;
  loadMoreComments: string;
  noCommentsYet: string;
  beFirstToShareThoughts: string;
  reply: string;
  edit: string;
  delete: string;
  anonymous: string;
  edited: string;
  editComment: string;
  hideReplies: string;
  needLoginToComment: string;
  contentCannotBeEmpty: string;
  contentTooLongMax1000: string;
  inappropriateContent: string;
  unableToSendComment: string;
  errorLoadingCommentsTitle: string;
  errorLoadingCommentsDefault: string;
  commentPostedTitle: string;
  commentPostedDescription: string;
  errorTitle: string;
  errorPostingCommentDefault: string;
  commentUpdatedTitle: string;
  commentUpdatedDescription: string;
  errorUpdatingCommentTitle: string;
  errorUpdatingCommentDefault: string;
  commentDeletedTitle: string;
  commentDeletedDescription: string;
  errorDeletingCommentTitle: string;
  errorDeletingCommentDefault: string;
  errorLikingCommentDefault: string;
  errorDislikingCommentDefault: string;
  commentReportedTitle: string;
  commentReportedDescription: string;
  errorReportingCommentTitle: string;
  errorReportingCommentDefault: string;
  errorLoadingCommentTitle: string;
  errorLoadingCommentDefault: string;
  replyTo: (name: string) => string;
  viewAllReplies: (count: number) => string;
}

const COMMENTS_MESSAGES = {
  vi: {
    pleaseLoginToComment: "Vui lòng đăng nhập để bình luận",
    commentingAs: "Bình luận với tư cách",
    defaultUser: "Người dùng",
    writeComment: "Viết bình luận",
    searching: "Đang tìm...",
    noUsersFound: "Không tìm thấy người dùng",
    enterAtLeast2CharsToSearch: "Nhập ít nhất 2 ký tự để tìm",
    cancel: "Hủy",
    update: "Cập nhật",
    send: "Gửi",
    loadingComments: "Đang tải bình luận...",
    loading: "Đang tải...",
    loadMoreComments: "Xem thêm bình luận...",
    noCommentsYet: "Chưa có bình luận",
    beFirstToShareThoughts: "Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!",
    reply: "Trả lời",
    edit: "Sửa",
    delete: "Xóa",
    anonymous: "Ẩn danh",
    edited: "Đã chỉnh sửa",
    editComment: "Sửa bình luận",
    hideReplies: "Ẩn trả lời",
    needLoginToComment: "Bạn cần đăng nhập để bình luận",
    contentCannotBeEmpty: "Nội dung không được để trống",
    contentTooLongMax1000: "Nội dung quá dài (tối đa 1000 ký tự)",
    inappropriateContent: "Nội dung không phù hợp",
    unableToSendComment: "Không thể gửi bình luận",
    errorLoadingCommentsTitle: "Lỗi tải bình luận",
    errorLoadingCommentsDefault: "Không thể tải bình luận",
    commentPostedTitle: "Đã đăng bình luận",
    commentPostedDescription: "Bình luận của bạn đã được đăng thành công.",
    errorTitle: "Lỗi",
    errorPostingCommentDefault: "Không thể đăng bình luận",
    commentUpdatedTitle: "Đã cập nhật bình luận",
    commentUpdatedDescription: "Bình luận của bạn đã được cập nhật thành công.",
    errorUpdatingCommentTitle: "Lỗi cập nhật bình luận",
    errorUpdatingCommentDefault: "Không thể cập nhật bình luận",
    commentDeletedTitle: "Đã xóa bình luận",
    commentDeletedDescription: "Bình luận của bạn đã được xóa thành công.",
    errorDeletingCommentTitle: "Lỗi xóa bình luận",
    errorDeletingCommentDefault: "Không thể xóa bình luận",
    errorLikingCommentDefault: "Không thể thích bình luận",
    errorDislikingCommentDefault: "Không thể không thích bình luận",
    commentReportedTitle: "Đã báo cáo bình luận",
    commentReportedDescription: "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm.",
    errorReportingCommentTitle: "Lỗi báo cáo bình luận",
    errorReportingCommentDefault: "Không thể báo cáo bình luận",
    errorLoadingCommentTitle: "Lỗi tải bình luận",
    errorLoadingCommentDefault: "Không thể tải bình luận",
  },
  en: {
    pleaseLoginToComment: "Please login to comment",
    commentingAs: "Commenting as",
    defaultUser: "User",
    writeComment: "Write a comment",
    searching: "Searching...",
    noUsersFound: "No users found",
    enterAtLeast2CharsToSearch: "Enter at least 2 characters to search",
    cancel: "Cancel",
    update: "Update",
    send: "Send",
    loadingComments: "Loading comments...",
    loading: "Loading...",
    loadMoreComments: "Load more comments...",
    noCommentsYet: "No comments yet",
    beFirstToShareThoughts: "Be the first to share your thoughts!",
    reply: "Reply",
    edit: "Edit",
    delete: "Delete",
    anonymous: "Anonymous",
    edited: "Edited",
    editComment: "Edit comment",
    hideReplies: "Hide replies",
    needLoginToComment: "You need to login to comment",
    contentCannotBeEmpty: "Content cannot be empty",
    contentTooLongMax1000: "Content is too long (max 1000 characters)",
    inappropriateContent: "Inappropriate content",
    unableToSendComment: "Unable to send comment",
    errorLoadingCommentsTitle: "Error loading comments",
    errorLoadingCommentsDefault: "Failed to load comments",
    commentPostedTitle: "Comment posted",
    commentPostedDescription: "Your comment has been posted successfully.",
    errorTitle: "Error",
    errorPostingCommentDefault: "Failed to post comment",
    commentUpdatedTitle: "Comment updated",
    commentUpdatedDescription: "Your comment has been updated successfully.",
    errorUpdatingCommentTitle: "Error updating comment",
    errorUpdatingCommentDefault: "Failed to update comment",
    commentDeletedTitle: "Comment deleted",
    commentDeletedDescription: "Your comment has been deleted successfully.",
    errorDeletingCommentTitle: "Error deleting comment",
    errorDeletingCommentDefault: "Failed to delete comment",
    errorLikingCommentDefault: "Failed to like comment",
    errorDislikingCommentDefault: "Failed to dislike comment",
    commentReportedTitle: "Comment reported",
    commentReportedDescription:
      "Thank you for reporting this comment. We will review it shortly.",
    errorReportingCommentTitle: "Error reporting comment",
    errorReportingCommentDefault: "Failed to report comment",
    errorLoadingCommentTitle: "Error loading comment",
    errorLoadingCommentDefault: "Failed to load comment",
  },
} as const;

export const getCommentsUiMessages = (
  language: string | undefined
): CommentsUiMessages => {
  const locale = resolveUiLocale(language);
  const base = COMMENTS_MESSAGES[locale];

  return {
    ...base,
    replyTo: (name: string) =>
      locale === "vi" ? `Trả lời ${name}...` : `Reply to ${name}...`,
    viewAllReplies: (count: number) =>
      locale === "vi" ? `Xem tất cả trả lời (${count})` : `View all replies (${count})`,
  };
};

export interface HomePageUiMessages {
  viewMore: string;
  nowPlaying: string;
  popular: string;
  topRated: string;
  upcoming: string;
  onTheAir: string;
  popularTVSeries: string;
  topRatedTVSeries: string;
}

const HOME_PAGE_MESSAGES: Record<UiLocale, HomePageUiMessages> = {
  vi: {
    viewMore: "Xem thêm",
    nowPlaying: "Đang chiếu",
    popular: "Phổ biến",
    topRated: "Đánh giá cao",
    upcoming: "Sắp chiếu",
    onTheAir: "Đang phát sóng",
    popularTVSeries: "Phim bộ phổ biến",
    topRatedTVSeries: "Phim bộ đánh giá cao",
  },
  en: {
    viewMore: "View More",
    nowPlaying: "Now Playing",
    popular: "Popular",
    topRated: "Top Rated",
    upcoming: "Upcoming",
    onTheAir: "On The Air",
    popularTVSeries: "Popular TV Series",
    topRatedTVSeries: "Top Rated TV Series",
  },
};

export const getHomePageUiMessages = (
  language: string | undefined
): HomePageUiMessages => HOME_PAGE_MESSAGES[resolveUiLocale(language)];

export interface PeopleUiMessages {
  pageTitle: string;
  pageSubtitle: string;
  noActorsFound: string;
  actorsListEmpty: string;
  loadMore: string;
  actor: string;
  director: string;
  writer: string;
  production: string;
  artist: string;
}

const PEOPLE_MESSAGES: Record<UiLocale, PeopleUiMessages> = {
  vi: {
    pageTitle: "Diễn viên & Đạo diễn",
    pageSubtitle: "Khám phá thế giới diễn viên và nhà làm phim",
    noActorsFound: "Không tìm thấy diễn viên",
    actorsListEmpty: "Danh sách diễn viên hiện đang trống",
    loadMore: "Xem thêm",
    actor: "Diễn viên",
    director: "Đạo diễn",
    writer: "Biên kịch",
    production: "Sản xuất",
    artist: "Nghệ sĩ",
  },
  en: {
    pageTitle: "Actors & Directors",
    pageSubtitle: "Explore a whole world of actors and filmmakers",
    noActorsFound: "No actors found",
    actorsListEmpty: "Actors list is currently empty",
    loadMore: "Load More",
    actor: "Actor",
    director: "Director",
    writer: "Writer",
    production: "Production",
    artist: "Artist",
  },
};

export const getPeopleUiMessages = (
  language: string | undefined
): PeopleUiMessages => PEOPLE_MESSAGES[resolveUiLocale(language)];

export interface TrendingSuggestionsUiMessages {
  popularRightNow: string;
}

const TRENDING_SUGGESTIONS_MESSAGES: Record<UiLocale, TrendingSuggestionsUiMessages> = {
  vi: {
    popularRightNow: "Đang phổ biến",
  },
  en: {
    popularRightNow: "Popular Right Now",
  },
};

export const getTrendingSuggestionsUiMessages = (
  language: string | undefined
): TrendingSuggestionsUiMessages =>
  TRENDING_SUGGESTIONS_MESSAGES[resolveUiLocale(language)];

export interface TrailerButtonUiMessages {
  checkingTrailer: string;
  noTrailerAvailable: string;
  watchTrailer: string;
  loading: string;
}

const TRAILER_BUTTON_MESSAGES: Record<UiLocale, TrailerButtonUiMessages> = {
  vi: {
    checkingTrailer: "Đang kiểm tra trailer...",
    noTrailerAvailable: "Không có trailer",
    watchTrailer: "Xem trailer",
    loading: "Đang tải...",
  },
  en: {
    checkingTrailer: "Checking trailer...",
    noTrailerAvailable: "No trailer available",
    watchTrailer: "Watch trailer",
    loading: "Loading...",
  },
};

export const getTrailerButtonUiMessages = (
  language: string | undefined
): TrailerButtonUiMessages => TRAILER_BUTTON_MESSAGES[resolveUiLocale(language)];

export interface EpisodePickerUiMessages {
  episodes: string;
  season: (index: number) => string;
  noEpisodesAvailable: string;
}

export const getEpisodePickerUiMessages = (
  language: string | undefined
): EpisodePickerUiMessages => {
  const locale = resolveUiLocale(language);

  return {
    episodes: locale === "vi" ? "Tập phim" : "Episodes",
    season: (index: number) => (locale === "vi" ? `Mùa ${index}` : `Season ${index}`),
    noEpisodesAvailable:
      locale === "vi" ? "Không có tập phim khả dụng" : "No episodes available",
  };
};

export interface SortingSelectUiMessages {
  trendingNow: string;
  topRated: string;
  latestReleases: string;
  sortBy: string;
}

const SORTING_SELECT_MESSAGES: Record<UiLocale, SortingSelectUiMessages> = {
  vi: {
    trendingNow: "🔥 Đang thịnh hành",
    topRated: "⭐ Đánh giá cao",
    latestReleases: "🆕 Mới phát hành",
    sortBy: "Sắp xếp:",
  },
  en: {
    trendingNow: "🔥 Trending Now",
    topRated: "⭐ Top Rated",
    latestReleases: "🆕 Latest Releases",
    sortBy: "Sort by:",
  },
};

export const getSortingSelectUiMessages = (
  language: string | undefined
): SortingSelectUiMessages => SORTING_SELECT_MESSAGES[resolveUiLocale(language)];

export interface HeroSectionUiMessages {
  tvSeries: string;
  movie: string;
}

const HERO_SECTION_MESSAGES: Record<UiLocale, HeroSectionUiMessages> = {
  vi: {
    tvSeries: "Phim bộ",
    movie: "Phim lẻ",
  },
  en: {
    tvSeries: "TV Series",
    movie: "Movie",
  },
};

export const getHeroSectionUiMessages = (
  language: string | undefined
): HeroSectionUiMessages => HERO_SECTION_MESSAGES[resolveUiLocale(language)];

export interface TableFiltersUiMessages {
  all: string;
  filters: string;
  country: string;
  type: string;
  trending: string;
  genre: string;
  year: string;
  sortBy: string;
  selectedYears: string;
  applyFilters: string;
  close: string;
  customYearPlaceholder: string;
  countryUS: string;
  countryKR: string;
  countryJP: string;
  countryCN: string;
  countryVN: string;
  movie: string;
  tvSeries: string;
  popular: string;
  latest: string;
  topRated: string;
  recentlyUpdated: string;
  imdbScore: string;
  mostViewed: string;
}

const TABLE_FILTERS_MESSAGES: Record<UiLocale, TableFiltersUiMessages> = {
  vi: {
    all: "Tất cả",
    filters: "Bộ lọc",
    country: "Quốc gia",
    type: "Loại",
    trending: "Thịnh hành",
    genre: "Thể loại",
    year: "Năm",
    sortBy: "Sắp xếp",
    selectedYears: "Năm đã chọn",
    applyFilters: "Áp dụng",
    close: "Đóng",
    customYearPlaceholder: "Nhập năm + Enter",
    countryUS: "Mỹ",
    countryKR: "Hàn Quốc",
    countryJP: "Nhật Bản",
    countryCN: "Trung Quốc",
    countryVN: "Việt Nam",
    movie: "Phim lẻ",
    tvSeries: "Phim bộ",
    popular: "Phổ biến",
    latest: "Mới nhất",
    topRated: "Đánh giá cao",
    recentlyUpdated: "Cập nhật gần đây",
    imdbScore: "Điểm IMDb",
    mostViewed: "Xem nhiều",
  },
  en: {
    all: "All",
    filters: "Filters",
    country: "Country",
    type: "Type",
    trending: "Trending",
    genre: "Genre",
    year: "Year",
    sortBy: "Sort by",
    selectedYears: "Selected years",
    applyFilters: "Apply Filters",
    close: "Close",
    customYearPlaceholder: "Enter year + Enter",
    countryUS: "United States",
    countryKR: "South Korea",
    countryJP: "Japan",
    countryCN: "China",
    countryVN: "Vietnam",
    movie: "Movie",
    tvSeries: "TV Series",
    popular: "Popular",
    latest: "Latest",
    topRated: "Top Rated",
    recentlyUpdated: "Recently Updated",
    imdbScore: "IMDb Score",
    mostViewed: "Most Viewed",
  },
};

export const getTableFiltersUiMessages = (
  language: string | undefined
): TableFiltersUiMessages => TABLE_FILTERS_MESSAGES[resolveUiLocale(language)];

export interface MediaNotFoundUiMessages {
  movieTitle: string;
  movieDescription: string;
  backToMovies: string;
  movieTrendingSuggestions: string;
  actorTitle: string;
  actorDescription: string;
  backToActors: string;
  tvTitle: string;
  tvDescription: string;
  backToTVSeries: string;
  tvTrendingSuggestions: string;
  goHome: string;
}

const MEDIA_NOT_FOUND_MESSAGES: Record<UiLocale, MediaNotFoundUiMessages> = {
  vi: {
    movieTitle: "Không tìm thấy phim",
    movieDescription:
      "Không tìm thấy phim bạn đang tìm. Có thể phim đã bị gỡ hoặc đường dẫn không chính xác.",
    backToMovies: "← Quay lại phim lẻ",
    movieTrendingSuggestions: "Phim phổ biến có thể bạn thích",
    actorTitle: "Không tìm thấy diễn viên",
    actorDescription:
      "Không tìm thấy diễn viên bạn đang tìm. Có thể dữ liệu đã bị gỡ hoặc ID không chính xác.",
    backToActors: "← Quay lại diễn viên",
    tvTitle: "Không tìm thấy phim bộ",
    tvDescription:
      "Không tìm thấy phim bộ bạn đang tìm. Có thể nội dung đã bị gỡ hoặc đường dẫn không chính xác.",
    backToTVSeries: "← Quay lại phim bộ",
    tvTrendingSuggestions: "Phim bộ phổ biến có thể bạn thích",
    goHome: "Về trang chủ",
  },
  en: {
    movieTitle: "Movie Not Found",
    movieDescription:
      "We couldn't find the movie you're looking for. It might have been removed or the URL is incorrect.",
    backToMovies: "← Back to Movies",
    movieTrendingSuggestions: "Popular Movies You Might Like",
    actorTitle: "Actor Not Found",
    actorDescription:
      "We couldn't find the actor you're looking for. They might have been removed or the ID is incorrect.",
    backToActors: "← Back to Actors",
    tvTitle: "TV Series Not Found",
    tvDescription:
      "We couldn't find the TV series you're looking for. It might have been removed or the URL is incorrect.",
    backToTVSeries: "← Back to TV Series",
    tvTrendingSuggestions: "Popular TV Series You Might Like",
    goHome: "Go Home",
  },
};

export const getMediaNotFoundUiMessages = (
  language: string | undefined
): MediaNotFoundUiMessages => MEDIA_NOT_FOUND_MESSAGES[resolveUiLocale(language)];

export interface AccountUiMessages {
  pleaseLogin: string;
  needLogin: string;
  imageSize: string;
  uploadFailed: string;
  updateImageFailed: string;
  userUnavailable: string;
  avatarUpdated: string;
  uploadRetry: string;
  passwordMismatch: string;
  missingInput: string;
  updateSuccess: string;
  updateFailed: string;
  accountTitle: string;
  changeAvatar: string;
  uploading: string;
  change: string;
  role: string;
  admin: string;
  user: string;
  status: string;
  active: string;
  settings: string;
  displayName: string;
  newPassword: string;
  keepCurrent: string;
  confirmPassword: string;
  repeatNewPassword: string;
  saving: string;
  saveChanges: string;
  changePassword: string;
  updatePassword: string;
  notifications: string;
  manageNotifications: string;
  email: string;
}

const ACCOUNT_MESSAGES: Record<UiLocale, AccountUiMessages> = {
  vi: {
    pleaseLogin: "Vui lòng đăng nhập",
    needLogin: "Bạn cần đăng nhập để xem thông tin tài khoản",
    imageSize: "Ảnh phải nhỏ hơn 5MB",
    uploadFailed: "Tải ảnh thất bại",
    updateImageFailed: "Cập nhật ảnh thất bại",
    userUnavailable: "Không có thông tin người dùng. Vui lòng tải lại trang",
    avatarUpdated: "Cập nhật ảnh đại diện thành công",
    uploadRetry: "Không thể tải ảnh lên. Vui lòng thử lại",
    passwordMismatch: "Mật khẩu xác nhận không khớp",
    missingInput: "Vui lòng nhập tên hoặc mật khẩu mới",
    updateSuccess: "Cập nhật thành công",
    updateFailed: "Cập nhật thất bại",
    accountTitle: "👤 Tài khoản của bạn",
    changeAvatar: "Đổi ảnh đại diện",
    uploading: "Đang tải lên...",
    change: "Đổi",
    role: "Vai trò",
    admin: "Quản trị viên",
    user: "Người dùng",
    status: "Trạng thái",
    active: "Hoạt động",
    settings: "Cài đặt tài khoản",
    displayName: "Tên hiển thị",
    newPassword: "Mật khẩu mới",
    keepCurrent: "Để trống nếu muốn giữ mật khẩu hiện tại",
    confirmPassword: "Xác nhận mật khẩu",
    repeatNewPassword: "Nhập lại mật khẩu mới",
    saving: "Đang lưu...",
    saveChanges: "Lưu thay đổi",
    changePassword: "Đổi mật khẩu",
    updatePassword: "Cập nhật mật khẩu của bạn",
    notifications: "Thông báo",
    manageNotifications: "Quản lý tùy chọn thông báo",
    email: "Email",
  },
  en: {
    pleaseLogin: "Please login",
    needLogin: "You need to login to view account information",
    imageSize: "Image must be smaller than 5MB",
    uploadFailed: "Image upload failed",
    updateImageFailed: "Image update failed",
    userUnavailable: "User info not available. Please reload the page",
    avatarUpdated: "Avatar updated successfully",
    uploadRetry: "Unable to upload image. Please try again",
    passwordMismatch: "Confirm password does not match",
    missingInput: "Please enter a name or new password",
    updateSuccess: "Update successful",
    updateFailed: "Update failed",
    accountTitle: "👤 Your Account",
    changeAvatar: "Change avatar",
    uploading: "Uploading...",
    change: "Change",
    role: "Role",
    admin: "Administrator",
    user: "User",
    status: "Status",
    active: "Active",
    settings: "Account Settings",
    displayName: "Display name",
    newPassword: "New password",
    keepCurrent: "Leave blank to keep current",
    confirmPassword: "Confirm password",
    repeatNewPassword: "Repeat new password",
    saving: "Saving...",
    saveChanges: "Save changes",
    changePassword: "Change Password",
    updatePassword: "Update your password",
    notifications: "Notifications",
    manageNotifications: "Manage notification preferences",
    email: "Email",
  },
};

export const getAccountUiMessages = (
  language: string | undefined
): AccountUiMessages => ACCOUNT_MESSAGES[resolveUiLocale(language)];

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqUiMessages {
  title: string;
  subtitle: string;
  stillHaveQuestions: string;
  contactDescription: string;
  contactSupport: string;
  items: FaqEntry[];
}

const FAQ_MESSAGES: Record<UiLocale, FaqUiMessages> = {
  vi: {
    title: "Câu hỏi thường gặp",
    subtitle: "Tìm câu trả lời cho các thắc mắc phổ biến về MovieStream",
    stillHaveQuestions: "Vẫn còn thắc mắc?",
    contactDescription:
      "Nếu chưa tìm thấy câu trả lời, hãy liên hệ đội ngũ hỗ trợ của chúng tôi.",
    contactSupport: "Liên hệ hỗ trợ",
    items: [
      {
        question: "Làm sao để tạo tài khoản?",
        answer:
          'Nhấn nút "Đăng nhập" ở góc trên bên phải, sau đó chọn "Đăng ký". Bạn cũng có thể đăng ký nhanh bằng tài khoản Google.',
      },
      {
        question: "MovieStream có miễn phí không?",
        answer:
          "Có. MovieStream cung cấp nhiều nội dung miễn phí. Một số nội dung cao cấp có thể yêu cầu gói trả phí trong tương lai.",
      },
      {
        question: "Tôi có thể xem trên thiết bị nào?",
        answer:
          "Bạn có thể xem trên mọi thiết bị có trình duyệt web như máy tính, laptop, tablet và điện thoại. Hỗ trợ các trình duyệt phổ biến như Chrome, Firefox, Safari và Edge.",
      },
      {
        question: "Làm sao để tìm phim?",
        answer:
          "Nhấn biểu tượng tìm kiếm trên thanh điều hướng hoặc dùng Ctrl+K (Cmd+K trên Mac) để mở modal tìm kiếm. Bạn có thể tìm theo tên và lọc theo phim lẻ/phim bộ.",
      },
      {
        question: "Tôi có thể tải phim để xem offline không?",
        answer:
          "Hiện tại chưa hỗ trợ xem offline. Nội dung cần được phát trực tuyến khi có kết nối internet.",
      },
      {
        question: "Làm sao để thêm phim vào yêu thích?",
        answer:
          "Nhấn biểu tượng trái tim trên thẻ phim/phim bộ để thêm vào danh sách yêu thích. Bạn có thể xem toàn bộ trong trang tài khoản.",
      },
      {
        question: "Có những mức chất lượng video nào?",
        answer:
          "Chất lượng video phụ thuộc vào thiết bị và tốc độ mạng. Trình phát sẽ tự điều chỉnh để có trải nghiệm phù hợp.",
      },
      {
        question: "Tôi có thể theo dõi tập đã xem của phim bộ không?",
        answer:
          "Hiện tại việc theo dõi tập đã xem hoạt động trong luồng xem phim bộ. Trang Continue Watching riêng đang được phát triển.",
      },
      {
        question: "Tôi có thể đánh giá và nhận xét phim không?",
        answer: "Có. Bạn có thể đánh giá và bình luận ở trang chi tiết nội dung.",
      },
      {
        question: "Bao lâu thì có nội dung mới?",
        answer:
          "Kho nội dung được cập nhật thường xuyên. Hãy theo dõi trang chủ và mục thịnh hành để xem nội dung mới nhất.",
      },
      {
        question: "Tôi quên mật khẩu thì làm sao?",
        answer:
          'Nhấn "Quên mật khẩu" ở trang đăng nhập và làm theo hướng dẫn để đặt lại mật khẩu qua email.',
      },
      {
        question: "Làm sao để xóa tài khoản?",
        answer:
          "Vui lòng liên hệ đội ngũ hỗ trợ qua support@moviestream.com. Chúng tôi sẽ xử lý trong vòng 48 giờ.",
      },
      {
        question: "Vì sao video không phát?",
        answer:
          "Hãy thử tải lại trang, xóa cache trình duyệt hoặc kiểm tra kết nối mạng. Nếu vẫn lỗi, vui lòng liên hệ hỗ trợ.",
      },
      {
        question: "Tôi có thể đổi email không?",
        answer:
          "Có. Bạn có thể cập nhật email trong phần cài đặt tài khoản và xác minh email mới sau khi thay đổi.",
      },
      {
        question: "Làm sao để báo cáo nội dung không phù hợp?",
        answer:
          "Nếu gặp nội dung không phù hợp, vui lòng gửi email tới support@moviestream.com kèm thông tin chi tiết.",
      },
    ],
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about MovieStream",
    stillHaveQuestions: "Still have questions?",
    contactDescription:
      "Can't find the answer you're looking for? Feel free to reach out to our support team.",
    contactSupport: "Contact Support",
    items: [
      {
        question: "How do I create an account?",
        answer:
          'Click the "Login" button in the top right corner, then select "Sign Up" to create a new account. You can also sign up using your Google account for faster registration.',
      },
      {
        question: "Is MovieStream free to use?",
        answer:
          "Yes, MovieStream offers free access to a wide selection of movies and TV shows. Some premium content may require a subscription in the future.",
      },
      {
        question: "What devices can I watch on?",
        answer:
          "MovieStream is accessible on any device with a web browser, including desktop computers, laptops, tablets, and smartphones. We support all major browsers like Chrome, Firefox, Safari, and Edge.",
      },
      {
        question: "How do I search for movies or TV shows?",
        answer:
          "Click the search icon in the top navigation bar or press Ctrl+K (Cmd+K on Mac) to open the search modal. You can search by title and filter results by Movies, TV Shows, or view all results.",
      },
      {
        question: "Can I download movies to watch offline?",
        answer:
          "Currently, offline viewing is not supported. All content must be streamed online with an active internet connection.",
      },
      {
        question: "How do I add movies to my favorites?",
        answer:
          "Click the heart icon on any movie or TV show card to add it to your favorites. You can view all your favorites by visiting your account page.",
      },
      {
        question: "What video quality is available?",
        answer:
          "We offer multiple video quality options depending on your internet connection and device capabilities. The player will automatically adjust quality for the best viewing experience.",
      },
      {
        question: "How can I track watched episodes for TV series?",
        answer:
          "At the moment, episode tracking is available only inside TV series viewing flow. A dedicated Continue Watching page is not available yet.",
      },
      {
        question: "Can I rate and review movies?",
        answer:
          "Yes, you can rate movies and TV shows on their detail pages. Your ratings help us provide better recommendations.",
      },
      {
        question: "How often is new content added?",
        answer:
          "We regularly update our library with new movies and TV shows. Check the homepage and trending section for the latest additions.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          'Click "Forgot Password" on the login page and follow the instructions to reset your password via email.',
      },
      {
        question: "How do I delete my account?",
        answer:
          "To delete your account, please contact our support team at support@moviestream.com. We will process your request within 48 hours.",
      },
      {
        question: "Why is a video not playing?",
        answer:
          "If a video won't play, try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, please contact support.",
      },
      {
        question: "Can I change my email address?",
        answer:
          "Yes, you can update your email address in your account settings. Make sure to verify the new email address after making changes.",
      },
      {
        question: "How do I report inappropriate content?",
        answer:
          "If you encounter inappropriate content, please contact us immediately at support@moviestream.com with details about the content in question.",
      },
    ],
  },
};

export const getFaqUiMessages = (
  language: string | undefined
): FaqUiMessages => FAQ_MESSAGES[resolveUiLocale(language)];

export interface AdminUiMessages {
  dashboard: string;
  settings: string;
  content: string;
  users: string;
  analytics: string;
  notifications: string;
  aiChat: string;
  seo: string;
  syncData: string;
  profile: string;
  logout: string;
  backToSite: string;
  editProfile: string;
  updateInfo: string;
  displayName: string;
  email: string;
  password: string;
  cancel: string;
  save: string;
  saving: string;
  
  // Dashboard
  adminDashboard: string;
  overview: string;
  totalMovies: string;
  totalTVSeries: string;
  totalUsers: string;
  totalContent: string;
  failedStats: string;
  dataSync: string;
  lastSync: string;
  popularRefresh: string;
  popularRefreshDesc: string;
  fullDailySync: string;
  fullDailySyncDesc: string;
  quickActions: string;
  manageContent: string;
  manageContentDesc: string;
  userManagement: string;
  userManagementDesc: string;
  viewAnalytics: string;
  viewAnalyticsDesc: string;
  
  // Settings Page
  siteSettings: string;
  adjustConstraints: string;
  saveChanges: string;
  registrationItems: string;
  condition: string;
  item: string;
  visualEffectsSettings: string;
  controlVisualEffects: string;
  swaggerAccess: string;
  swaggerDesc: string;
  username: string;
  passwordPlaceholder: string;
  atLeast8Chars: string;
  saveAccess: string;
  swaggerStatus: string;
  configured: string;
  notConfigured: string;
  updatedAtLabel: string;
  modifiedBy: string;
  streamDomains: string;
  streamDomainsDesc: string;
  streamDomainsPlaceholder: string;
  streamDomainsTip: string;
  saveStreamDomains: string;
  loadingLabel: string;

  // Users Page
  userHeaderTitle: string;
  userHeaderDesc: string;
  
  // Sync Data
  syncDataHeaderTitle: string;
  syncDataHeaderDesc: string;
  syncStatsMovies: string;
  syncStatsTv: string;
  syncStatsLastSync: string;
  syncStatsStatus: string;
  syncOptionAll: string;
  syncOptionAllDesc: string;
  syncOptionMovies: string;
  syncOptionMoviesDesc: string;
  syncOptionTv: string;
  syncOptionTvDesc: string;
  syncOptionPopular: string;
  syncOptionPopularDesc: string;
  syncOptionTrending: string;
  syncOptionTrendingDesc: string;
  syncOptionToday: string;
  syncOptionTodayDesc: string;

  // SEO Page
  seoHeaderTitle: string;
  seoHeaderDesc: string;
  seoTotalPages: string;
  seoActive: string;
  seoInactive: string;
  seoAvgTitleLength: string;
  seoAvgDescLength: string;
  seoIdealTitle: string;
  seoIdealDesc: string;
  seoAllTracked: string;
  seoCurrentlyEnabled: string;
  seoDisabledOrDraft: string;

  // Notifications Page
  notificationsHeaderTitle: string;
  notificationsHeaderDesc: string;

  // Analytics Page
  analyticsHeaderTitle: string;
  analyticsHeaderDesc: string;

  // Chat Page
  chatHeaderTitle: string;
  chatHeaderDesc: string;

  // Users Page Extra
  userFilterLabel: string;
  statusAll: string;
  statusActive: string;
  statusBanned: string;
  tableHeaderUser: string;
  tableHeaderRole: string;
  tableHeaderStatus: string;
  tableHeaderSignupAccess: string;
  tableHeaderCountry: string;
  tableHeaderDeviceIp: string;
  tableHeaderActions: string;
  actionDetails: string;
  actionBan: string;
  actionUnban: string;
  noUsersFound: string;
  loading: string;
  signupAccessRegister: string;
  signupAccessLogin: string;
  banUserTitle: string;
  banUserConfirm: string;
  banReasonPlaceholder: string;
  banConfirmButton: string;

  // Sync Data Extra
  syncControlsTitle: string;
  syncControlsDesc: string;
  syncExportDateLabel: string;
  syncButtonRun: string;
  syncButtonSyncing: string;
  catalogSettingsTitle: string;
  catalogSettingsDesc: string;
  catalogMovieLimitLabel: string;
  catalogTvLimitLabel: string;
  catalogTrendingLimitLabel: string;
  catalogPeopleLimitLabel: string;
  catalogRecommendationLimitLabel: string;
  catalogCurrentValueLabel: string;
  catalogSaveButton: string;
  catalogSavingButton: string;
  syncNotesTitle: string;
  syncNoteTMDBLimits: string;
  syncNoteSyncStatus: string;
  syncNoteBackgroundJobs: string;

  // SEO Page Extra
  seoCheckerLastRun: string;
  seoStatsTotalPagesDesc: string;
  seoStatsActivePagesDesc: string;
  seoStatsInactivePagesDesc: string;
  seoStatsIdealTitle: string;
  seoStatsIdealDesc: string;
  seoToolbarAddButton: string;
  seoToolbarSetupDefaultsButton: string;
  seoToolbarRefreshButton: string;
  seoToolbarAutoRefreshLabel: string;
  seoToolbarSearchPlaceholder: string;
  seoToolbarExportCsvButton: string;
  seoToolbarExportExcelButton: string;
  seoResolveTitle: string;
  seoResolvePlaceholder: string;
  seoResolveButton: string;
  seoResolveButtonLoading: string;
  seoTableHeaderPage: string;
  seoTableHeaderLocale: string;
  seoTableHeaderTitle: string;
  seoTableHeaderDescription: string;
  seoTableHeaderStatus: string;
  seoTableHeaderActions: string;
  seoTableNoData: string;
  seoTableLoading: string;
  seoTableActionEdit: string;
  seoTableActionDelete: string;
  seoModalTitleAdd: string;
  seoModalTitleEdit: string;
  seoModalLabelPageType: string;
  seoModalLabelPath: string;
  seoModalLabelLocale: string;
  seoModalLabelTitle: string;
  seoModalLabelDescription: string;
  seoModalLabelKeywords: string;
  seoModalLabelOgTitle: string;
  seoModalLabelOgDescription: string;
  seoModalLabelOgImage: string;
  seoModalLabelTwitterTitle: string;
  seoModalLabelTwitterDescription: string;
  seoModalLabelTwitterImage: string;
  seoModalLabelActive: string;
  seoModalButtonCancel: string;
  seoModalButtonCreate: string;
  seoModalButtonUpdate: string;
  seoPageTypeSelectPlaceholder: string;
  seoPageTypeMatchHint: string;

  // Analytics Extra
  analyticsTopContent: string;
  analyticsMostViewedEvents: string;
  analyticsMostFavorited: string;
  analyticsNoPopularData: string;
  analyticsNoViewEventsData: string;
  analyticsNoFavoriteData: string;
  // StatsCards
  analyticsEventsView: string;
  analyticsEventsClick: string;
  analyticsEventsPlay: string;
  analyticsClicksOverViews: string;
  analyticsSavedItems: string;
  analyticsFavoritesOverViews: string;
  // PlaySourceBreakdown
  analyticsPlayBreakdownTitle: string;
  analyticsPlayBreakdownHint: string;
  analyticsPlayBreakdownEmpty: string;
  analyticsPlaySourceCardWatch: string;
  analyticsPlaySourceHoverWatch: string;
  analyticsPlaySourceHeroWatch: string;
  analyticsPlaySourceWatchPagePlay: string;
  analyticsPlaySourceUnknown: string;
  // Charts
  analyticsViewsOverTime: string;
  analyticsFavoritesOverTime: string;
  analyticsChartConstraint: string;
  analyticsNoDataPeriod: string;
  // Device & Country
  analyticsDeviceDistribution: string;
  analyticsNoDeviceData: string;
  analyticsTopCountries: string;
  analyticsNoCountryData: string;
  // ContentList
  analyticsExport: string;
  analyticsViews: string;
  analyticsFavoritesLabel: string;
  analyticsEvents: string;

  // Chat extra
  chatModerationTitle: string;
  chatModerationDesc: string;
  chatSectionOpenFlags: string;
  chatSectionConversationContext: string;
  chatNoOpenFlags: string;
  chatSelectFlagPrompt: string;
  chatSessionUserLabel: string;
  chatButtonResolve: string;
  chatButtonIgnore: string;
  chatUnknownUser: string;

  // Layout Metrics & read-only
  totalViews: string;
  totalClicks: string;
  totalPlays: string;
  ctr: string;
  favorites: string;
  favoriteRate: string;
  readOnlyMode: string;

  // Banned Words Page
  bannedWords: string;
  bannedWordsHeaderTitle: string;
  bannedWordsHeaderDesc: string;
  tableHeaderWord: string;
  tableHeaderSeverity: string;
  tableHeaderAction: string;
  addWordButton: string;
  severityLow: string;
  severityMedium: string;
  severityHigh: string;
  actionFilter: string;
  actionBlock: string;
  actionFlag: string;
}

const ADMIN_MESSAGES: Record<UiLocale, AdminUiMessages> = {
  vi: {
    dashboard: "Bảng điều khiển",
    settings: "Cài đặt hệ thống",
    content: "Quản lý phim",
    users: "Người dùng",
    analytics: "Số liệu phân tích",
    notifications: "Gửi thông báo",
    aiChat: "AI Trợ lý",
    seo: "Cấu hình SEO",
    syncData: "Đồng bộ dữ liệu",
    profile: "Hồ sơ cá nhân",
    logout: "Đăng xuất",
    backToSite: "Về trang chủ",
    editProfile: "Chỉnh sửa hồ sơ",
    updateInfo: "Cập nhật thông tin cá nhân của bạn",
    displayName: "Tên hiển thị",
    email: "Địa chỉ Email",
    password: "Mật khẩu (để trống để giữ nguyên)",
    cancel: "Hủy bỏ",
    save: "Lưu lại",
    saving: "Đang lưu...",
    adminDashboard: "Bảng Điều Khiển Admin",
    overview: "Tổng quan hoạt động hệ thống xem phim",
    totalMovies: "Tổng số phim lẻ",
    totalTVSeries: "Tổng số phim bộ",
    totalUsers: "Tổng người dùng",
    totalContent: "Tổng nội dung",
    failedStats: "Không thể tải số liệu thống kê dashboard",
    dataSync: "Đồng bộ dữ liệu",
    lastSync: "Đồng bộ cuối",
    popularRefresh: "Đồng bộ phim phổ biến",
    popularRefreshDesc: "Đồng bộ nhanh các nội dung nổi bật và thịnh hành",
    fullDailySync: "Đồng bộ TMDB đầy đủ",
    fullDailySyncDesc: "Xuất và đồng bộ hoàn chỉnh toàn bộ dữ liệu từ TMDB",
    quickActions: "Thao tác nhanh",
    manageContent: "Quản lý phim",
    manageContentDesc: "Xem và quản lý tất cả danh sách phim lẻ & phim bộ",
    userManagement: "Quản lý thành viên",
    userManagementDesc: "Xem, phân quyền và quản lý tài khoản người dùng",
    viewAnalytics: "Thống kê chi tiết",
    viewAnalyticsDesc: "Xem chi tiết lưu lượng, hành vi và báo cáo hệ thống",
    
    // Settings Page
    siteSettings: "Cấu hình hệ thống",
    adjustConstraints: "Điều chỉnh giới hạn đăng ký và các hiệu ứng giao diện",
    saveChanges: "Lưu thay đổi",
    registrationItems: "Các mục đăng ký tài khoản",
    condition: "Điều kiện (Độ dài)",
    item: "Mục đăng ký",
    visualEffectsSettings: "Cài đặt hiệu ứng đặc biệt",
    controlVisualEffects: "Bật/Tắt các hiệu ứng hiển thị tới người dùng",
    swaggerAccess: "Quyền truy cập Swagger APIs",
    swaggerDesc: "Tài khoản bảo mật để mở tài liệu API tại /api-docs. Mật khẩu được mã hóa.",
    username: "Tài khoản",
    passwordPlaceholder: "Bỏ trống nếu muốn giữ nguyên mật khẩu cũ",
    atLeast8Chars: "Tối thiểu 8 ký tự",
    saveAccess: "Lưu tài khoản API",
    swaggerStatus: "Trạng thái",
    configured: "Đã thiết lập",
    notConfigured: "Chưa thiết lập",
    updatedAtLabel: "Cập nhật lúc",
    modifiedBy: "Chỉnh sửa bởi",
    streamDomains: "Tên miền Stream (Fallback)",
    streamDomainsDesc: "Mỗi tên miền trên một dòng. Dòng đầu tiên sẽ là nguồn phát chính, các dòng tiếp theo là dự phòng.",
    streamDomainsPlaceholder: "Nhập các link domain stream, ví dụ: https://vsembed.ru",
    streamDomainsTip: "Gợi ý: Bạn có thể nhập các tên miền cách nhau bằng dấu xuống dòng hoặc dấu phẩy.",
    saveStreamDomains: "Lưu danh sách tên miền",
    loadingLabel: "Đang tải dữ liệu...",

    // Users Page
    userHeaderTitle: "Quản lý thành viên",
    userHeaderDesc: "Xem, phân quyền và quản lý tài khoản người dùng trên toàn hệ thống.",
    
    // Sync Data
    syncDataHeaderTitle: "Đồng bộ dữ liệu TMDB",
    syncDataHeaderDesc: "Kích hoạt thủ công các tiến trình đồng bộ phim và danh mục từ TMDB. Dùng khi bạn cần cập nhật thông tin phim ngay lập tức.",
    syncStatsMovies: "Tổng số phim lẻ",
    syncStatsTv: "Tổng số phim bộ",
    syncStatsLastSync: "Đồng bộ gần nhất",
    syncStatsStatus: "Trạng thái đồng bộ",
    syncOptionAll: "Đồng bộ tất cả",
    syncOptionAllDesc: "Nhập toàn bộ danh mục bao gồm phim lẻ, phim bộ và phim thịnh hành.",
    syncOptionMovies: "Đồng bộ phim lẻ",
    syncOptionMoviesDesc: "Chỉ cập nhật danh mục phim lẻ.",
    syncOptionTv: "Đồng bộ phim bộ",
    syncOptionTvDesc: "Chỉ cập nhật danh mục phim bộ.",
    syncOptionPopular: "Đồng bộ phim phổ biến",
    syncOptionPopularDesc: "Cập nhật nhanh các danh sách phim phổ biến và thịnh hành.",
    syncOptionTrending: "Chỉ đồng bộ Trending",
    syncOptionTrendingDesc: "Cập nhật cache trang chủ và trang xu hướng.",
    syncOptionToday: "Danh sách mới trong ngày",
    syncOptionTodayDesc: "Tải về các bản xuất mới nhất trong ngày từ TMDB.",

    // SEO Page
    seoHeaderTitle: "Cấu hình & Quản lý SEO",
    seoHeaderDesc: "Theo dõi, chỉnh sửa thẻ tiêu đề và mô tả meta giúp các công cụ tìm kiếm index tốt hơn.",
    seoTotalPages: "Tổng số trang",
    seoActive: "Hoạt động",
    seoInactive: "Không hoạt động",
    seoAvgTitleLength: "Độ dài tiêu đề TB",
    seoAvgDescLength: "Độ dài mô tả TB",
    seoIdealTitle: "Khuyên dùng: 50–60 ký tự",
    seoIdealDesc: "Khuyên dùng: 150–160 ký tự",
    seoAllTracked: "Tổng số trang SEO được theo dõi",
    seoCurrentlyEnabled: "Các mục SEO đang được áp dụng",
    seoDisabledOrDraft: "Các mục SEO đã tắt hoặc nháp",

    // Notifications Page
    notificationsHeaderTitle: "Quản lý thông báo",
    notificationsHeaderDesc: "Tạo mới, xem và quản lý các thông báo hệ thống gửi tới người dùng.",

    // Analytics Page
    analyticsHeaderTitle: "Báo cáo phân tích hệ thống",
    analyticsHeaderDesc: "Phân tích lượt truy cập, lượt click phát phim, thiết bị và các quốc gia phổ biến.",

    // Chat Page
    chatHeaderTitle: "AI Trợ lý Quản trị",
    chatHeaderDesc: "Trợ lý AI hỗ trợ bạn tra cứu phim, phân tích người dùng và đưa ra gợi ý vận hành.",

    // Users Page Extra
    userFilterLabel: "Lọc theo trạng thái để nhanh chóng xem xét các tài khoản hoạt động và bị cấm.",
    statusAll: "Tất cả",
    statusActive: "Hoạt động",
    statusBanned: "Bị cấm",
    tableHeaderUser: "Người dùng",
    tableHeaderRole: "Vai trò",
    tableHeaderStatus: "Trạng thái",
    tableHeaderSignupAccess: "Đăng ký / Truy cập",
    tableHeaderCountry: "Quốc gia",
    tableHeaderDeviceIp: "Thiết bị / IP",
    tableHeaderActions: "Thao tác",
    actionDetails: "Chi tiết",
    actionBan: "Cấm",
    actionUnban: "Bỏ cấm",
    noUsersFound: "Không tìm thấy người dùng",
    loading: "Đang tải...",
    signupAccessRegister: "Đăng ký",
    signupAccessLogin: "Đăng nhập",
    banUserTitle: "Cấm người dùng",
    banUserConfirm: "Cấm người dùng \"{name}\" ({email})",
    banReasonPlaceholder: "Nhập lý do cấm...",
    banConfirmButton: "Cấm người dùng",

    // Sync Data Extra
    syncControlsTitle: "Điều khiển đồng bộ thủ công",
    syncControlsDesc: "Chọn dữ liệu bạn muốn làm mới. Bạn có thể tùy chọn chọn một ngày xuất TMDB trước đây (YYYY-MM-DD). Để trống để sử dụng ngày hôm nay.",
    syncExportDateLabel: "Ngày xuất TMDB (tùy chọn)",
    syncButtonRun: "Chạy",
    syncButtonSyncing: "Đang đồng bộ...",
    catalogSettingsTitle: "Cài đặt giới hạn danh mục",
    catalogSettingsDesc: "Cấu hình số lượng mục tối đa để giữ lại trong cơ sở dữ liệu cho từng loại nội dung. Tiến trình dọn dẹp sẽ chạy sau khi \"Đồng bộ phim phổ biến\" để cắt bớt các mục dư thừa dựa trên mức độ phổ biến.",
    catalogMovieLimitLabel: "Giới hạn danh mục phim lẻ",
    catalogTvLimitLabel: "Giới hạn danh mục phim bộ",
    catalogTrendingLimitLabel: "Giới hạn danh mục thịnh hành",
    catalogPeopleLimitLabel: "Giới hạn cache diễn viên/đạo diễn",
    catalogRecommendationLimitLabel: "Giới hạn cache gợi ý",
    catalogCurrentValueLabel: "Hiện tại: {value}",
    catalogSaveButton: "Lưu cài đặt",
    catalogSavingButton: "Đang lưu...",
    syncNotesTitle: "Ghi chú & Khuyến nghị",
    syncNoteTMDBLimits: "• Giữ tần suất đồng bộ phù hợp với giới hạn của TMDB. Đồng bộ thủ công nên được sử dụng hạn chế trên môi trường thực tế.",
    syncNoteSyncStatus: "• Bảng điều khiển trên phản ánh bản ghi đồng bộ gần đây nhất được lưu trữ trong bảng `sync_status`.",
    syncNoteBackgroundJobs: "• Khi lên lịch đồng bộ định kỳ, hãy ưu tiên các tiến trình nền qua cron hoặc queue worker thay vì kích hoạt thủ công.",

    // SEO Page Extra
    seoCheckerLastRun: "Lần kiểm tra cuối: {date}, {summary}",
    seoStatsTotalPagesDesc: "Tổng số trang SEO được theo dõi",
    seoStatsActivePagesDesc: "Các mục SEO đang được áp dụng",
    seoStatsInactivePagesDesc: "Các mục SEO đã tắt hoặc nháp",
    seoStatsIdealTitle: "Khuyên dùng: 50–60 ký tự",
    seoStatsIdealDesc: "Khuyên dùng: 150–160 ký tự",
    seoToolbarAddButton: "Thêm SEO Metadata",
    seoToolbarSetupDefaultsButton: "Thiết lập mặc định",
    seoToolbarRefreshButton: "Làm mới ngay",
    seoToolbarAutoRefreshLabel: "Tự động làm mới (30s)",
    seoToolbarSearchPlaceholder: "Tìm kiếm trang...",
    seoToolbarExportCsvButton: "Xuất bản CSV",
    seoToolbarExportExcelButton: "Xuất bản Excel",
    seoResolveTitle: "Thử nghiệm Resolve SEO",
    seoResolvePlaceholder: "/movies hoặc /movie/[id]",
    seoResolveButton: "Resolve",
    seoResolveButtonLoading: "Đang xử lý...",
    seoTableHeaderPage: "Trang",
    seoTableHeaderLocale: "Ngôn ngữ",
    seoTableHeaderTitle: "Tiêu đề",
    seoTableHeaderDescription: "Mô tả",
    seoTableHeaderStatus: "Trạng thái",
    seoTableHeaderActions: "Thao tác",
    seoTableNoData: "Không tìm thấy dữ liệu SEO",
    seoTableLoading: "Đang tải...",
    seoTableActionEdit: "Sửa",
    seoTableActionDelete: "Xóa",
    seoModalTitleAdd: "Thêm mới SEO Metadata",
    seoModalTitleEdit: "Chỉnh sửa SEO Metadata",
    seoModalLabelPageType: "Loại trang",
    seoModalLabelPath: "Đường dẫn",
    seoModalLabelLocale: "Ngôn ngữ",
    seoModalLabelTitle: "Tiêu đề",
    seoModalLabelDescription: "Mô tả",
    seoModalLabelKeywords: "Từ khóa (cách nhau bằng dấu phẩy)",
    seoModalLabelOgTitle: "Tiêu đề OG",
    seoModalLabelOgDescription: "Mô tả OG",
    seoModalLabelOgImage: "Đường dẫn ảnh OG",
    seoModalLabelTwitterTitle: "Tiêu đề Twitter",
    seoModalLabelTwitterDescription: "Mô tả Twitter",
    seoModalLabelTwitterImage: "Đường dẫn ảnh Twitter",
    seoModalLabelActive: "Hoạt động",
    seoModalButtonCancel: "Hủy bỏ",
    seoModalButtonCreate: "Tạo mới",
    seoModalButtonUpdate: "Cập nhật",
    seoPageTypeSelectPlaceholder: "Chọn loại trang",
    seoPageTypeMatchHint: "Phải khớp với enum backend: home, movies, tv_series, trending, browse, favorites, people, custom.",

    // Analytics Extra
    analyticsTopContent: "Nội dung hàng đầu (Lượt xem)",
    analyticsMostViewedEvents: "Xem nhiều nhất (Sự kiện)",
    analyticsMostFavorited: "Yêu thích nhiều nhất",
    analyticsNoPopularData: "Không có dữ liệu nội dung phổ biến",
    analyticsNoViewEventsData: "Không có dữ liệu sự kiện xem",
    analyticsNoFavoriteData: "Không có dữ liệu yêu thích",
    // StatsCards
    analyticsEventsView: "Sự kiện theo dõi (VIEW)",
    analyticsEventsClick: "Sự kiện theo dõi (CLICK)",
    analyticsEventsPlay: "Sự kiện theo dõi (PLAY)",
    analyticsClicksOverViews: "Clicks / Lượt xem",
    analyticsSavedItems: "Mục đã lưu",
    analyticsFavoritesOverViews: "Yêu thích / Lượt xem",
    // PlaySourceBreakdown
    analyticsPlayBreakdownTitle: "Phân tích nút phát",
    analyticsPlayBreakdownHint: "Dữ liệu nguồn từ sự kiện phát",
    analyticsPlayBreakdownEmpty: "Chưa có dữ liệu nguồn phát.",
    analyticsPlaySourceCardWatch: "Nút xem thẻ",
    analyticsPlaySourceHoverWatch: "Xem khi di chuột",
    analyticsPlaySourceHeroWatch: "Nút xem Hero",
    analyticsPlaySourceWatchPagePlay: "Nút phát trang xem",
    analyticsPlaySourceUnknown: "Không xác định",
    // Charts
    analyticsViewsOverTime: "Lượt xem theo thời gian",
    analyticsFavoritesOverTime: "Yêu thích theo thời gian",
    analyticsChartConstraint: "Xu hướng giới hạn 30 ngày gần nhất (ràng buộc backend)",
    analyticsNoDataPeriod: "Không có dữ liệu cho khoảng thời gian đã chọn",
    // Device & Country
    analyticsDeviceDistribution: "Phân bố thiết bị",
    analyticsNoDeviceData: "Không có dữ liệu thiết bị",
    analyticsTopCountries: "Quốc gia hàng đầu",
    analyticsNoCountryData: "Không có dữ liệu quốc gia",
    // ContentList
    analyticsExport: "Xuất",
    analyticsViews: "lượt xem",
    analyticsFavoritesLabel: "yêu thích",
    analyticsEvents: "sự kiện",


    // Chat extra
    chatModerationTitle: "Kiểm duyệt AI Chat",
    chatModerationDesc: "Xem xét các cuộc hội thoại chatbot bị gắn cờ trước khi thực hiện các hành động tài khoản.",
    chatSectionOpenFlags: "Cờ đang mở",
    chatSectionConversationContext: "Bối cảnh cuộc hội thoại",
    chatNoOpenFlags: "Không có cờ nào đang mở.",
    chatSelectFlagPrompt: "Chọn một cờ để kiểm tra phiên trò chuyện liên quan.",
    chatSessionUserLabel: "Phiên #{id} · {user}",
    chatButtonResolve: "Giải quyết cờ #{id}",
    chatButtonIgnore: "Bỏ qua",
    chatUnknownUser: "người dùng không xác định",

    totalViews: "Tổng lượt xem",
    totalClicks: "Tổng lượt click",
    totalPlays: "Tổng lượt phát",
    ctr: "Tỷ lệ click (CTR)",
    favorites: "Yêu thích",
    favoriteRate: "Tỷ lệ yêu thích",
    readOnlyMode: "Chế độ chỉ đọc - Các thay đổi sẽ không được lưu",

    // Banned Words Page
    bannedWords: "Quản lý từ cấm",
    bannedWordsHeaderTitle: "Danh sách từ cấm",
    bannedWordsHeaderDesc: "Quản lý danh sách các từ bị cấm, tự động lọc hoặc gắn cờ bình luận vi phạm.",
    tableHeaderWord: "Từ cấm",
    tableHeaderSeverity: "Mức độ nghiêm trọng",
    tableHeaderAction: "Hành động",
    addWordButton: "Thêm từ cấm",
    severityLow: "Thấp",
    severityMedium: "Trung bình",
    severityHigh: "Cao",
    actionFilter: "Ẩn bằng ***",
    actionBlock: "Chặn bình luận",
    actionFlag: "Đánh dấu cờ",
  },
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    content: "Content",
    users: "Users",
    analytics: "Analytics",
    notifications: "Notifications",
    aiChat: "AI Chat",
    seo: "SEO",
    syncData: "Sync Data",
    profile: "Profile",
    logout: "Logout",
    backToSite: "Back to Site",
    editProfile: "Edit Profile",
    updateInfo: "Update your information",
    displayName: "Display name",
    email: "Email",
    password: "Password (leave blank to keep current)",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    adminDashboard: "Admin Dashboard",
    overview: "Overview of your movie streaming platform",
    totalMovies: "Total Movies",
    totalTVSeries: "Total TV Series",
    totalUsers: "Total Users",
    totalContent: "Total Content",
    failedStats: "Failed to load dashboard statistics",
    dataSync: "Data Synchronization",
    lastSync: "Last Sync",
    popularRefresh: "Popular Refresh",
    popularRefreshDesc: "Quick sync of popular and trending content",
    fullDailySync: "Full Daily Export",
    fullDailySyncDesc: "Complete synchronization of all TMDB data",
    quickActions: "Quick Actions",
    manageContent: "Manage Content",
    manageContentDesc: "View and manage all movies and TV series",
    userManagement: "User Management",
    userManagementDesc: "View and manage registered users",
    viewAnalytics: "Analytics",
    viewAnalyticsDesc: "View platform statistics and insights",

    // Settings Page
    siteSettings: "Site Settings",
    adjustConstraints: "Adjust registration constraints and visual effects",
    saveChanges: "Save Changes",
    registrationItems: "Registration Items",
    condition: "Condition",
    item: "Item",
    visualEffectsSettings: "Visual Effects Settings",
    controlVisualEffects: "Control visual effects displayed to all users",
    swaggerAccess: "Swagger Access",
    swaggerDesc: "Credentials required to open API docs at /api-docs. Password is stored as a hash.",
    username: "Username",
    passwordPlaceholder: "Leave blank to keep current password",
    atLeast8Chars: "At least 8 characters",
    saveAccess: "Save Access",
    swaggerStatus: "Status",
    configured: "Configured",
    notConfigured: "Not configured",
    updatedAtLabel: "Updated",
    modifiedBy: "Modified by",
    streamDomains: "Stream Domains",
    streamDomainsDesc: "One domain per line. The first domain is the primary source and the remaining domains are fallback sources.",
    streamDomainsPlaceholder: "https://vsembed.ru\nhttps://vsembed.su",
    streamDomainsTip: "Tip: You can paste domains separated by newline or comma.",
    saveStreamDomains: "Save Stream Domains",
    loadingLabel: "Loading...",

    // Users Page
    userHeaderTitle: "User Management",
    userHeaderDesc: "View and manage registered user accounts and roles.",
    
    // Sync Data
    syncDataHeaderTitle: "Data Synchronization",
    syncDataHeaderDesc: "Manually trigger TMDB import jobs for movies and TV series. Use this when you need fresh catalog data immediately.",
    syncStatsMovies: "Total Movies",
    syncStatsTv: "Total TV Series",
    syncStatsLastSync: "Last Sync",
    syncStatsStatus: "Sync Status",
    syncOptionAll: "Sync All",
    syncOptionAllDesc: "Full import: movies, TV series, trending content.",
    syncOptionMovies: "Sync Movies",
    syncOptionMoviesDesc: "Update movie catalog only.",
    syncOptionTv: "Sync TV Series",
    syncOptionTvDesc: "Update TV series catalog only.",
    syncOptionPopular: "Sync Popular Content",
    syncOptionPopularDesc: "Refresh popular movies, TV series, and trending lists.",
    syncOptionTrending: "Sync Trending Only",
    syncOptionTrendingDesc: "Refresh the homepage hero and trending page cache.",
    syncOptionToday: "Latest Exports",
    syncOptionTodayDesc: "Pull the most recent TMDB daily exports.",

    // SEO Page
    seoHeaderTitle: "SEO Management",
    seoHeaderDesc: "Monitor and tune metadata so search crawlers pick up the latest updates.",
    seoTotalPages: "Total Pages",
    seoActive: "Active",
    seoInactive: "Inactive",
    seoAvgTitleLength: "Avg Title Length",
    seoAvgDescLength: "Avg Description Length",
    seoIdealTitle: "Ideal: 50–60 chars",
    seoIdealDesc: "Ideal: 150–160 chars",
    seoAllTracked: "All tracked SEO entries",
    seoCurrentlyEnabled: "Currently enabled entries",
    seoDisabledOrDraft: "Disabled or draft entries",

    // Notifications Page
    notificationsHeaderTitle: "Notification Management",
    notificationsHeaderDesc: "Send, review, and manage notifications delivered to users.",

    // Analytics Page
    analyticsHeaderTitle: "System Analytics Reports",
    analyticsHeaderDesc: "Analyze traffic, stream clicks, device stats, and popular countries.",

    // Chat Page
    chatHeaderTitle: "AI Admin Assistant",
    chatHeaderDesc: "AI helper to query movie database, analyze user growth, and give platform insights.",

    // Users Page Extra
    userFilterLabel: "Filter by status to quickly review active and banned accounts.",
    statusAll: "All",
    statusActive: "Active",
    statusBanned: "Banned",
    tableHeaderUser: "User",
    tableHeaderRole: "Role",
    tableHeaderStatus: "Status",
    tableHeaderSignupAccess: "Sign Up / Access",
    tableHeaderCountry: "Country",
    tableHeaderDeviceIp: "Device / IP",
    tableHeaderActions: "Actions",
    actionDetails: "Details",
    actionBan: "Ban",
    actionUnban: "Unban",
    noUsersFound: "No users found",
    loading: "Loading...",
    signupAccessRegister: "Register",
    signupAccessLogin: "Login",
    banUserTitle: "Ban User",
    banUserConfirm: "Ban user \"{name}\" ({email})",
    banReasonPlaceholder: "Enter reason for banning...",
    banConfirmButton: "Ban User",

    // Sync Data Extra
    syncControlsTitle: "Manual Sync Controls",
    syncControlsDesc: "Choose the dataset you want to refresh. You may optionally pick a past TMDB export date (YYYY-MM-DD). Leave empty to use today's date.",
    syncExportDateLabel: "TMDB Export Date (optional)",
    syncButtonRun: "Run",
    syncButtonSyncing: "Syncing...",
    catalogSettingsTitle: "Catalog Size Settings",
    catalogSettingsDesc: "Configure maximum number of items to keep in the database for each content type. Cleanup runs after \"Sync Popular Content\" to trim excess items based on popularity.",
    catalogMovieLimitLabel: "Movie Catalog Limit",
    catalogTvLimitLabel: "TV Series Catalog Limit",
    catalogTrendingLimitLabel: "Trending Catalog Limit",
    catalogPeopleLimitLabel: "People Cache Limit",
    catalogRecommendationLimitLabel: "Recommendation Cache Limit",
    catalogCurrentValueLabel: "Current: {value}",
    catalogSaveButton: "Save Settings",
    catalogSavingButton: "Saving...",
    syncNotesTitle: "Notes & Recommendations",
    syncNoteTMDBLimits: "• Keep sync frequency aligned with TMDB rate limits. Manual sync should be used sparingly in production.",
    syncNoteSyncStatus: "• The dashboard above reflects the most recent sync record stored in the `sync_status` table.",
    syncNoteBackgroundJobs: "• When scheduling regular syncs, prefer background jobs via cron or queue workers instead of manual triggering.",

    // SEO Page Extra
    seoCheckerLastRun: "Last checker run: {date}, {summary}",
    seoStatsTotalPagesDesc: "All tracked SEO entries",
    seoStatsActivePagesDesc: "Currently enabled entries",
    seoStatsInactivePagesDesc: "Disabled or draft entries",
    seoStatsIdealTitle: "Ideal: 50–60 chars",
    seoStatsIdealDesc: "Ideal: 150–160 chars",
    seoToolbarAddButton: "Add SEO Metadata",
    seoToolbarSetupDefaultsButton: "Setup Defaults",
    seoToolbarRefreshButton: "Refresh now",
    seoToolbarAutoRefreshLabel: "Auto refresh (30s)",
    seoToolbarSearchPlaceholder: "Search pages...",
    seoToolbarExportCsvButton: "Export CSV",
    seoToolbarExportExcelButton: "Export Excel",
    seoResolveTitle: "SEO Resolve Test",
    seoResolvePlaceholder: "/movies or /movie/[id]",
    seoResolveButton: "Resolve",
    seoResolveButtonLoading: "Resolving...",
    seoTableHeaderPage: "Page",
    seoTableHeaderLocale: "Locale",
    seoTableHeaderTitle: "Title",
    seoTableHeaderDescription: "Description",
    seoTableHeaderStatus: "Status",
    seoTableHeaderActions: "Actions",
    seoTableNoData: "No SEO data found",
    seoTableLoading: "Loading...",
    seoTableActionEdit: "Edit",
    seoTableActionDelete: "Delete",
    seoModalTitleAdd: "Add SEO Metadata",
    seoModalTitleEdit: "Edit SEO Metadata",
    seoModalLabelPageType: "Page Type",
    seoModalLabelPath: "Path",
    seoModalLabelLocale: "Locale",
    seoModalLabelTitle: "Title",
    seoModalLabelDescription: "Description",
    seoModalLabelKeywords: "Keywords (comma-separated)",
    seoModalLabelOgTitle: "OG Title",
    seoModalLabelOgDescription: "OG Description",
    seoModalLabelOgImage: "OG Image URL",
    seoModalLabelTwitterTitle: "Twitter Title",
    seoModalLabelTwitterDescription: "Twitter Description",
    seoModalLabelTwitterImage: "Twitter Image URL",
    seoModalLabelActive: "Active",
    seoModalButtonCancel: "Cancel",
    seoModalButtonCreate: "Create",
    seoModalButtonUpdate: "Update",
    seoPageTypeSelectPlaceholder: "Select page type",
    seoPageTypeMatchHint: "Must match backend enum: home, movies, tv_series, trending, browse, favorites, people, custom.",

    // Analytics Extra
    analyticsTopContent: "Top Content (viewCount)",
    analyticsMostViewedEvents: "Most Viewed (events)",
    analyticsMostFavorited: "Most Favorited",
    analyticsNoPopularData: "No popular content data available",
    analyticsNoViewEventsData: "No view events data available",
    analyticsNoFavoriteData: "No favorite data available",
    // StatsCards
    analyticsEventsView: "Events tracked (VIEW)",
    analyticsEventsClick: "Events tracked (CLICK)",
    analyticsEventsPlay: "Events tracked (PLAY)",
    analyticsClicksOverViews: "Clicks / Views",
    analyticsSavedItems: "Saved items",
    analyticsFavoritesOverViews: "Favorites / Views",
    // PlaySourceBreakdown
    analyticsPlayBreakdownTitle: "Play Buttons Breakdown",
    analyticsPlayBreakdownHint: "Source metadata from play events",
    analyticsPlayBreakdownEmpty: "No play source data available yet.",
    analyticsPlaySourceCardWatch: "Card Watch",
    analyticsPlaySourceHoverWatch: "Hover Watch",
    analyticsPlaySourceHeroWatch: "Hero Watch",
    analyticsPlaySourceWatchPagePlay: "Watch Page Play",
    analyticsPlaySourceUnknown: "Unknown",
    // Charts
    analyticsViewsOverTime: "Views Over Time",
    analyticsFavoritesOverTime: "Favorites Over Time",
    analyticsChartConstraint: "Trend is limited to the last 30 days (backend constraint)",
    analyticsNoDataPeriod: "No data available for the selected period",
    // Device & Country
    analyticsDeviceDistribution: "Device Distribution",
    analyticsNoDeviceData: "No device data available",
    analyticsTopCountries: "Top Countries",
    analyticsNoCountryData: "No country data available",
    // ContentList
    analyticsExport: "Export",
    analyticsViews: "views",
    analyticsFavoritesLabel: "favorites",
    analyticsEvents: "events",

    // Chat extra
    chatModerationTitle: "AI Chat Moderation",
    chatModerationDesc: "Review flagged chatbot conversations before taking account actions.",
    chatSectionOpenFlags: "Open Flags",
    chatSectionConversationContext: "Conversation Context",
    chatNoOpenFlags: "No open flags.",
    chatSelectFlagPrompt: "Select a flag to inspect the related chat session.",
    chatSessionUserLabel: "Session #{id} · {user}",
    chatButtonResolve: "Resolve flag #{id}",
    chatButtonIgnore: "Ignore",
    chatUnknownUser: "unknown user",

    totalViews: "Total Views",
    totalClicks: "Total Clicks",
    totalPlays: "Total Plays",
    ctr: "CTR",
    favorites: "Favorites",
    favoriteRate: "Favorite Rate",
    readOnlyMode: "Read-Only Mode - Changes will not be saved",

    // Banned Words Page
    bannedWords: "Banned Words",
    bannedWordsHeaderTitle: "Banned Words Management",
    bannedWordsHeaderDesc: "Manage the list of banned words to automatically filter or flag abusive comments.",
    tableHeaderWord: "Banned Word",
    tableHeaderSeverity: "Severity",
    tableHeaderAction: "Action",
    addWordButton: "Add Word",
    severityLow: "Low",
    severityMedium: "Medium",
    severityHigh: "High",
    actionFilter: "Censor (***)",
    actionBlock: "Block Comment",
    actionFlag: "Flag for Review",
  },
};

export const getAdminUiMessages = (
  language: string | undefined
): AdminUiMessages => ADMIN_MESSAGES[resolveUiLocale(language)];
