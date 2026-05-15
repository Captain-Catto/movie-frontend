import { axiosInstance } from "@/lib/axios-instance";
import type {
  ChatMessage,
  ChatSession,
  SendChatResponse,
} from "@/types/chat.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const chatApi = {
  async createOrGetSession(createNew = false): Promise<ChatSession> {
    const response = await axiosInstance.post<ApiResponse<ChatSession>>(
      `/chat/sessions${createNew ? "?new=true" : ""}`
    );
    return response.data.data;
  },

  async getSessions(): Promise<ChatSession[]> {
    const response = await axiosInstance.get<ApiResponse<ChatSession[]>>(
      "/chat/sessions"
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    const response = await axiosInstance.get<ApiResponse<ChatMessage[]>>(
      `/chat/sessions/${sessionId}/messages`
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async sendMessage(
    sessionId: number,
    message: string,
    language: string
  ): Promise<SendChatResponse> {
    const response = await axiosInstance.post<ApiResponse<SendChatResponse>>(
      `/chat/sessions/${sessionId}/messages`,
      { message, language }
    );
    return response.data.data;
  },
};
