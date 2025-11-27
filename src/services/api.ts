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
  ProductionCountry,
  ProductionCompany,
  Genre,
  CreditsData,
  PaginationData,
  MetadataInfo,
} from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
    : "http://localhost:8080/api";

class ApiService {
  private async fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      console.log("🌐 Making API request:", url);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      console.log(
        "📡 API response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✅ API Success:", url, data);
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.genre) params.append("genres", query.genre); // ✅ Fix: use "genres" not "genre"
    if (query.year) params.append("year", query.year.toString());
    if (query.language) params.append("language", query.language);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.countries) params.append("countries", query.countries);

    const url = `${API_BASE_URL}/movies${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  // New category-specific movie endpoints
  async getNowPlayingMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);
    if (query.genre) params.append("genres", query.genre); // ✅ Add genre parameter
    if (query.year) params.append("year", query.year.toString()); // ✅ Add year parameter
    if (query.sortBy) params.append("sortBy", query.sortBy); // ✅ Add sortBy parameter

    const url = `${API_BASE_URL}/movies/now-playing${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getPopularMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);
    if (query.genre) params.append("genres", query.genre); // ✅ Add genre parameter
    if (query.year) params.append("year", query.year.toString()); // ✅ Add year parameter
    if (query.sortBy) params.append("sortBy", query.sortBy); // ✅ Add sortBy parameter

    const url = `${API_BASE_URL}/movies/popular${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getTopRatedMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);
    if (query.genre) params.append("genres", query.genre); // ✅ Add genre parameter
    if (query.year) params.append("year", query.year.toString()); // ✅ Add year parameter
    if (query.sortBy) params.append("sortBy", query.sortBy); // ✅ Add sortBy parameter

    const url = `${API_BASE_URL}/movies/top-rated${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getUpcomingMovies(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);
    if (query.genre) params.append("genres", query.genre); // ✅ Add genre parameter
    if (query.year) params.append("year", query.year.toString()); // ✅ Add year parameter
    if (query.sortBy) params.append("sortBy", query.sortBy); // ✅ Add sortBy parameter

    const url = `${API_BASE_URL}/movies/upcoming${
      params.toString() ? `?${params.toString()}` : ""
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
    language: string = "en-US"
  ): Promise<{
    success: boolean;
    message: string;
    data: CreditsData;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/movies/${id}/credits?language=${language}`;
    return this.fetchWithErrorHandling(url);
  }

  async getTVCredits(
    id: number,
    language: string = "en-US"
  ): Promise<{
    success: boolean;
    message: string;
    data: CreditsData;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/tv/${id}/credits?language=${language}`;
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
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);

    const url = `${API_BASE_URL}/trending${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<TrendingResponse>(url);
  }

  async getTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.genre) params.append("genre", query.genre);
    if (query.year) params.append("year", query.year.toString());
    if (query.language) params.append("language", query.language);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.countries) params.append("countries", query.countries);

    const url = `${API_BASE_URL}/tv${
      params.toString() ? `?${params.toString()}` : ""
    }`;
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
    const url = `${API_BASE_URL}/movies/${id}/recommendations?page=${page}`;
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
    const url = `${API_BASE_URL}/tv/${id}/recommendations?page=${page}`;
    return this.fetchWithErrorHandling(url);
  }

  // People API methods
  async getPopularPeople(page: number = 1): Promise<{
    page: number;
    results: CastMember[];
    total_pages: number;
    total_results: number;
  }> {
    const url = `${API_BASE_URL}/people/popular?page=${page}`;
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
    const url = `${API_BASE_URL}/people/${id}/credits/paginated?page=${page}&limit=${limit}&mediaType=${mediaType}&sortBy=${sortBy}`;
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
    const url = `${API_BASE_URL}/people/${id}/credits/cast/paginated?page=${page}&limit=${limit}&mediaType=${mediaType}&sortBy=${sortBy}`;
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
    const url = `${API_BASE_URL}/people/${id}/credits/crew/paginated?page=${page}&limit=${limit}&mediaType=${mediaType}&sortBy=${sortBy}`;
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
    try {
      // Try movie first (usually faster response)
      const movieResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: Movie;
      }>(`${API_BASE_URL}/movies/${id}`);

      if (movieResponse.success && movieResponse.data) {
        const content = movieResponse.data;
        // Validate it's actually a movie by checking movie-specific fields
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
      console.log("Movie not found, trying TV series...");
    }

    try {
      // Try TV series
      const tvResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: TVSeries;
      }>(`${API_BASE_URL}/tv/${id}`);

      if (tvResponse.success && tvResponse.data) {
        const content = tvResponse.data;
        // Validate it's actually a TV series by checking TV-specific fields
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
      console.log("TV series not found either");
    }

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
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);

    const url = `${API_BASE_URL}/tv/on-the-air${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }

  async getPopularTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);

    const url = `${API_BASE_URL}/tv/popular-tv${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }

  async getTopRatedTVSeries(query: MovieQuery = {}): Promise<TVSeriesResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.language) params.append("language", query.language);

    const url = `${API_BASE_URL}/tv/top-rated-tv${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<TVSeriesResponse>(url);
  }
}

export const apiService = new ApiService();
export default apiService;
