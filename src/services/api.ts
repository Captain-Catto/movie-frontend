import {
  Movie,
  MovieResponse,
  MovieQuery,
  TrendingResponse,
  TVSeries,
  TVSeriesResponse,
} from "@/types/movie";
import {
  CastMember,
  CrewMember,
  CreditsData,
  PaginationData,
  MetadataInfo,
} from "@/types/api";
import { DEFAULT_LANGUAGE } from "@/constants/app.constants";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
    : "http://localhost:8080/api";

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

  async getMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      genres: query.genre, // ✅ Fix: use "genres" not "genre"
      year: query.year,
      language: query.language,
      sortBy: query.sortBy,
      countries: query.countries,
    });

    const url = `${API_BASE_URL}/movies${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  // New category-specific movie endpoints
  async getNowPlayingMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre, // ✅ Add genre parameter
      year: query.year, // ✅ Add year parameter
      sortBy: query.sortBy, // ✅ Add sortBy parameter
    });

    const url = `${API_BASE_URL}/movies/now-playing${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getPopularMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre, // ✅ Add genre parameter
      year: query.year, // ✅ Add year parameter
      sortBy: query.sortBy, // ✅ Add sortBy parameter
    });

    const url = `${API_BASE_URL}/movies/popular${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getTopRatedMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre, // ✅ Add genre parameter
      year: query.year, // ✅ Add year parameter
      sortBy: query.sortBy, // ✅ Add sortBy parameter
    });

    const url = `${API_BASE_URL}/movies/top-rated${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getUpcomingMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
      genres: query.genre, // ✅ Add genre parameter
      year: query.year, // ✅ Add year parameter
      sortBy: query.sortBy, // ✅ Add sortBy parameter
    });

    const url = `${API_BASE_URL}/movies/upcoming${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getMovieById(id: number): Promise<{
    success: boolean;
    message: string;
    data: Movie;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/movies/${id}`;
    return this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: TVSeries;
      error?: string;
    }>(url);
  }

  async getMovieCredits(
    id: number,
    language: string = DEFAULT_LANGUAGE
  ): Promise<{
    success: boolean;
    message: string;
    data: CreditsData;
    error?: string;
  }> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/movies/${id}/credits${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling(url);
  }

  async getTVCredits(
    id: number,
    language: string = DEFAULT_LANGUAGE
  ): Promise<{
    success: boolean;
    message: string;
    data: CreditsData;
    error?: string;
  }> {
    const params = this.buildQueryParams({ language });
    const url = `${API_BASE_URL}/tv/${id}/credits${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling(url);
  }

  async getMovieVideos(id: number): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      results: Array<{
        id: string;
        iso_639_1: string;
        iso_3166_1: string;
        key: string;
        name: string;
        site: string;
        size: number;
        type: string;
        official: boolean;
        published_at: string;
      }>;
    };
    error?: string;
  }> {
    const url = `${API_BASE_URL}/movies/${id}/videos`;
    return this.fetchWithErrorHandling(url);
  }

  async getTVVideos(id: number): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      results: Array<{
        id: string;
        iso_639_1: string;
        iso_3166_1: string;
        key: string;
        name: string;
        site: string;
        size: number;
        type: string;
        official: boolean;
        published_at: string;
      }>;
    };
    error?: string;
  }> {
    const url = `${API_BASE_URL}/tv/${id}/videos`;
    return this.fetchWithErrorHandling(url);
  }

  async getTrending(query: MovieQuery = {}): Promise<TrendingResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/trending${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<TrendingResponse>(url);
  }

  async getTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
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
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }

  async getTVSeriesById(id: number): Promise<{
    success: boolean;
    message: string;
    data: TVSeries;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/tv/${id}`;
    return this.fetchWithErrorHandling(url);
  }

  async syncMovies(): Promise<{
    success: boolean;
    message: string;
    data: null;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/movies/sync`;
    return this.fetchWithErrorHandling(url, {
      method: "POST",
    });
  }

  async getSyncStats(): Promise<{
    success: boolean;
    message: string;
    data: Record<string, unknown>;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/movies/stats/sync`;
    return this.fetchWithErrorHandling(url);
  }

  async getMovieRecommendations(
    id: number,
    page: number = 1
  ): Promise<{
    success: boolean;
    message: string;
    data: Movie[];
    error?: string;
  }> {
    const params = this.buildQueryParams({ page });
    const url = `${API_BASE_URL}/movies/${id}/recommendations${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling(url);
  }

  async getTVRecommendations(
    id: number,
    page: number = 1
  ): Promise<{
    success: boolean;
    message: string;
    data: Movie[];
    error?: string;
  }> {
    const params = this.buildQueryParams({ page });
    const url = `${API_BASE_URL}/tv/${id}/recommendations${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling(url);
  }

  // People API methods
  async getPopularPeople(page: number = 1): Promise<{
    page: number;
    results: CastMember[];
    total_pages: number;
    total_results: number;
  }> {
    const params = this.buildQueryParams({ page });
    const url = `${API_BASE_URL}/people/popular${params ? `?${params}` : ""}`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        page: number;
        results: CastMember[];
        total_pages: number;
        total_results: number;
      };
    }>(url);

    return response.data;
  }

  async getPersonDetails(id: number): Promise<CastMember & { biography?: string; birthday?: string; deathday?: string; place_of_birth?: string }> {
    const url = `${API_BASE_URL}/people/${id}`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: CastMember & { biography?: string; birthday?: string; deathday?: string; place_of_birth?: string };
    }>(url);

    return response.data;
  }

  async getPersonCredits(id: number): Promise<{
    id: number;
    cast: CastMember[];
    crew: CrewMember[];
  }> {
    const url = `${API_BASE_URL}/people/${id}/credits`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        id: number;
        cast: CastMember[];
        crew: CrewMember[];
      };
    }>(url);

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
    pagination: PaginationData;
    metadata: MetadataInfo;
  }> {
    const params = this.buildQueryParams({ page, limit, mediaType, sortBy });
    const url = `${API_BASE_URL}/people/${id}/credits/paginated${
      params ? `?${params}` : ""
    }`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        cast: CastMember[];
        crew: CrewMember[];
        pagination: PaginationData;
        metadata: MetadataInfo;
      };
    }>(url);

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
    pagination: PaginationData;
    metadata: MetadataInfo & { totalCastItems: number };
  }> {
    const params = this.buildQueryParams({ page, limit, mediaType, sortBy });
    const url = `${API_BASE_URL}/people/${id}/credits/cast/paginated${
      params ? `?${params}` : ""
    }`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        cast: CastMember[];
        pagination: PaginationData;
        metadata: MetadataInfo & { totalCastItems: number };
      };
    }>(url);

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
    pagination: PaginationData;
    metadata: MetadataInfo & { totalCrewItems: number };
  }> {
    const params = this.buildQueryParams({ page, limit, mediaType, sortBy });
    const url = `${API_BASE_URL}/people/${id}/credits/crew/paginated${
      params ? `?${params}` : ""
    }`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        crew: CrewMember[];
        pagination: PaginationData;
        metadata: MetadataInfo & { totalCrewItems: number };
      };
    }>(url);

    return response.data;
  }

  async getContentById(id: number): Promise<{
    content: Movie | TVSeries | null;
    contentType: "movie" | "tv";
    success: boolean;
    message?: string;
  }> {
    // console.log("📡 [ApiService] getContentById called with ID:", id);

    try {
      // Try movie first (usually faster response)
      const movieUrl = `${API_BASE_URL}/movies/${id}`;
      // console.log("📡 [ApiService] Trying movie endpoint:", movieUrl);

      const movieResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: Movie;
      }>(movieUrl);

      // console.log("📡 [ApiService] Movie response:", {
      //   success: movieResponse.success,
      //   hasData: !!movieResponse.data,
      //   message: movieResponse.message,
      // });

      if (movieResponse.success && movieResponse.data) {
        const content = movieResponse.data;
        // Validate it's actually a movie by checking movie-specific fields
        if (
          content.title &&
          (content.releaseDate !== undefined || content.tmdbId !== undefined)
        ) {
          // console.log("✅ [ApiService] Found as MOVIE:", {
          //   id: content.id,
          //   title: content.title,
          //   tmdbId: content.tmdbId,
          // });
          return {
            content: movieResponse.data,
            contentType: "movie",
            success: true,
          };
        }
      }
    } catch {
      // console.log("⚠️ [ApiService] Movie endpoint failed:", movieError);
      // Movie failed, try TV
    }

    try {
      // Try TV series
      const tvUrl = `${API_BASE_URL}/tv/${id}`;
      // console.log("📡 [ApiService] Trying TV endpoint:", tvUrl);

      const tvResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: TVSeries;
      }>(tvUrl);

      // console.log("📡 [ApiService] TV response:", {
      //   success: tvResponse.success,
      //   hasData: !!tvResponse.data,
      //   message: tvResponse.message,
      // });

      if (tvResponse.success && tvResponse.data) {
        const content = tvResponse.data;
        // Validate it's actually a TV series by checking TV-specific fields
        if (
          content.title &&
          (content.firstAirDate !== undefined || content.tmdbId !== undefined)
        ) {
          // console.log("✅ [ApiService] Found as TV SERIES:", {
          //   id: content.id,
          //   title: content.title,
          //   tmdbId: content.tmdbId,
          // });
          return {
            content: tvResponse.data,
            contentType: "tv",
            success: true,
          };
        }
      }
    } catch (tvError) {
      // console.log("⚠️ [ApiService] TV endpoint failed:", tvError);
    }

    console.error("❌ [ApiService] Content not found in both movie and TV databases");
    return {
      content: null,
      contentType: "movie",
      success: false,
      message: `Content with ID ${id} not found in both movie and TV databases`,
    };
  }

  async lookupByTmdbId(tmdbId: number): Promise<{
    success: boolean;
    data?: {
      internalId: number;
      tmdbId: number;
      contentType: "movie" | "tv";
      redirectUrl: string;
    };
    message?: string;
  }> {
    try {
      const url = `${API_BASE_URL}/content/lookup/tmdb/${tmdbId}`;
      const response = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: {
          internalId: number;
          tmdbId: number;
          contentType: "movie" | "tv";
          redirectUrl: string;
        } | null;
      }>(url);

      return {
        success: response.success,
        data: response.data || undefined,
        message: response.message,
      };
    } catch (error) {
      console.error("Lookup by TMDB ID failed:", error);
      return {
        success: false,
        message: `Failed to lookup TMDB ID ${tmdbId}: ${error}`,
      };
    }
  }

  // Specific content type fetching methods
  async getMovieByTmdbId(tmdbId: number): Promise<{
    content: Movie | null;
    contentType: "movie";
    success: boolean;
    message?: string;
  }> {
    try {
      const movieResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: Movie;
      }>(`${API_BASE_URL}/movies/${tmdbId}`);

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

  async getTVByTmdbId(tmdbId: number): Promise<{
    content: TVSeries | null;
    contentType: "tv";
    success: boolean;
    message?: string;
  }> {
    try {
      const tvResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: TVSeries;
      }>(`${API_BASE_URL}/tv/${tmdbId}`);

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

  // Movie Upload APIs
  async getUploadedMovies(): Promise<{
    success: boolean;
    message: string;
    data: Array<{
      id: string;
      title: string;
      description: string;
      year: number;
      genre: string;
      duration: string;
      s3Key: string;
      streamUrl: string;
      posterUrl?: string;
      uploadDate: string;
      fileSize: number;
      originalName: string;
    }>;
  }> {
    try {
      const url = `${API_BASE_URL}/movie-upload/movies`;
      return await this.fetchWithErrorHandling(url);
    } catch (error) {
      console.error("Failed to get uploaded movies:", error);
      return {
        success: false,
        message: `Failed to get uploaded movies: ${error}`,
        data: [],
      };
    }
  }

  async getUploadedMovie(id: string): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      title: string;
      description: string;
      year: number;
      genre: string;
      duration: string;
      s3Key: string;
      streamUrl: string;
      posterUrl?: string;
      uploadDate: string;
      fileSize: number;
      originalName: string;
    } | null;
  }> {
    try {
      const url = `${API_BASE_URL}/movie-upload/movie/${id}`;
      return await this.fetchWithErrorHandling(url);
    } catch (error) {
      console.error("Failed to get uploaded movie:", error);
      return {
        success: false,
        message: `Failed to get uploaded movie: ${error}`,
        data: null,
      };
    }
  }

  // TV Series Category Methods
  async getOnTheAirTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/tv/on-the-air${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }

  async getPopularTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/tv/popular-tv${params ? `?${params}` : ""}`;
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }

  async getTopRatedTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
    const params = this.buildQueryParams({
      page: query.page,
      limit: query.limit,
      language: query.language,
    });

    const url = `${API_BASE_URL}/tv/top-rated-tv${
      params ? `?${params}` : ""
    }`;
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }
}

export const apiService = new ApiService();
export default apiService;
