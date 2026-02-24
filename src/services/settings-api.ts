import axiosInstance from "@/lib/axios-instance";
import type { EffectSettings, EffectSettingsResponse } from "@/types/settings.types";

class SettingsApiService {
  async getEffectSettings(): Promise<EffectSettingsResponse> {
    try {
      const response = await axiosInstance.get("/settings/effects");
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: undefined,
        error:
          err.response?.data?.message || "Failed to fetch effect settings",
      };
    }
  }

  async updateEffectSettings(
    settings: EffectSettings
  ): Promise<EffectSettingsResponse> {
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
        data: undefined,
        error:
          err.response?.data?.message || "Failed to update effect settings",
      };
    }
  }
}

export const settingsApiService = new SettingsApiService();
