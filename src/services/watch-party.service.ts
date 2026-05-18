import { authStorage } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface CreateWatchPartyDto {
  streamUrl: string;
  contentTitle: string;
  movieId?: number;
  tvId?: number;
  season?: number;
  episode?: number;
  posterUrl?: string;
}

interface WatchPartyCreatedDto {
  id: number;
  inviteCode: string;
  inviteUrl: string;
  contentTitle: string;
}

class WatchPartyService {
  private getAuthHeaders(): HeadersInit {
    const token = authStorage.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createParty(dto: CreateWatchPartyDto): Promise<WatchPartyCreatedDto> {
    const res = await fetch(`${API_BASE_URL}/watch-party`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message ?? "Không thể tạo phòng xem");
    }

    const json = (await res.json()) as { data: WatchPartyCreatedDto };
    return json.data;
  }
}

export const watchPartyService = new WatchPartyService();
