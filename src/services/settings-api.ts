import axiosInstance from "@/lib/axios-instance";

export type EffectType = "snow" | "redEnvelope" | "fireworks" | "sakura";

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: "low" | "medium" | "high";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class SettingsApiService {
  /**
   * Get effect settings (public endpoint - all users can read)
   */
  async getEffectSettings(): Promise<ApiResponse<EffectSettings>> {
    try {
      const response = await axiosInstance.get("/settings/effects");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch effect settings",
      };
    }
  }

  /**
   * Update effect settings (admin only)
   */
  async updateEffectSettings(
    settings: EffectSettings
  ): Promise<ApiResponse<EffectSettings>> {
    try {
      const response = await axiosInstance.put(
        "/admin/settings/effects",
        settings
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to update effect settings",
      };
    }
  }
}

export const settingsApiService = new SettingsApiService();
