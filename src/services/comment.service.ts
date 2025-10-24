// Comment API Service
// Handles all API calls for the comment system

import {
  Comment,
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
  CreateCommentReportDto,
  CommentQueryDto,
  CommentStats,
  AdminCommentQueryDto,
  BulkCommentActionDto,
  BannedWord,
  BannedWordCreateDto,
} from "@/types/comment.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class CommentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private toNumber(value: unknown): number {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  }

  // Normalize comment data from backend to frontend format
  private normalizeComment(
    comment: Record<string, unknown> | Comment
  ): Comment {
    const raw = comment as Record<string, unknown>;
    const likesCount = this.toNumber(
      raw["likeCount"] ?? raw["likesCount"]
    );
    const dislikesCount = this.toNumber(
      raw["dislikeCount"] ?? raw["dislikesCount"]
    );

    return {
      ...(comment as unknown as Comment),
      likesCount,
      dislikesCount,
    };
  }

  private normalizeComments(
    comments: Array<Record<string, unknown> | Comment>
  ): Comment[] {
    return comments.map((comment) => this.normalizeComment(comment));
  }

  // User Comment Operations
  async getComments(params: CommentQueryDto): Promise<CommentResponse> {
    let url: string;
    const queryParams = new URLSearchParams();

    // Add a dummy userId for testing (since no auth)
    queryParams.append("userId", "1");

    // Build query params (excluding movieId/tvSeriesId as they go in the path)
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        key !== "movieId" &&
        key !== "tvSeriesId"
      ) {
        queryParams.append(key, value.toString());
      }
    });

    // Choose the correct endpoint based on content type
    if (params.movieId) {
      url = `${API_BASE_URL}/api/comments/movie/${params.movieId}`;
    } else if (params.tvSeriesId) {
      url = `${API_BASE_URL}/api/comments/tv/${params.tvSeriesId}`;
    } else {
      // Fallback for general comments
      url = `${API_BASE_URL}/api/comments`;
    }

    // Add query parameters if any
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.handleResponse<{
      success: boolean;
      data: CommentResponse;
    }>(response);

    // Handle the backend response structure
    if (result.success && result.data) {
      return {
        ...result.data,
        comments: this.normalizeComments(result.data.comments || []),
      };
    }

    // Fallback to the result itself if it's already a CommentResponse
    return result as unknown as CommentResponse;
  }

  async getCommentById(id: number): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Comment>(response);
  }

  async createComment(data: CreateCommentDto): Promise<Comment> {
    console.log("Creating comment with data:", data);

    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{
      success: boolean;
      data: Comment;
      message?: string;
      error?: string;
    }>(response);

    console.log("Create comment API response:", result);

    // Handle the backend response structure
    if (result.success && result.data) {
      console.log("Comment created successfully:", result.data);
      return this.normalizeComment(result.data);
    }

    // If backend returns error in success response
    if (!result.success) {
      console.error("Backend returned error:", result.message || result.error);
      throw new Error(result.message || result.error || "Failed to create comment");
    }

    // Fallback to the result itself if it's already a Comment
    // This handles older API format where response is directly the comment
    const resultAsComment = result as unknown as Comment;
    if (resultAsComment.id) {
      console.log("Using fallback format, comment:", result);
      return resultAsComment;
    }

    console.error("Invalid response format:", result);
    throw new Error("Invalid response format from server");
  }

  async updateComment(id: number, data: UpdateCommentDto): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Comment>(response);
  }

  async deleteComment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete comment`);
    }
  }

  async likeComment(id: number): Promise<{
    success: boolean;
    likeCount: number;
    dislikeCount: number;
    userLike: boolean | null;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isLike: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to like comment`);
    }

    const result = await response.json();
    return result.data;
  }

  async dislikeComment(id: number): Promise<{
    success: boolean;
    likeCount: number;
    dislikeCount: number;
    userLike: boolean | null;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isLike: false }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to dislike comment`);
    }

    const result = await response.json();
    return result.data;
  }

  async reportComment(id: number, data: CreateCommentReportDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/report`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to report comment`);
    }
  }

  async getReplies(
    parentId: number,
    params?: Omit<CommentQueryDto, "parentId">
  ): Promise<CommentResponse> {
    const queryParams = new URLSearchParams();

    // Add a dummy userId for testing (since no auth)
    queryParams.append("userId", "1");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/comments/${parentId}/replies${
      queryString ? "?" + queryString : ""
    }`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.handleResponse<{
      success: boolean;
      data: CommentResponse;
    }>(response);
    return {
      ...result.data,
      comments: this.normalizeComments(result.data.comments || []),
    };
  }

  // Admin Comment Operations
  async getCommentsAdmin(
    params: AdminCommentQueryDto
  ): Promise<CommentResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/api/admin/comments?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<CommentResponse>(response);
  }

  async hideComment(id: number, reason: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/comments/${id}/hide`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to hide comment`);
    }
  }

  async unhideComment(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/comments/${id}/unhide`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to unhide comment`);
    }
  }

  async getCommentStats(): Promise<CommentStats> {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/stats`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<CommentStats>(response);
  }

  async bulkCommentAction(data: BulkCommentActionDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/bulk`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to perform bulk action`);
    }
  }

  // Banned Words Management
  async getBannedWords(): Promise<BannedWord[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/banned-words`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BannedWord[]>(response);
  }

  async createBannedWord(data: BannedWordCreateDto): Promise<BannedWord> {
    const response = await fetch(`${API_BASE_URL}/api/admin/banned-words`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<BannedWord>(response);
  }

  async updateBannedWord(
    id: number,
    data: Partial<BannedWordCreateDto>
  ): Promise<BannedWord> {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/banned-words/${id}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    return this.handleResponse<BannedWord>(response);
  }

  async deleteBannedWord(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/banned-words/${id}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete banned word`);
    }
  }

  // Utility Methods
  async checkContentFilter(
    content: string
  ): Promise<{ isAllowed: boolean; reason?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/check-content`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    const result = await this.handleResponse<{
      success: boolean;
      data: { isAllowed: boolean; reason?: string };
    }>(response);

    // Handle the backend response structure
    if (result.success && result.data) {
      return result.data;
    }

    // Fallback
    return { isAllowed: true };
  }

  // Real-time updates (WebSocket will be implemented in Phase 4)
  subscribeToComments(): () => void {
    // Placeholder for WebSocket implementation
    console.log("WebSocket subscription will be implemented in Phase 4");
    return () => {};
  }

  // Search users for mentions
  async searchUsers(query: string, limit: number = 10): Promise<Array<{ id: number; name: string; image?: string }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/comments/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const result = await this.handleResponse<{
      success: boolean;
      data: Array<{ id: number; name: string; image?: string }>;
    }>(response);

    return result.data || [];
  }
}

// Export singleton instance
export const commentService = new CommentService();
export default commentService;
