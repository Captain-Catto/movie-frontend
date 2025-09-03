import {
  Movie,
  MovieResponse,
  MovieQuery,
  TrendingResponse,
} from "@/types/movie";

const API_BASE_URL = "http://localhost:8080/api";

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
    if (query.genre) params.append("genre", query.genre);
    if (query.year) params.append("year", query.year.toString());
    if (query.language) params.append("language", query.language);

    const url = `${API_BASE_URL}/movies${
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
    return this.fetchWithErrorHandling(url);
  }

  async getMovieCredits(
    id: number,
    language: string = "vi-VN"
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      title: string;
      cast: any[];
      crew: any[];
      production_countries: any[];
      production_companies: any[];
      genres: any[];
      runtime: number;
      status: string;
    };
    error?: string;
  }> {
    const url = `${API_BASE_URL}/movies/${id}/credits?language=${language}`;
    return this.fetchWithErrorHandling(url);
  }

  async getTVCredits(
    id: number,
    language: string = "vi-VN"
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      name: string;
      cast: any[];
      crew: any[];
      created_by: any[];
      origin_country: string[];
      genres: any[];
      episode_run_time: number[];
      status: string;
    };
    error?: string;
  }> {
    const url = `${API_BASE_URL}/tv/${id}/credits?language=${language}`;
    return this.fetchWithErrorHandling(url);
  }

  async getTrending(): Promise<TrendingResponse> {
    const url = `${API_BASE_URL}/trending`;
    return this.fetchWithErrorHandling<TrendingResponse>(url);
  }

  async getTVSeries(query: MovieQuery = {}): Promise<MovieResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.genre) params.append("genre", query.genre);
    if (query.year) params.append("year", query.year.toString());
    if (query.language) params.append("language", query.language);

    const url = `${API_BASE_URL}/tv${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithErrorHandling<MovieResponse>(url);
  }

  async getTVSeriesById(id: number): Promise<{
    success: boolean;
    message: string;
    data: Movie;
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
    data: any;
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
    data: any[];
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
    data: any[];
    error?: string;
  }> {
    const url = `${API_BASE_URL}/tv/${id}/recommendations?page=${page}`;
    return this.fetchWithErrorHandling(url);
  }

  // People API methods
  async getPopularPeople(page: number = 1): Promise<{
    page: number;
    results: any[];
    total_pages: number;
    total_results: number;
  }> {
    const url = `${API_BASE_URL}/people/popular?page=${page}`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        page: number;
        results: any[];
        total_pages: number;
        total_results: number;
      };
    }>(url);

    return response.data;
  }

  async getPersonDetails(id: number): Promise<any> {
    const url = `${API_BASE_URL}/people/${id}`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: any;
    }>(url);

    return response.data;
  }

  async getPersonCredits(id: number): Promise<{
    id: number;
    cast: any[];
    crew: any[];
  }> {
    const url = `${API_BASE_URL}/people/${id}/credits`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        id: number;
        cast: any[];
        crew: any[];
      };
    }>(url);

    return response.data;
  }

  async getPersonCreditsPaginated(
    id: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    id: number;
    cast: any[];
    crew: any[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_results: number;
      page_size: number;
    };
  }> {
    const url = `${API_BASE_URL}/people/${id}/credits/paginated?page=${page}&limit=${limit}`;
    const response = await this.fetchWithErrorHandling<{
      success: boolean;
      message: string;
      data: {
        id: number;
        cast: any[];
        crew: any[];
        pagination: {
          current_page: number;
          total_pages: number;
          total_results: number;
          page_size: number;
        };
      };
    }>(url);

    return response.data;
  }

  async getContentById(id: number): Promise<{
    content: any;
    contentType: "movie" | "tv";
    success: boolean;
    message?: string;
  }> {
    try {
      // Try movie first (usually faster response)
      const movieResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: any;
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
    } catch (movieError) {
      // Movie failed, try TV
      console.log("Movie not found, trying TV series...");
    }

    try {
      // Try TV series
      const tvResponse = await this.fetchWithErrorHandling<{
        success: boolean;
        message: string;
        data: any;
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
    } catch (tvError) {
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
}

export const apiService = new ApiService();
export default apiService;
