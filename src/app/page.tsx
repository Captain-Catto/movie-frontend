"use client";
import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import type { MovieCardData } from "@/types/movie";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import {
  HERO_MINIMUM_LOADING_TIME,
  HERO_MAXIMUM_TIMEOUT,
} from "@/constants/app.constants";

export default function Home() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieCardData[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieCardData[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MovieCardData[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<MovieCardData[]>([]);
  const [heroMovies, setHeroMovies] = useState<MovieCardData[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  // Individual loading states for progressive rendering
  const [loadingStates, setLoadingStates] = useState({
    nowPlaying: true,
    popular: true,
    topRated: true,
    upcoming: true,
  });

  // Track if each section has been fetched
  const [fetched, setFetched] = useState({
    nowPlaying: false,
    popular: false,
    topRated: false,
    upcoming: false,
  });
  const { breakpoint } = useWindowWidth();
  const responsiveLimit = useMemo(() => {
    if (breakpoint === "desktop") return 10;
    if (breakpoint === "tablet") return 8;
    return 4;
  }, [breakpoint]);

  // Intersection observers for lazy loading
  const [nowPlayingRef, nowPlayingVisible] = useIntersectionObserver();
  const [popularRef, popularVisible] = useIntersectionObserver();
  const [topRatedRef, topRatedVisible] = useIntersectionObserver();
  const [upcomingRef, upcomingVisible] = useIntersectionObserver();

  useEffect(() => {
    // Reset fetch flags when the responsive limit changes so we refetch with new counts
    setFetched({
      nowPlaying: false,
      popular: false,
      topRated: false,
      upcoming: false,
    });
  }, [responsiveLimit]);

  // Fetch hero section immediately (highest priority)
  useEffect(() => {
    const abortController = new AbortController();

    const fetchTrendingHero = async () => {
      try {
        // Promise for minimum delay
        const minDelayPromise = new Promise<void>((resolve) =>
          setTimeout(resolve, HERO_MINIMUM_LOADING_TIME)
        );

        // Promise for data fetch
        const dataPromise = apiService.getTrending();

        // Timeout promise for safety
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Hero data fetch timeout")),
            HERO_MAXIMUM_TIMEOUT
          )
        );

        // Wait for BOTH minimum delay AND data (or timeout)
        const [, trendingResponse] = await Promise.race([
          Promise.all([minDelayPromise, dataPromise]),
          timeoutPromise,
        ]);

        if (
          !abortController.signal.aborted &&
          trendingResponse.success &&
          trendingResponse.data
        ) {
          const heroTrendingMovies = mapTrendingDataToFrontend(
            trendingResponse.data.slice(0, responsiveLimit)
          );
          setHeroMovies(heroTrendingMovies);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching trending movies for hero:", error);
        }
        // Fallback data will be used automatically (heroMovies.length === 0)
      } finally {
        if (!abortController.signal.aborted) {
          // Always hide loader - either data is ready or we're showing fallback
          setHeroLoading(false);
        }
      }
    };

    fetchTrendingHero();

    return () => {
      abortController.abort();
    };
  }, [responsiveLimit]);

  // Fetch Now Playing when visible
  useEffect(() => {
    if (nowPlayingVisible && !fetched.nowPlaying) {
      setFetched((prev) => ({ ...prev, nowPlaying: true }));

      const fetchNowPlaying = async () => {
        try {
          const res = await apiService.getNowPlayingMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setNowPlayingMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching now playing:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, nowPlaying: false }));
        }
      };

      fetchNowPlaying();
    }
  }, [nowPlayingVisible, fetched.nowPlaying, responsiveLimit]);

  // Fetch Popular when visible
  useEffect(() => {
    if (popularVisible && !fetched.popular) {
      setFetched((prev) => ({ ...prev, popular: true }));

      const fetchPopular = async () => {
        try {
          const res = await apiService.getPopularMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setPopularMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching popular:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, popular: false }));
        }
      };

      fetchPopular();
    }
  }, [popularVisible, fetched.popular, responsiveLimit]);

  // Fetch Top Rated when visible
  useEffect(() => {
    if (topRatedVisible && !fetched.topRated) {
      setFetched((prev) => ({ ...prev, topRated: true }));

      const fetchTopRated = async () => {
        try {
          const res = await apiService.getTopRatedMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setTopRatedMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching top rated:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, topRated: false }));
        }
      };

      fetchTopRated();
    }
  }, [topRatedVisible, fetched.topRated, responsiveLimit]);

  // Fetch Upcoming when visible
  useEffect(() => {
    if (upcomingVisible && !fetched.upcoming) {
      setFetched((prev) => ({ ...prev, upcoming: true }));

      const fetchUpcoming = async () => {
        try {
          const res = await apiService.getUpcomingMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setUpcomingMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching upcoming:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, upcoming: false }));
        }
      };

      fetchUpcoming();
    }
  }, [upcomingVisible, fetched.upcoming, responsiveLimit]);

  // Fallback static hero data
  const fallbackHeroMoviesRaw = [
    {
      id: "119051",
      tmdbId: 119051,
      title: "Mùa Hè Kinh Hãi",
      aliasTitle: "I Know What You Did Last Summer",
      rating: 7.2,
      year: 2025,
      duration: "1h 51m",
      season: "Phần 1",
      episode: "Tập 14",
      genres: ["Chiếu Rạp", "Gay Cấn", "Kinh Dị", "Bí Ẩn", "Tâm Lý"],
      description:
        "Khi năm người bạn vô tình gây ra một vụ tai nạn xe hơi chết người, họ quyết định che giấu và lập một giao ước giữ bí mật thay vì phải đối mặt với hậu quả. Một năm sau, quá khứ trở lại ám ảnh họ, buộc họ phải đối diện với một sự thật khủng khiếp: có ai đó biết những gì họ đã làm vào mùa hè năm ngoái… và quyết tâm trả thù họ.",
      backgroundImage:
        "https://static.nutscdn.com/vimg/1920-0/d8a4ebcb52a0c7b9769298a843a355e6.webp",
      posterImage:
        "https://static.nutscdn.com/vimg/0-260/5ced6fb31801f8d66238cbdfaa23136d.webp",
      scenes: [
        "https://static.nutscdn.com/vimg/150-0/d8a4ebcb52a0c7b9769298a843a355e6.webp",
        "https://static.nutscdn.com/vimg/150-0/29cca985f832ea53a5cefa528fa7f666.webp",
        "https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg",
      ],
      href: "/tv/119051",
    },
    {
      id: "157239",
      tmdbId: 157239,
      title: "Dính Lẹo",
      aliasTitle: "Together",
      rating: 6.8,
      year: 2025,
      duration: "1h 42m",
      season: "Phần 1",
      episode: "Tập 8",
      genres: ["Chiếu Rạp", "Gay Cấn", "Kinh Dị", "Tâm Lý"],
      description:
        "Việc chuyển về vùng quê hẻo lánh đã đủ khiến mối quan hệ của cặp đôi này đứng bên bờ vực tan vỡ — nhưng một cuộc chạm trán siêu nhiên bất ngờ lại khởi đầu cho một sự biến đổi cực đoan về tình yêu, cuộc sống… và cả thể xác của họ.",
      backgroundImage:
        "https://static.nutscdn.com/vimg/1920-0/a7d2094512631c096231413e5bce5e29.webp",
      posterImage:
        "https://static.nutscdn.com/vimg/0-260/f4ba899bc021b4de498255efd6011274.png",
      scenes: [
        "https://static.nutscdn.com/vimg/150-0/29cca985f832ea53a5cefa528fa7f666.webp",
        "https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg",
        "https://static.nutscdn.com/vimg/150-0/7fb03fc7adc8de125e80bc0d67d0e841.webp",
      ],
      href: "/tv/157239",
    },
    {
      id: "1011985",
      tmdbId: 1011985,
      title: "Elio: Cậu Bé Đến Từ Trái Đất",
      aliasTitle: "Elio",
      rating: 7.0,
      year: 2025,
      duration: "1h 37m",
      season: "Phần 1",
      episode: "Full",
      genres: [
        "Chiếu Rạp",
        "Gia Đình",
        "Khoa Học",
        "Thiếu Nhi",
        "Hài",
        "Hoạt Hình",
        "Phiêu Lưu",
      ],
      description:
        "Điều gì sẽ xảy ra nếu chính thứ bạn đang tìm kiếm lại tìm đến bạn trước? Trong cuộc phiêu lưu dở khóc dở cười trên màn ảnh rộng của Pixar, Elio – cậu bé mê mẩn người ngoài hành tinh – bất ngờ bị cuốn vào Liên Hiệp Thiên Hà.",
      backgroundImage:
        "https://static.nutscdn.com/vimg/1920-0/b83f91db6c94d70423914163dc77feae.jpg",
      posterImage:
        "https://static.nutscdn.com/vimg/0-260/0e7257a6bfb5434095c2d425aa7306a5.png",
      scenes: [
        "https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg",
        "https://static.nutscdn.com/vimg/150-0/7fb03fc7adc8de125e80bc0d67d0e841.webp",
        "https://static.nutscdn.com/vimg/150-0/fdf26f9295adea7a951f615d6171cfc2.jpg",
      ],
      href: "/movie/1011985",
    },
  ];

  const fallbackHeroMovies: MovieCardData[] = fallbackHeroMoviesRaw.map(
    (movie) => ({
      ...movie,
      poster: movie.posterImage || movie.backgroundImage,
    })
  );

  // Use fetched movies (no fallback - show skeleton when loading)
  const nowPlayingToDisplay = nowPlayingMovies;
  const popularToDisplay = popularMovies;
  const topRatedToDisplay = topRatedMovies;
  const upcomingToDisplay = upcomingMovies;

  // Use trending hero movies if available, otherwise fall back to static data (hero needs fallback for proper display)
  const heroMoviesToDisplay =
    heroMovies.length > 0 ? heroMovies : fallbackHeroMovies;

  return (
    <Layout>
      <HeroSection movies={heroMoviesToDisplay} isLoading={heroLoading} />

      {/* Now Playing Section */}
      <div ref={nowPlayingRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Now Playing" href="/movies/now-playing" />
          <MovieGrid
            movies={nowPlayingToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.nowPlaying}
          />
        </div>
      </div>

      {/* Popular Section */}
      <div ref={popularRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular" href="/movies/popular" />
          <MovieGrid
            movies={popularToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.popular}
          />
        </div>
      </div>

      {/* Top Rated Section */}
      <div ref={topRatedRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated" href="/movies/top-rated" />
          <MovieGrid
            movies={topRatedToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.topRated}
          />
        </div>
      </div>

      {/* Upcoming Section */}
      <div ref={upcomingRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Upcoming" href="/movies/upcoming" />
          <MovieGrid
            movies={upcomingToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.upcoming}
          />
        </div>
      </div>

      {/* TV Series Sections */}
      <TVSeriesSections />
    </Layout>
  );
}
