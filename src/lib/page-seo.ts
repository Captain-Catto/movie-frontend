import type { BrowseFetchType } from "@/lib/page-data.types";
import type { CategoryListingRouteKey } from "@/lib/ui-messages";
import { resolveUiLocale } from "@/lib/ui-messages";

export interface SeoEntry {
  title: string;
  description: string;
}

type SeoLocale = "vi" | "en";

const STATIC_PAGE_SEO: Record<
  SeoLocale,
  {
    home: SeoEntry;
    movies: SeoEntry;
    tv: SeoEntry;
    trending: SeoEntry;
    people: SeoEntry;
    account: SeoEntry;
    favorites: SeoEntry;
    notifications: SeoEntry;
    faq: SeoEntry;
    oauthCallback: SeoEntry;
    browseMovie: SeoEntry;
    browseTv: SeoEntry;
    browseTrending: SeoEntry;
    categories: Record<CategoryListingRouteKey, SeoEntry>;
    movieDetailFallback: SeoEntry;
    tvDetailFallback: SeoEntry;
    peopleDetailFallback: SeoEntry;
    watchFallback: SeoEntry;
  }
> = {
  vi: {
    home: {
      title: "Trang chủ",
      description:
        "Khám phá phim lẻ, phim bộ thịnh hành và nội dung mới nhất trên MovieStream.",
    },
    movies: {
      title: "Phim lẻ",
      description:
        "Xem danh sách phim lẻ mới, phổ biến và được đánh giá cao trên MovieStream.",
    },
    tv: {
      title: "Phim bộ",
      description:
        "Khám phá phim bộ đang phát sóng, phổ biến và đánh giá cao trên MovieStream.",
    },
    trending: {
      title: "Thịnh hành",
      description:
        "Theo dõi các phim và series đang thịnh hành được người xem quan tâm nhiều nhất.",
    },
    people: {
      title: "Diễn viên & Đạo diễn",
      description:
        "Tìm hiểu thông tin diễn viên, đạo diễn và ê-kíp làm phim nổi bật.",
    },
    account: {
      title: "Tài khoản",
      description: "Quản lý thông tin cá nhân và cài đặt tài khoản MovieStream.",
    },
    favorites: {
      title: "Yêu thích",
      description: "Quản lý danh sách phim và series bạn đã lưu yêu thích.",
    },
    notifications: {
      title: "Thông báo",
      description: "Theo dõi các thông báo mới nhất liên quan đến tài khoản của bạn.",
    },
    faq: {
      title: "Câu hỏi thường gặp",
      description: "Tìm câu trả lời cho các câu hỏi phổ biến về MovieStream.",
    },
    oauthCallback: {
      title: "Đăng nhập Google",
      description: "Đang xác thực đăng nhập Google cho tài khoản của bạn.",
    },
    browseMovie: {
      title: "Duyệt phim lẻ",
      description:
        "Duyệt phim lẻ theo thể loại, quốc gia, năm phát hành và nhiều bộ lọc khác.",
    },
    browseTv: {
      title: "Duyệt phim bộ",
      description:
        "Duyệt phim bộ theo thể loại, quốc gia, năm phát hành và nhiều bộ lọc khác.",
    },
    browseTrending: {
      title: "Duyệt thịnh hành",
      description:
        "Khám phá nội dung thịnh hành theo bộ lọc để tìm phim phù hợp nhanh hơn.",
    },
    categories: {
      "movies-now-playing": {
        title: "Phim đang chiếu",
        description:
          "Danh sách phim đang chiếu mới nhất, cập nhật liên tục theo thị trường quốc tế.",
      },
      "movies-popular": {
        title: "Phim phổ biến",
        description: "Danh sách phim lẻ phổ biến được xem nhiều trên MovieStream.",
      },
      "movies-top-rated": {
        title: "Phim đánh giá cao",
        description: "Tuyển tập phim lẻ có điểm đánh giá cao từ cộng đồng người xem.",
      },
      "movies-upcoming": {
        title: "Phim sắp chiếu",
        description: "Theo dõi các phim sắp chiếu để không bỏ lỡ nội dung mới.",
      },
      "tv-on-the-air": {
        title: "Phim bộ đang phát sóng",
        description: "Cập nhật các series đang phát sóng với tập mới nhất.",
      },
      "tv-popular": {
        title: "Phim bộ phổ biến",
        description: "Khám phá các phim bộ được xem nhiều và thảo luận nổi bật.",
      },
      "tv-top-rated": {
        title: "Phim bộ đánh giá cao",
        description: "Danh sách phim bộ có điểm đánh giá cao từ khán giả toàn cầu.",
      },
    },
    movieDetailFallback: {
      title: "Chi tiết phim",
      description: "Xem thông tin chi tiết phim, diễn viên, trailer và nội dung liên quan.",
    },
    tvDetailFallback: {
      title: "Chi tiết phim bộ",
      description:
        "Xem thông tin chi tiết phim bộ, mùa/tập, diễn viên và nội dung liên quan.",
    },
    peopleDetailFallback: {
      title: "Chi tiết diễn viên",
      description: "Xem tiểu sử và danh sách tác phẩm nổi bật của diễn viên.",
    },
    watchFallback: {
      title: "Xem phim",
      description: "Xem phim trực tuyến với trải nghiệm mượt mà trên MovieStream.",
    },
  },
  en: {
    home: {
      title: "Home",
      description:
        "Discover movies, trending TV shows, and the latest releases on MovieStream.",
    },
    movies: {
      title: "Movies",
      description:
        "Browse new, popular, and top-rated movies on MovieStream.",
    },
    tv: {
      title: "TV Series",
      description:
        "Explore currently airing, popular, and top-rated TV series on MovieStream.",
    },
    trending: {
      title: "Trending",
      description:
        "Follow the movies and series trending the most among viewers right now.",
    },
    people: {
      title: "Actors & Directors",
      description:
        "Discover actors, directors, and film crews behind your favorite titles.",
    },
    account: {
      title: "Account",
      description: "Manage your profile and account settings on MovieStream.",
    },
    favorites: {
      title: "Favorites",
      description: "Manage your saved list of favorite movies and TV series.",
    },
    notifications: {
      title: "Notifications",
      description: "Stay updated with the latest account-related notifications.",
    },
    faq: {
      title: "FAQ",
      description: "Find answers to the most common questions about MovieStream.",
    },
    oauthCallback: {
      title: "Google Login",
      description: "Authenticating Google sign-in for your account.",
    },
    browseMovie: {
      title: "Browse Movies",
      description:
        "Browse movies by genre, country, release year, and advanced filters.",
    },
    browseTv: {
      title: "Browse TV Series",
      description:
        "Browse TV series by genre, country, release year, and advanced filters.",
    },
    browseTrending: {
      title: "Browse Trending",
      description:
        "Explore trending content using filters to quickly find what you want.",
    },
    categories: {
      "movies-now-playing": {
        title: "Now Playing Movies",
        description: "Latest now-playing movies, updated continuously.",
      },
      "movies-popular": {
        title: "Popular Movies",
        description: "Popular movies that viewers are watching the most.",
      },
      "movies-top-rated": {
        title: "Top Rated Movies",
        description: "Highly rated movies selected by the global audience.",
      },
      "movies-upcoming": {
        title: "Upcoming Movies",
        description: "Track upcoming movie releases so you never miss new titles.",
      },
      "tv-on-the-air": {
        title: "Currently Airing TV Shows",
        description: "Stay updated with TV series that are currently airing.",
      },
      "tv-popular": {
        title: "Popular TV Shows",
        description: "Discover TV shows audiences are watching and discussing.",
      },
      "tv-top-rated": {
        title: "Top Rated TV Shows",
        description: "Top-rated TV shows with strong viewer scores.",
      },
    },
    movieDetailFallback: {
      title: "Movie Details",
      description:
        "View movie details, cast, trailers, and related recommendations.",
    },
    tvDetailFallback: {
      title: "TV Series Details",
      description:
        "View TV series details, seasons/episodes, cast, and related recommendations.",
    },
    peopleDetailFallback: {
      title: "Actor Details",
      description: "View biography and notable filmography of this actor.",
    },
    watchFallback: {
      title: "Watch",
      description: "Stream content online with a smooth viewing experience.",
    },
  },
};

export const getStaticPageSeo = (language: string | undefined) =>
  STATIC_PAGE_SEO[resolveUiLocale(language)];

export const getBrowseSeoByFetchType = (
  fetchType: BrowseFetchType,
  language: string | undefined
): SeoEntry => {
  const seo = getStaticPageSeo(language);
  switch (fetchType) {
    case "tv":
      return seo.browseTv;
    case "trending":
      return seo.browseTrending;
    default:
      return seo.browseMovie;
  }
};

export const getCategorySeo = (
  routeKey: CategoryListingRouteKey,
  language: string | undefined
): SeoEntry => getStaticPageSeo(language).categories[routeKey];
