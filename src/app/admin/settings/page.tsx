"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminApi } from "@/hooks/useAdminApi";

type MinMax = { min: number; max: number };
type RegistrationSettings = {
  id: MinMax;
  nickname: MinMax;
  password: MinMax;
};

const ITEMS: Array<{ key: keyof RegistrationSettings; label: string }> = [
  { key: "id", label: "ID" },
  { key: "nickname", label: "Nickname" },
  { key: "password", label: "Password" },
];

export default function AdminSettingsPage() {
  const adminApi = useAdminApi();
  const [settings, setSettings] = useState<RegistrationSettings>({
    id: { min: 6, max: 16 },
    nickname: { min: 3, max: 16 },
    password: { min: 8, max: 16 },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchSettings = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get<RegistrationSettings>(
        "/admin/settings/registration"
      );
      if (res.success && res.data) {
        setSettings(res.data as RegistrationSettings);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [adminApi]);

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
    setError("");
    setMessage("");
    try {
      const res = await adminApi.put<RegistrationSettings>(
        "/admin/settings/registration",
        settings
      );
      if (res.success && res.data) {
        setSettings(res.data as RegistrationSettings);
        setMessage("Settings saved");
      } else {
        setError(res.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Site Settings</h1>
            <p className="text-gray-400 mt-1">
              Adjust registration constraints without hardcoding.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
            {error}
          </div>
        )}
        {message && (
          <div className="px-4 py-3 rounded-lg bg-green-900/40 border border-green-700 text-green-200">
            {message}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg border border-gray-700">
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {ITEMS.map((item) => (
                  <tr key={item.key}>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {item.label}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-green-700 text-white">
                            Minimum
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
                            className="w-16 px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-700 text-white">
                            Maximum
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
                            className="w-16 px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
      </div>
    </AdminLayout>
  );
}
