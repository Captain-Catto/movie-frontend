// Utility to fetch genres from TMDB API
// Movie URL: https://api.themoviedb.org/3/genre/movie/list?api_key=YOUR_API_KEY
// TV URL: https://api.themoviedb.org/3/genre/tv/list?api_key=YOUR_API_KEY

export const TMDB_MOVIE_GENRES_ENDPOINT =
  "https://api.themoviedb.org/3/genre/movie/list";
export const TMDB_TV_GENRES_ENDPOINT =
  "https://api.themoviedb.org/3/genre/tv/list";

// Movie genres from TMDB API - English translation
export const TMDB_MOVIE_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// TV genres from TMDB API - English translation
export const TMDB_TV_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
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

// Function to fetch movie genres from TMDB (if update needed)
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

// Function to fetch TV genres from TMDB (if update needed)
export async function fetchTMDBTVGenres(
  apiKey: string
): Promise<TMDBGenresResponse> {
  const response = await fetch(`${TMDB_TV_GENRES_ENDPOINT}?api_key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch TV genres: ${response.status}`);
  }
  return response.json();
}
