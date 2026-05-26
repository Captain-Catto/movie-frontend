import { useEffect, useCallback, useReducer } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";

export type MinMax = { min: number; max: number };
export type RegistrationSettings = {
  nickname: MinMax;
  password: MinMax;
};
export type StreamDomainSettings = {
  domains: string[];
};
export type SwaggerAuthSettings = {
  username: string;
  configured: boolean;
  updatedAt?: string;
  updatedBy?: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
  };
};

interface SettingsState {
  loading: boolean;
  settings: RegistrationSettings;
  saving: boolean;
  streamDomainText: string;
  streamSaving: boolean;
  swaggerAuth: SwaggerAuthSettings;
  swaggerAuthForm: { username: string; password?: string };
  swaggerSaving: boolean;
}

function settingsReducer(
  state: SettingsState,
  action: Partial<SettingsState> | ((prev: SettingsState) => Partial<SettingsState>)
): SettingsState {
  const patch = typeof action === "function" ? action(state) : action;
  return { ...state, ...patch };
}

export function useAdminSettings() {
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToast();

  const [state, dispatch] = useReducer(settingsReducer, {
    loading: false,
    settings: { nickname: { min: 3, max: 16 }, password: { min: 6, max: 16 } },
    saving: false,
    streamDomainText: "",
    streamSaving: false,
    swaggerAuth: { username: "", configured: false },
    swaggerAuthForm: { username: "", password: "" },
    swaggerSaving: false,
  });

  const {
    loading,
    settings,
    saving,
    streamDomainText,
    streamSaving,
    swaggerAuth,
    swaggerAuthForm,
    swaggerSaving,
  } = state;

  const setStreamDomainText = useCallback((val: string | ((prev: string) => string)) => {
    dispatch((s) => ({
      streamDomainText: typeof val === "function" ? val(s.streamDomainText) : val,
    }));
  }, []);

  const setSwaggerAuthForm = useCallback(
    (
      val:
        | { username: string; password?: string }
        | ((prev: { username: string; password?: string }) => { username: string; password?: string })
    ) => {
      dispatch((s) => ({
        swaggerAuthForm: typeof val === "function" ? val(s.swaggerAuthForm) : val,
      }));
    },
    []
  );

  const fetchSettings = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    dispatch({ loading: true });
    try {
      const [registrationRes, streamDomainsRes, swaggerAuthRes] = await Promise.all([
        adminApi.get<RegistrationSettings>("/admin/settings/registration"),
        adminApi.get<StreamDomainSettings>("/admin/settings/stream-domains"),
        adminApi.get<SwaggerAuthSettings>("/admin/settings/swagger-auth"),
      ]);

      if (registrationRes.success && registrationRes.data) {
        dispatch({ settings: registrationRes.data as RegistrationSettings });
      } else if (registrationRes.error) {
        showError("Load failed", registrationRes.error);
      }

      if (streamDomainsRes.success && streamDomainsRes.data) {
        const streamDomains = streamDomainsRes.data as StreamDomainSettings;
        dispatch({ streamDomainText: (streamDomains.domains || []).join("\n") });
      } else if (streamDomainsRes.error) {
        showError("Load failed", streamDomainsRes.error);
      }

      if (swaggerAuthRes.success && swaggerAuthRes.data) {
        const authSettings = swaggerAuthRes.data as SwaggerAuthSettings;
        dispatch({
          swaggerAuth: authSettings,
          swaggerAuthForm: {
            username: authSettings.username || "",
            password: "",
          },
        });
      } else if (swaggerAuthRes.error || swaggerAuthRes.message) {
        if (!String(swaggerAuthRes.message || swaggerAuthRes.error).toLowerCase().includes("forbidden")) {
          showError("Load failed", swaggerAuthRes.error || swaggerAuthRes.message || "Failed to load Swagger access");
        }
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      showError("Load failed", "Failed to load settings");
    } finally {
      dispatch({ loading: false });
    }
  }, [adminApi, showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateValue = (
    key: keyof RegistrationSettings,
    field: "min" | "max",
    value: number
  ) => {
    dispatch({
      settings: {
        ...settings,
        [key]: {
          ...settings[key],
          [field]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    dispatch({ saving: true });
    try {
      const res = await adminApi.put<RegistrationSettings>(
        "/admin/settings/registration",
        settings
      );
      if (res.success && res.data) {
        dispatch({ settings: res.data as RegistrationSettings });
        showSuccess("Saved", "Settings updated successfully");
      } else {
        showError("Save failed", res.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      showError("Save failed", "Failed to save settings");
    } finally {
      dispatch({ saving: false });
    }
  };

  const handleSaveStreamDomains = async () => {
    const domains = streamDomainText
      .split(/[\n,]+/)
      .flatMap((domain) => { const t = domain.trim(); return t ? [t] : []; });

    if (domains.length === 0) {
      showError("Save failed", "Please provide at least one stream domain");
      return;
    }

    dispatch({ streamSaving: true });
    try {
      const res = await adminApi.put<StreamDomainSettings>(
        "/admin/settings/stream-domains",
        { domains }
      );

      if (res.success && res.data) {
        const saved = res.data as StreamDomainSettings;
        dispatch({ streamDomainText: (saved.domains || []).join("\n") });
        showSuccess("Saved", "Stream domains updated successfully");
      } else {
        showError("Save failed", res.error || "Failed to save stream domains");
      }
    } catch (err) {
      console.error("Failed to save stream domains", err);
      showError("Save failed", "Failed to save stream domains");
    } finally {
      dispatch({ streamSaving: false });
    }
  };

  const handleSaveSwaggerAuth = async () => {
    const username = swaggerAuthForm.username.trim();
    const password = swaggerAuthForm.password ? swaggerAuthForm.password.trim() : "";

    if (username.length < 3) {
      showError("Save failed", "Swagger username must be at least 3 characters");
      return;
    }

    if (!swaggerAuth.configured && password.length < 8) {
      showError("Save failed", "Swagger password must be at least 8 characters");
      return;
    }

    dispatch({ swaggerSaving: true });
    try {
      const payload: { username: string; password?: string } = { username };
      if (password) {
        payload.password = password;
      }

      const res = await adminApi.put<SwaggerAuthSettings>(
        "/admin/settings/swagger-auth",
        payload
      );

      if (res.success && res.data) {
        const saved = res.data as SwaggerAuthSettings;
        dispatch({
          swaggerAuth: saved,
          swaggerAuthForm: { username: saved.username || "", password: "" },
        });
        showSuccess("Saved", "Swagger access updated successfully");
      } else {
        showError("Save failed", res.error || "Failed to save Swagger access");
      }
    } catch (err) {
      console.error("Failed to save Swagger auth", err);
      showError("Save failed", "Failed to save Swagger access");
    } finally {
      dispatch({ swaggerSaving: false });
    }
  };

  return {
    settings,
    loading,
    saving,
    streamDomainText,
    streamSaving,
    swaggerAuth,
    swaggerAuthForm,
    swaggerSaving,
    setStreamDomainText,
    setSwaggerAuthForm,
    updateValue,
    handleSave,
    handleSaveStreamDomains,
    handleSaveSwaggerAuth,
  };
}
