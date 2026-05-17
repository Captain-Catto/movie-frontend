"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";
import EffectSettings from "@/components/settings/EffectSettings";

type MinMax = { min: number; max: number };
type RegistrationSettings = {
  nickname: MinMax;
  password: MinMax;
};
type StreamDomainSettings = {
  domains: string[];
};
type SwaggerAuthSettings = {
  username: string;
  configured: boolean;
  updatedAt?: string;
};

const ITEMS: Array<{ key: keyof RegistrationSettings; label: string }> = [
  { key: "nickname", label: "Nickname" },
  { key: "password", label: "Password" },
];

export default function AdminSettingsPage() {
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToastRedux();
  const [settings, setSettings] = useState<RegistrationSettings>({
    nickname: { min: 3, max: 16 },
    password: { min: 6, max: 16 },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [streamDomainText, setStreamDomainText] = useState("");
  const [streamSaving, setStreamSaving] = useState(false);
  const [swaggerAuth, setSwaggerAuth] = useState<SwaggerAuthSettings>({
    username: "",
    configured: false,
  });
  const [swaggerAuthForm, setSwaggerAuthForm] = useState({
    username: "",
    password: "",
  });
  const [swaggerSaving, setSwaggerSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [registrationRes, streamDomainsRes, swaggerAuthRes] = await Promise.all([
        adminApi.get<RegistrationSettings>("/admin/settings/registration"),
        adminApi.get<StreamDomainSettings>("/admin/settings/stream-domains"),
        adminApi.get<SwaggerAuthSettings>("/admin/settings/swagger-auth"),
      ]);

      if (registrationRes.success && registrationRes.data) {
        setSettings(registrationRes.data as RegistrationSettings);
      } else if (registrationRes.error) {
        showError("Load failed", registrationRes.error);
      }

      if (streamDomainsRes.success && streamDomainsRes.data) {
        const streamDomains = streamDomainsRes.data as StreamDomainSettings;
        setStreamDomainText((streamDomains.domains || []).join("\n"));
      } else if (streamDomainsRes.error) {
        showError("Load failed", streamDomainsRes.error);
      }

      if (swaggerAuthRes.success && swaggerAuthRes.data) {
        const authSettings = swaggerAuthRes.data as SwaggerAuthSettings;
        setSwaggerAuth(authSettings);
        setSwaggerAuthForm({
          username: authSettings.username || "",
          password: "",
        });
      } else if (swaggerAuthRes.error) {
        showError("Load failed", swaggerAuthRes.error);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      showError("Load failed", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminApi.get, showError]);

  useEffect(() => {
    if (adminApi.isAuthenticated) {
      fetchSettings();
    }
  }, [adminApi.isAuthenticated, fetchSettings]);

  const updateValue = (
    key: keyof RegistrationSettings,
    field: "min" | "max",
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminApi.put<RegistrationSettings>(
        "/admin/settings/registration",
        settings
      );
      if (res.success && res.data) {
        setSettings(res.data as RegistrationSettings);
        showSuccess("Saved", "Settings updated successfully");
      } else {
        showError("Save failed", res.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      showError("Save failed", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStreamDomains = async () => {
    const domains = streamDomainText
      .split(/[\n,]+/)
      .map((domain) => domain.trim())
      .filter(Boolean);

    if (domains.length === 0) {
      showError("Save failed", "Please provide at least one stream domain");
      return;
    }

    setStreamSaving(true);
    try {
      const res = await adminApi.put<StreamDomainSettings>(
        "/admin/settings/stream-domains",
        { domains }
      );

      if (res.success && res.data) {
        const saved = res.data as StreamDomainSettings;
        setStreamDomainText((saved.domains || []).join("\n"));
        showSuccess("Saved", "Stream domains updated successfully");
      } else {
        showError("Save failed", res.error || "Failed to save stream domains");
      }
    } catch (err) {
      console.error("Failed to save stream domains", err);
      showError("Save failed", "Failed to save stream domains");
    } finally {
      setStreamSaving(false);
    }
  };

  const handleSaveSwaggerAuth = async () => {
    const username = swaggerAuthForm.username.trim();
    const password = swaggerAuthForm.password.trim();

    if (username.length < 3) {
      showError("Save failed", "Swagger username must be at least 3 characters");
      return;
    }

    if (!swaggerAuth.configured && password.length < 8) {
      showError("Save failed", "Swagger password must be at least 8 characters");
      return;
    }

    setSwaggerSaving(true);
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
        setSwaggerAuth(saved);
        setSwaggerAuthForm({ username: saved.username || "", password: "" });
        showSuccess("Saved", "Swagger access updated successfully");
      } else {
        showError("Save failed", res.error || "Failed to save Swagger access");
      }
    } catch (err) {
      console.error("Failed to save Swagger auth", err);
      showError("Save failed", "Failed to save Swagger access");
    } finally {
      setSwaggerSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Site Settings</h1>
          <p className="text-gray-400 mt-1">
            Adjust registration constraints and visual effects
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Registration Items Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 self-start">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Registration Items
            </h2>
            {loading && (
              <span className="text-sm text-gray-400 animate-pulse">
                Loading...
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {ITEMS.map((item) => (
                  <tr key={item.key}>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {item.label}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-green-700 text-white">
                            Min
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={settings[item.key].min}
                            onChange={(e) =>
                              updateValue(
                                item.key,
                                "min",
                                Number(e.target.value || 0)
                              )
                            }
                            className="w-14 px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-700 text-white">
                            Max
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={settings[item.key].max}
                            onChange={(e) =>
                              updateValue(
                                item.key,
                                "max",
                                Number(e.target.value || 0)
                              )
                            }
                            className="w-14 px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Effect Settings Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              Visual Effects Settings
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Control visual effects displayed to all users
            </p>
          </div>
          <div className="p-6">
            <EffectSettings />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-white">Swagger Access</h2>
          <p className="text-xs text-gray-400">
            Credentials required to open API docs at /api-docs. Password is stored as a hash.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={swaggerAuthForm.username}
              onChange={(e) =>
                setSwaggerAuthForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-600 bg-gray-900 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="docs-admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={swaggerAuthForm.password}
              onChange={(e) =>
                setSwaggerAuthForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-600 bg-gray-900 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder={
                swaggerAuth.configured
                  ? "Leave blank to keep current password"
                  : "At least 8 characters"
              }
            />
          </div>
          <button
            onClick={handleSaveSwaggerAuth}
            disabled={swaggerSaving}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {swaggerSaving ? "Saving..." : "Save Access"}
          </button>
          <p className="md:col-span-3 text-xs text-gray-400">
            Status: {swaggerAuth.configured ? "Configured" : "Not configured"}
            {swaggerAuth.updatedAt ? ` · Updated ${new Date(swaggerAuth.updatedAt).toLocaleString()}` : ""}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-white">Stream Domains</h2>
          <p className="text-xs text-gray-400">
            One domain per line. The first domain is the primary source and the
            remaining domains are fallback sources.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={streamDomainText}
            onChange={(e) => setStreamDomainText(e.target.value)}
            rows={8}
            placeholder="https://vidsrcme.ru&#10;https://vidsrc-embed.ru&#10;https://vsrc.su"
            className="w-full rounded-md border border-gray-600 bg-gray-900 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Tip: You can paste domains separated by newline or comma.
            </p>
            <button
              onClick={handleSaveStreamDomains}
              disabled={streamSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {streamSaving ? "Saving..." : "Save Stream Domains"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
