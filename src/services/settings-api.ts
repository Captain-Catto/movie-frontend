import axiosInstance from "@/lib/axios-instance";

export type EffectType = "snow" | "redEnvelope" | "fireworks" | "sakura";

export interface RedEnvelopeSettings {
  fallSpeed: number; // 0.1 - 3
  rotationSpeed: number; // 0.1 - 5
  windStrength: number; // 0 - 1
  sparkleFrequency: number; // 0 - 0.1
}

export interface SnowSettings {
  speed: number; // 0.1 - 3
  density: number; // 0.5 - 2
  size: number; // 0.5 - 3
  windStrength: number; // 0 - 1
}

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: "low" | "medium" | "high";
  redEnvelopeSettings?: RedEnvelopeSettings;
  snowSettings?: SnowSettings;
  excludedPaths?: string[];
}

export interface ApiResponse<T = unknown> {
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error:
          err.response?.data?.message || "Failed to fetch effect settings",
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error:
          err.response?.data?.message || "Failed to update effect settings",
      };
    }
  }
}

export const settingsApiService = new SettingsApiService();
