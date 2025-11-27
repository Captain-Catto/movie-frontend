"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import { MovieCardData } from "@/components/movie/MovieCard";

export default function Home() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieCardData[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieCardData[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MovieCardData[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<MovieCardData[]>([]);
  const [heroMovies, setHeroMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    const fetchMovieSections = async () => {
      try {
        // Fetch different movie categories from TMDB specific endpoints
        const [nowPlayingRes, popularRes, topRatedRes, upcomingRes] =
          await Promise.all([
            apiService.getNowPlayingMovies({
              page: 1,
              limit: 6,
              language: "en-US",
            }),
            apiService.getPopularMovies({
              page: 1,
              limit: 6,
              language: "en-US",
            }),
            apiService.getTopRatedMovies({
              page: 1,
              limit: 6,
              language: "en-US",
            }),
            apiService.getUpcomingMovies({
              page: 1,
              limit: 6,
              language: "en-US",
            }),
          ]);

        console.log("📦 Now Playing Response:", nowPlayingRes);
        console.log("📦 Popular Response:", popularRes);
        console.log("📦 Top Rated Response:", topRatedRes);
        console.log("📦 Upcoming Response:", upcomingRes);

        if (nowPlayingRes.success && nowPlayingRes.data) {
          setNowPlayingMovies(mapMoviesToFrontend(nowPlayingRes.data));
        }
        if (popularRes.success && popularRes.data) {
          setPopularMovies(mapMoviesToFrontend(popularRes.data));
        }
        if (topRatedRes.success && topRatedRes.data) {
          setTopRatedMovies(mapMoviesToFrontend(topRatedRes.data));
        }
        if (upcomingRes.success && upcomingRes.data) {
          setUpcomingMovies(mapMoviesToFrontend(upcomingRes.data));
        }
      } catch (error) {
        console.error("Error fetching movie sections:", error);
        // Keep static data as fallback
      } finally {
        setLoading(false);
      }
    };

    const fetchTrendingHero = async () => {
      try {
        const trendingResponse = await apiService.getTrending();

        if (trendingResponse.success && trendingResponse.data) {
          const heroTrendingMovies = mapTrendingDataToFrontend(
            trendingResponse.data.slice(0, 5)
          );
          setHeroMovies(heroTrendingMovies);
          console.log("🎬 Hero Trending Movies:", heroTrendingMovies);
        }
      } catch (error) {
        console.error("Error fetching trending movies for hero:", error);
        // Keep fallback static data
      } finally {
        setHeroLoading(false);
      }
    };

    fetchMovieSections();
    fetchTrendingHero();
  }, []);

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

  const normalizeFallbackMovies = <
    T extends {
      id: string;
      tmdbId?: number;
      title: string;
      aliasTitle?: string;
      poster: string;
      href: string;
      year?: number;
      genre?: string;
      genres?: string[];
      description?: string;
      rating?: number;
    }
  >(
    movies: T[]
  ): MovieCardData[] =>
    movies.map((movie, index) => {
      const parsedId = Number.parseInt(movie.id, 10);
      const tmdbId =
        movie.tmdbId ?? (Number.isNaN(parsedId) ? index + 1 : parsedId);

      return {
        ...movie,
        tmdbId,
        aliasTitle: movie.aliasTitle ?? movie.title,
        genres: movie.genres ?? (movie.genre ? [movie.genre] : undefined),
      };
    });

  // Fallback static data for each section (6 movies each)
  const fallbackNowPlayingRaw = [
    {
      id: "1",
      tmdbId: 693134, // Real TMDB ID for Dune: Part Two
      title: "Dune: Part Two",
      aliasTitle: "Dune: Phần Hai",
      poster:
        "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=500&q=80",
      href: "/movie/693134",
      year: 2024,
      genre: "Sci-Fi",
    },
    {
      id: "2",
      title: "Oppenheimer",
      aliasTitle: "Oppenheimer",
      poster:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=80",
      href: "/movie/2",
      year: 2023,
      genre: "Drama",
    },
    {
      id: "3",
      title: "The Batman",
      aliasTitle: "Người Dơi",
      poster:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80",
      href: "/movie/3",
      year: 2024,
      genre: "Action",
    },
    {
      id: "4",
      title: "Inception",
      aliasTitle: "Kỷ Nguyên",
      poster:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
      href: "/movie/4",
      year: 2023,
      genre: "Thriller",
    },
    {
      id: "5",
      title: "Avatar 3",
      aliasTitle: "Thế Thần - Phần 3",
      poster:
        "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=500&q=80",
      href: "/movie/5",
      year: 2024,
      genre: "Fantasy",
    },
    {
      id: "6",
      title: "Spider-Man",
      aliasTitle: "Người Nhện",
      poster:
        "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=500&q=80",
      href: "/movie/6",
      year: 2024,
      genre: "Action",
    },
  ];

  const fallbackNowPlaying = normalizeFallbackMovies(fallbackNowPlayingRaw);

  const fallbackPopularRaw = [
    {
      id: "7",
      title: "Black Panther",
      aliasTitle: "Báo Đen",
      poster:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80",
      href: "/movie/7",
      year: 2023,
      genre: "Action",
    },
    {
      id: "8",
      title: "Interstellar",
      aliasTitle: "Hố Đen Tử Thần",
      poster:
        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=500&q=80",
      href: "/movie/8",
      year: 2023,
      genre: "Sci-Fi",
    },
    {
      id: "9",
      title: "Wonder Woman",
      aliasTitle: "Nữ Thần Chiến Binh",
      poster:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=500&q=80",
      href: "/movie/9",
      year: 2024,
      genre: "Action",
    },
    {
      id: "10",
      title: "Doctor Strange",
      aliasTitle: "Bác Sĩ Tử Thần",
      poster:
        "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=500&q=80",
      href: "/movie/10",
      year: 2023,
      genre: "Fantasy",
    },
    {
      id: "11",
      title: "Guardians Galaxy",
      aliasTitle: "Vệ Binh Thiên Hà",
      poster:
        "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=500&q=80",
      href: "/movie/11",
      year: 2024,
      genre: "Action",
    },
    {
      id: "12",
      title: "Thor",
      aliasTitle: "Thần Sấm",
      poster:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=80",
      href: "/movie/12",
      year: 2024,
      genre: "Action",
    },
  ];

  const fallbackPopular = normalizeFallbackMovies(fallbackPopularRaw);

  const fallbackTopRatedRaw = [
    {
      id: "13",
      title: "The Godfather",
      aliasTitle: "Bố Già",
      poster:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80",
      href: "/movie/13",
      year: 1972,
      genre: "Drama",
    },
    {
      id: "14",
      title: "The Shawshank",
      aliasTitle: "Nhà Tù Shawshank",
      poster:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
      href: "/movie/14",
      year: 1994,
      genre: "Drama",
    },
    {
      id: "15",
      title: "Schindler List",
      aliasTitle: "Danh Sách Schindler",
      poster:
        "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=500&q=80",
      href: "/movie/15",
      year: 1993,
      genre: "Drama",
    },
    {
      id: "16",
      title: "Pulp Fiction",
      aliasTitle: "Pulp Fiction",
      poster:
        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=500&q=80",
      href: "/movie/16",
      year: 1994,
      genre: "Crime",
    },
    {
      id: "17",
      title: "12 Angry Men",
      aliasTitle: "12 Người Đàn Ông",
      poster:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=500&q=80",
      href: "/movie/17",
      year: 1957,
      genre: "Drama",
    },
    {
      id: "18",
      title: "Fight Club",
      aliasTitle: "Câu Lạc Bộ Đánh Nhau",
      poster:
        "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=500&q=80",
      href: "/movie/18",
      year: 1999,
      genre: "Drama",
    },
  ];

  const fallbackTopRated = normalizeFallbackMovies(fallbackTopRatedRaw);

  const fallbackUpcomingRaw = [
    {
      id: "19",
      title: "Dune: Part Three",
      aliasTitle: "Dune: Phần Ba",
      poster:
        "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=500&q=80",
      href: "/movie/19",
      year: 2026,
      genre: "Sci-Fi",
    },
    {
      id: "20",
      title: "Avatar 4",
      aliasTitle: "Thế Thần - Phần 4",
      poster:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=80",
      href: "/movie/20",
      year: 2026,
      genre: "Fantasy",
    },
    {
      id: "21",
      title: "Spider-Man 4",
      aliasTitle: "Người Nhện 4",
      poster:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80",
      href: "/movie/21",
      year: 2025,
      genre: "Action",
    },
    {
      id: "22",
      title: "The Matrix 5",
      aliasTitle: "Ma Trận 5",
      poster:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
      href: "/movie/22",
      year: 2025,
      genre: "Sci-Fi",
    },
    {
      id: "23",
      title: "John Wick 5",
      aliasTitle: "John Wick 5",
      poster:
        "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=500&q=80",
      href: "/movie/23",
      year: 2025,
      genre: "Action",
    },
    {
      id: "24",
      title: "Fast X: Part 2",
      aliasTitle: "Quá Nhanh Quá Nguy Hiểm X: Phần 2",
      poster:
        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=500&q=80",
      href: "/movie/24",
      year: 2025,
      genre: "Action",
    },
  ];

  const fallbackUpcoming = normalizeFallbackMovies(fallbackUpcomingRaw);

  // Use fetched movies if available, otherwise fall back to static data (updated)
  const nowPlayingToDisplay =
    nowPlayingMovies.length > 0 ? nowPlayingMovies : fallbackNowPlaying;
  const popularToDisplay =
    popularMovies.length > 0 ? popularMovies : fallbackPopular;
  const topRatedToDisplay =
    topRatedMovies.length > 0 ? topRatedMovies : fallbackTopRated;
  const upcomingToDisplay =
    upcomingMovies.length > 0 ? upcomingMovies : fallbackUpcoming;

  // Use trending hero movies if available, otherwise fall back to static data
  const heroMoviesToDisplay =
    heroMovies.length > 0 ? heroMovies : fallbackHeroMovies;

  return (
    <Layout>
      <HeroSection movies={heroMoviesToDisplay} />

      {/* Now Playing Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Now Playing" href="/movies/now-playing" />
          <MovieGrid
            movies={nowPlayingToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Popular Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular" href="/movies/popular" />
          <MovieGrid
            movies={popularToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Top Rated Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated" href="/movies/top-rated" />
          <MovieGrid
            movies={topRatedToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Upcoming" href="/movies/upcoming" />
          <MovieGrid
            movies={upcomingToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* TV Series Sections */}
      <TVSeriesSections />

      {(loading || heroLoading) && (
        <div className="text-center text-white py-8">
          Loading movies from backend...
        </div>
      )}
    </Layout>
  );
}
