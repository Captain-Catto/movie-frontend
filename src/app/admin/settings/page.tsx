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

  const fetchSettings = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    setLoading(true);
    try {
      const res = await adminApi.get<RegistrationSettings>(
        "/admin/settings/registration"
      );
      if (res.success && res.data) {
        setSettings(res.data as RegistrationSettings);
      } else if (res.error) {
        showError("Load failed", res.error);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      showError("Load failed", "Failed to load settings");
    } finally {
      setLoading(false);
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
    </div>
  );
}
