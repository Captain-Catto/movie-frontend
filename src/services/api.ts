import type { ApiResponse } from "@/types/api";
import type {
  Movie,
  TVSeries,
  TrendingItem,
  Credits,
  ContentQuery,
  ContentType,
  ContentByIdResponse,
  StreamData,
  ContentLookup,
  UploadedMovie,
  Video,
  Season,
} from "@/types/content.types";
import type {
  PersonDetails,
  PersonCredits,
  PopularPeopleResponse,
} from "@/types/people.types";
import type { CastMember, CrewMember } from "@/types/content.types";
import type { Pagination, MetadataInfo } from "@/types/api";
import { DEFAULT_LANGUAGE } from "@/constants/app.constants";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
    : "http://localhost:8080/api";

type CacheEntry<T> = {
  timestamp: number;
  data: T;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

class ApiService {
  /**
   * Build query string from a params object.
   * Skips undefined/null/empty/false/0 to mirror previous truthy checks.
   */
  private buildQueryParams(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      const appendValue = (val: unknown) => {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          val === false ||
          val === 0
        ) {
          return;
        }
        searchParams.append(key, String(val));
      };

      if (Array.isArray(value)) {
        value.forEach(appendValue);
      } else {
        appendValue(value);
      }
    });

    return searchParams.toString();
  }

  private async fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lightweight in-memory cache for GET requests.
   * Uses full URL (with query params) as the cache key.
   */
  private async fetchWithCache<T>(
    url: string,
    options?: RequestInit,
    cacheTtlMs: number = DEFAULT_CACHE_TTL
  ): Promise<T> {
    const method = (options?.method || "GET").toUpperCase();
    const isCacheable = method === "GET" && cacheTtlMs > 0;

    if (isCacheable) {
      const cached = responseCache.get(url) as CacheEntry<T> | undefined;
      if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
        return cached.data;
      }
    }

    const data = await this.fetchWithErrorHandling<T>(url, options);

    if (isCacheable) {
      responseCache.set(url, { timestamp: Date.now(), data });
    }

    return data;
  }

  // ===========================
  // Movie Endpoints
  // ===========================

  async getMovies(query: ContentQuery = {}): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      genres: query.genre,
      year: query.year,
      language: query.language,
      sortBy: query.sortBy,
      countries: query.countries,
    });

    const url = `${API_BASE_URL}/movies${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<Movie[]>>(url);
  }

  async getNowPlayingMovies(query: ContentQuery = {}): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre,
      year: query.year,
      sortBy: query.sortBy,
    });

    const url = `${API_BASE_URL}/movies/now-playing${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<Movie[]>>(url);
  }

  async getPopularMovies(query: ContentQuery = {}): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre,
      year: query.year,
      sortBy: query.sortBy,
    });

    const url = `${API_BASE_URL}/movies/popular${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<Movie[]>>(url);
  }

  async getTopRatedMovies(query: ContentQuery = {}): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre,
      year: query.year,
      sortBy: query.sortBy,
    });

    const url = `${API_BASE_URL}/movies/top-rated${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<Movie[]>>(url);
  }

  async getUpcomingMovies(query: ContentQuery = {}): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre,
      year: query.year,
      sortBy: query.sortBy,
    });

    const url = `${API_BASE_URL}/movies/upcoming${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<Movie[]>>(url);
  }

  async getMovieById(id: number, language?: string): Promise<ApiResponse<Movie>> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/movies/${id}${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<Movie>>(url);
  }

  async getMovieCredits(
    id: number,
    language: string = DEFAULT_LANGUAGE
  ): Promise<ApiResponse<Credits>> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/movies/${id}/credits${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<ApiResponse<Credits>>(url);
  }

  async getTVCredits(
    id: number,
    language: string = DEFAULT_LANGUAGE
  ): Promise<ApiResponse<Credits>> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/tv/${id}/credits${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<ApiResponse<Credits>>(url);
  }

  async getTVSeasonEpisodes(
    tvId: number,
    seasonNumber: number,
    language: string = DEFAULT_LANGUAGE
  ): Promise<ApiResponse<Season>> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/tv/${tvId}/seasons/${seasonNumber}/episodes${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithCache<ApiResponse<Season>>(url, undefined, 5 * 60 * 1000);
  }

  async getMovieVideos(id: number): Promise<ApiResponse<{ id: number; results: Video[] }>> {
    const url = `${API_BASE_URL}/movies/${id}/videos`;
    return this.fetchWithErrorHandling<ApiResponse<{ id: number; results: Video[] }>>(url);
  }

  async getTVVideos(id: number): Promise<ApiResponse<{ id: number; results: Video[] }>> {
    const url = `${API_BASE_URL}/tv/${id}/videos`;
    return this.fetchWithErrorHandling<ApiResponse<{ id: number; results: Video[] }>>(url);
  }

  async syncMovies(): Promise<ApiResponse<null>> {
    const url = `${API_BASE_URL}/movies/sync`;
    return this.fetchWithErrorHandling<ApiResponse<null>>(url, {
      method: "POST",
    });
  }

  async getSyncStats(): Promise<ApiResponse<Record<string, unknown>>> {
    const url = `${API_BASE_URL}/movies/stats/sync`;
    return this.fetchWithErrorHandling<ApiResponse<Record<string, unknown>>>(url);
  }

  async getMovieRecommendations(
    id: number,
    page: number = 1
  ): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({ page });
    const url = `${API_BASE_URL}/movies/${id}/recommendations${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling<ApiResponse<Movie[]>>(url);
  }

  // ===========================
  // TV Series Endpoints
  // ===========================

  async getTVRecommendations(
    id: number,
    page: number = 1
  ): Promise<ApiResponse<Movie[]>> {
    const params = this.buildQueryParams({ page });
    const url = `${API_BASE_URL}/tv/${id}/recommendations${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling<ApiResponse<Movie[]>>(url);
  }

  async getTVSeries(query: ContentQuery = {}): Promise<ApiResponse<TVSeries[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      genres: query.genre,
      year: query.year,
      language: query.language,
      sortBy: query.sortBy,
      countries: query.countries,
    });

    const url = `${API_BASE_URL}/tv${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<TVSeries[]>>(url);
  }

  async getTVSeriesById(id: number, language?: string): Promise<ApiResponse<TVSeries>> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/tv/${id}${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<ApiResponse<TVSeries>>(url);
  }

  async getOnTheAirTVSeries(query: ContentQuery = {}): Promise<ApiResponse<TVSeries[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/tv/on-the-air${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<TVSeries[]>>(url);
  }

  async getPopularTVSeries(query: ContentQuery = {}): Promise<ApiResponse<TVSeries[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/tv/popular-tv${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<TVSeries[]>>(url);
  }

  async getTopRatedTVSeries(query: ContentQuery = {}): Promise<ApiResponse<TVSeries[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/tv/top-rated-tv${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<TVSeries[]>>(url);
  }

  // ===========================
  // Trending Endpoints
  // ===========================

  async getTrending(query: ContentQuery = {}): Promise<ApiResponse<TrendingItem[]>> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/trending${params ? `?${params}` : ""}`;
    return this.fetchWithCache<ApiResponse<TrendingItem[]>>(url);
  }

  // ===========================
  // People Endpoints
  // ===========================

  async getPopularPeople(page: number = 1): Promise<PopularPeopleResponse> {
    const params = this.buildQueryParams({ page });
    const url = `${API_BASE_URL}/people/popular${params ? `?${params}` : ""}`;
    const response = await this.fetchWithErrorHandling<ApiResponse<PopularPeopleResponse>>(url);

    return response.data;
  }

  async getPersonDetails(id: number): Promise<PersonDetails> {
    const url = `${API_BASE_URL}/people/${id}`;
    const response = await this.fetchWithErrorHandling<ApiResponse<PersonDetails>>(url);

    return response.data;
  }

  async getPersonCredits(id: number): Promise<PersonCredits> {
    const url = `${API_BASE_URL}/people/${id}/credits`;
    const response = await this.fetchWithErrorHandling<ApiResponse<PersonCredits>>(url);

    return response.data;
  }

  async getPersonCreditsPaginated(
    id: number,
    page: number = 1,
    limit: number = 20,
    mediaType: "movie" | "tv" | "all" = "all",
    sortBy: "release_date" | "popularity" | "vote_average" = "release_date"
  ): Promise<{
    cast: CastMember[];
    crew: CrewMember[];
    pagination: Pagination;
    metadata: MetadataInfo;
  }> {
    const params = this.buildQueryParams({ page, limit, mediaType, sortBy });
    const url = `${API_BASE_URL}/people/${id}/credits/paginated${
      params ? `?${params}` : ""
    }`;
    const response = await this.fetchWithErrorHandling<ApiResponse<{
      cast: CastMember[];
      crew: CrewMember[];
      pagination: Pagination;
      metadata: MetadataInfo;
    }>>(url);

    return response.data;
  }

  async getPersonCastPaginated(
    id: number,
    page: number = 1,
    limit: number = 20,
    mediaType: "movie" | "tv" | "all" = "all",
    sortBy: "release_date" | "popularity" | "vote_average" = "release_date"
  ): Promise<{
    cast: CastMember[];
    pagination: Pagination;
    metadata: MetadataInfo & { totalCastItems: number };
  }> {
    const params = this.buildQueryParams({ page, limit, mediaType, sortBy });
    const url = `${API_BASE_URL}/people/${id}/credits/cast/paginated${
      params ? `?${params}` : ""
    }`;
    const response = await this.fetchWithErrorHandling<ApiResponse<{
      cast: CastMember[];
      pagination: Pagination;
      metadata: MetadataInfo & { totalCastItems: number };
    }>>(url);

    return response.data;
  }

  async getPersonCrewPaginated(
    id: number,
    page: number = 1,
    limit: number = 20,
    mediaType: "movie" | "tv" | "all" = "all",
    sortBy: "release_date" | "popularity" | "vote_average" = "release_date"
  ): Promise<{
    crew: CrewMember[];
    pagination: Pagination;
    metadata: MetadataInfo & { totalCrewItems: number };
  }> {
    const params = this.buildQueryParams({ page, limit, mediaType, sortBy });
    const url = `${API_BASE_URL}/people/${id}/credits/crew/paginated${
      params ? `?${params}` : ""
    }`;
    const response = await this.fetchWithErrorHandling<ApiResponse<{
      crew: CrewMember[];
      pagination: Pagination;
      metadata: MetadataInfo & { totalCrewItems: number };
    }>>(url);

    return response.data;
  }

  // ===========================
  // Content (Generic) Endpoints
  // ===========================

  async getContentById(id: number, language?: string): Promise<ContentByIdResponse> {
    const params = this.buildQueryParams({ language });
    try {
      const movieUrl = `${API_BASE_URL}/movies/${id}${params ? `?${params}` : ""}`;
      const movieResponse = await this.fetchWithErrorHandling<ApiResponse<Movie>>(movieUrl);

      if (movieResponse.success && movieResponse.data) {
        const content = movieResponse.data;
        if (
          content.title &&
          (content.releaseDate !== undefined || content.tmdbId !== undefined)
        ) {
          return {
            content: movieResponse.data,
            contentType: "movie",
            success: true,
          };
        }
      }
    } catch {
      // Movie failed, try TV
    }

    try {
      const tvUrl = `${API_BASE_URL}/tv/${id}${params ? `?${params}` : ""}`;
      const tvResponse = await this.fetchWithErrorHandling<ApiResponse<TVSeries>>(tvUrl);

      if (tvResponse.success && tvResponse.data) {
        const content = tvResponse.data;
        if (
          content.title &&
          (content.firstAirDate !== undefined || content.tmdbId !== undefined)
        ) {
          return {
            content: tvResponse.data,
            contentType: "tv",
            success: true,
          };
        }
      }
    } catch {
      // TV also failed
    }

    console.error("❌ [ApiService] Content not found in both movie and TV databases");
    return {
      content: null,
      contentType: "movie",
      success: false,
      message: `Content with ID ${id} not found in both movie and TV databases`,
    };
  }

  async getStreamUrlByTmdbId(
    tmdbId: number,
    contentType: ContentType,
    options?: {
      season?: number;
      episode?: number;
      dsLang?: string;
      autoplay?: boolean;
      autoNext?: boolean;
    }
  ): Promise<ApiResponse<StreamData | undefined>> {
    try {
      const params = this.buildQueryParams({
        contentType,
        season: options?.season,
        episode: options?.episode,
        dsLang: options?.dsLang,
        autoplay:
          options?.autoplay === undefined ? undefined : options.autoplay ? 1 : 0,
        autoNext:
          options?.autoNext === undefined ? undefined : options.autoNext ? 1 : 0,
      });

      const url = `${API_BASE_URL}/content/stream-url/${tmdbId}${
        params ? `?${params}` : ""
      }`;

      const response = await this.fetchWithCache<ApiResponse<StreamData | null>>(
        url, undefined, 60 * 1000
      );

      return {
        success: response.success,
        data: response.data || undefined,
        message: response.message,
      };
    } catch (error) {
      console.error("Get stream URL by TMDB ID failed:", error);
      return {
        success: false,
        data: undefined,
        message: `Failed to get stream URL for TMDB ID ${tmdbId}: ${error}`,
      };
    }
  }

  async lookupByTmdbId(tmdbId: number): Promise<ApiResponse<ContentLookup | undefined>> {
    try {
      const url = `${API_BASE_URL}/content/lookup/tmdb/${tmdbId}`;
      const response = await this.fetchWithErrorHandling<ApiResponse<ContentLookup | null>>(url);

      return {
        success: response.success,
        data: response.data || undefined,
        message: response.message,
      };
    } catch (error) {
      console.error("Lookup by TMDB ID failed:", error);
      return {
        success: false,
        data: undefined,
        message: `Failed to lookup TMDB ID ${tmdbId}: ${error}`,
      };
    }
  }

  async getMovieByTmdbId(tmdbId: number, language?: string): Promise<ContentByIdResponse> {
    try {
      const params = this.buildQueryParams({ language });
      const movieResponse = await this.fetchWithErrorHandling<ApiResponse<Movie>>(
        `${API_BASE_URL}/movies/${tmdbId}${params ? `?${params}` : ""}`
      );

      if (movieResponse.success && movieResponse.data) {
        return {
          content: movieResponse.data,
          contentType: "movie",
          success: true,
        };
      } else {
        return {
          content: null,
          contentType: "movie",
          success: false,
          message: movieResponse.message || "Movie not found",
        };
      }
    } catch (error) {
      return {
        content: null,
        contentType: "movie",
        success: false,
        message: `Failed to fetch movie: ${error}`,
      };
    }
  }

  async getTVByTmdbId(tmdbId: number, language?: string): Promise<ContentByIdResponse> {
    try {
      const params = this.buildQueryParams({ language });
      const tvResponse = await this.fetchWithErrorHandling<ApiResponse<TVSeries>>(
        `${API_BASE_URL}/tv/${tmdbId}${params ? `?${params}` : ""}`
      );

      if (tvResponse.success && tvResponse.data) {
        return {
          content: tvResponse.data,
          contentType: "tv",
          success: true,
        };
      } else {
        return {
          content: null,
          contentType: "tv",
          success: false,
          message: tvResponse.message || "TV series not found",
        };
      }
    } catch (error) {
      return {
        content: null,
        contentType: "tv",
        success: false,
        message: `Failed to fetch TV series: ${error}`,
      };
    }
  }

  // ===========================
  // Movie Upload Endpoints
  // ===========================

  async getUploadedMovies(): Promise<ApiResponse<UploadedMovie[]>> {
    try {
      const url = `${API_BASE_URL}/movie-upload/movies`;
      return await this.fetchWithErrorHandling<ApiResponse<UploadedMovie[]>>(url);
    } catch (error) {
      console.error("Failed to get uploaded movies:", error);
      return {
        success: false,
        message: `Failed to get uploaded movies: ${error}`,
        data: [],
      };
    }
  }

  async getUploadedMovie(id: string): Promise<ApiResponse<UploadedMovie | null>> {
    try {
      const url = `${API_BASE_URL}/movie-upload/movie/${id}`;
      return await this.fetchWithErrorHandling<ApiResponse<UploadedMovie | null>>(url);
    } catch (error) {
      console.error("Failed to get uploaded movie:", error);
      return {
        success: false,
        message: `Failed to get uploaded movie: ${error}`,
        data: null,
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
