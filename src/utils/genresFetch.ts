// Utility để fetch genres từ TMDB API
// Movie URL: https://api.themoviedb.org/3/genre/movie/list?api_key=YOUR_API_KEY
// TV URL: https://api.themoviedb.org/3/genre/tv/list?api_key=YOUR_API_KEY

export const TMDB_MOVIE_GENRES_ENDPOINT =
  "https://api.themoviedb.org/3/genre/movie/list";
export const TMDB_TV_GENRES_ENDPOINT =
  "https://api.themoviedb.org/3/genre/tv/list";

// Movie genres from TMDB API - Vietnamese translation
export const TMDB_MOVIE_GENRE_MAP: Record<number, string> = {
  28: "Hành động",
  12: "Phiêu lưu",
  16: "Hoạt hình",
  35: "Hài",
  80: "Hình sự",
  99: "Tài liệu",
  18: "Chính kịch",
  10751: "Gia đình",
  14: "Viễn tưởng",
  36: "Lịch sử",
  27: "Kinh dị",
  10402: "Âm nhạc",
  9648: "Bí ẩn",
  10749: "Lãng mạn",
  878: "Khoa học viễn tưởng",
  10770: "Phim truyền hình",
  53: "Giật gân",
  10752: "Chiến tranh",
  37: "Miền tây",
};

// TV genres from TMDB API - Vietnamese translation
export const TMDB_TV_GENRE_MAP: Record<number, string> = {
  10759: "Hành động & Phiêu lưu",
  16: "Hoạt hình",
  35: "Hài",
  80: "Hình sự",
  99: "Tài liệu",
  18: "Chính kịch",
  10751: "Gia đình",
  10762: "Trẻ em",
  9648: "Bí ẩn",
  10763: "Tin tức",
  10764: "Thực tế",
  10765: "Khoa học viễn tưởng",
  10766: "Phim dài tập",
  10767: "Talk show",
  10768: "Chiến tranh & Chính trị",
  37: "Miền tây",
};

// Combined genre map for both movies and TV
export const TMDB_GENRE_MAP: Record<number, string> = {
  ...TMDB_MOVIE_GENRE_MAP,
  ...TMDB_TV_GENRE_MAP,
};

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

// Function để fetch movie genres từ TMDB (nếu cần update)
export async function fetchTMDBMovieGenres(
  apiKey: string
): Promise<TMDBGenresResponse> {
  const response = await fetch(
    `${TMDB_MOVIE_GENRES_ENDPOINT}?api_key=${apiKey}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch movie genres: ${response.status}`);
  }
  return response.json();
}

// Function để fetch TV genres từ TMDB (nếu cần update)
export async function fetchTMDBTVGenres(
  apiKey: string
): Promise<TMDBGenresResponse> {
  const response = await fetch(`${TMDB_TV_GENRES_ENDPOINT}?api_key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch TV genres: ${response.status}`);
  }
  return response.json();
}
