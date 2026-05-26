"use client";

import { useAdminSettings, type RegistrationSettings, type SwaggerAuthSettings } from "@/hooks/useAdminSettings";
import EffectSettings from "@/components/settings/EffectSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const ITEMS: Array<{ key: keyof RegistrationSettings; label: string }> = [
  { key: "nickname", label: "Nickname" },
  { key: "password", label: "Password" },
];

function AdminSettingsHeader({
  saving,
  isViewer,
  onSave,
}: {
  saving: boolean;
  isViewer: boolean;
  onSave: () => void;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const { showWarning } = useToast();

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-white">{labels.siteSettings}</h1>
        <p className="text-gray-400 mt-1">
          {labels.adjustConstraints}
        </p>
      </div>
      <button
        type="button"
        onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onSave(); }}
        disabled={saving}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
      >
        {saving ? labels.saving : labels.saveChanges}
      </button>
    </div>
  );
}

function AdminRegistrationSettingsSection({
  loading,
  settings,
  onUpdateValue,
}: {
  loading: boolean;
  settings: RegistrationSettings;
  onUpdateValue: (key: keyof RegistrationSettings, field: "min" | "max", value: number) => void;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 self-start">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {labels.registrationItems}
        </h2>
        {loading && (
          <span className="text-sm text-gray-400 animate-pulse">
            {labels.loadingLabel}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {labels.item}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {labels.condition}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {ITEMS.map((item) => {
              const itemLabel = item.key === "nickname" ? labels.displayName : labels.password;
              return (
                <tr key={item.key}>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {itemLabel}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-x-3">
                      <div className="flex items-center gap-x-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-700 text-white">
                          Min
                        </span>
                        <input
                          type="number"
                          min={1}
                          aria-label={`${item.label} minimum`}
                          value={settings[item.key].min}
                          onChange={(e) =>
                            onUpdateValue(
                              item.key,
                              "min",
                              Number(e.target.value || 0)
                            )
                          }
                          className="w-14 px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div className="flex items-center gap-x-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-700 text-white">
                          Max
                        </span>
                        <input
                          type="number"
                          min={1}
                          aria-label={`${item.label} maximum`}
                          value={settings[item.key].max}
                          onChange={(e) =>
                            onUpdateValue(
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminEffectsSettingsSection() {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">
          {labels.visualEffectsSettings}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {labels.controlVisualEffects}
        </p>
      </div>
      <div className="p-6">
        <EffectSettings />
      </div>
    </div>
  );
}

function AdminSwaggerAccessSection({
  swaggerAuth,
  swaggerAuthForm,
  swaggerSaving,
  isViewer,
  onFormChange,
  onSave,
}: {
  swaggerAuth: SwaggerAuthSettings;
  swaggerAuthForm: { username: string; password?: string };
  swaggerSaving: boolean;
  isViewer: boolean;
  onFormChange: (patch: Partial<{ username: string; password?: string }>) => void;
  onSave: () => void;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const { showWarning } = useToast();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white">{labels.swaggerAccess}</h2>
        <p className="text-xs text-gray-400">
          {labels.swaggerDesc}
        </p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
        <div>
          <label htmlFor="swagger-auth-username" className="block text-sm font-medium text-gray-300 mb-2">
            {labels.username}
          </label>
          <input
            id="swagger-auth-username"
            type="text"
            aria-label="Swagger username"
            value={swaggerAuthForm.username}
            onChange={(e) => onFormChange({ username: e.target.value })}
            className="w-full rounded-md border border-gray-600 bg-gray-900 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="docs-admin"
          />
        </div>
        <div>
          <label htmlFor="swagger-auth-password" className="block text-sm font-medium text-gray-300 mb-2">
            {labels.password}
          </label>
          <input
            id="swagger-auth-password"
            type="password"
            aria-label="Swagger password"
            value={swaggerAuthForm.password}
            onChange={(e) => onFormChange({ password: e.target.value })}
            className="w-full rounded-md border border-gray-600 bg-gray-900 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder={
              swaggerAuth.configured
                ? labels.passwordPlaceholder
                : labels.atLeast8Chars
            }
          />
        </div>
        <button
          type="button"
          onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onSave(); }}
          disabled={swaggerSaving}
          className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {swaggerSaving ? labels.saving : labels.saveAccess}
        </button>
        <p className="md:col-span-3 text-xs text-gray-400" suppressHydrationWarning>
          {labels.swaggerStatus}: {swaggerAuth.configured ? labels.configured : labels.notConfigured}
          {swaggerAuth.updatedAt ? ` · ${labels.updatedAtLabel} ${new Date(swaggerAuth.updatedAt).toLocaleString()}` : ""}
          {swaggerAuth.updatedBy?.email
            ? ` · ${labels.modifiedBy} ${swaggerAuth.updatedBy.name || swaggerAuth.updatedBy.email} (${swaggerAuth.updatedBy.role || "unknown"})`
            : ""}
        </p>
      </div>
    </div>
  );
}

function AdminStreamDomainsSection({
  streamDomainText,
  streamSaving,
  isViewer,
  onTextChange,
  onSave,
}: {
  streamDomainText: string;
  streamSaving: boolean;
  isViewer: boolean;
  onTextChange: (text: string) => void;
  onSave: () => void;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const { showWarning } = useToast();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white">{labels.streamDomains}</h2>
        <p className="text-xs text-gray-400">
          {labels.streamDomainsDesc}
        </p>
      </div>
      <div className="p-6 gap-y-4">
        <textarea
          value={streamDomainText}
          onChange={(e) => onTextChange(e.target.value)}
          rows={8}
          aria-label="Stream domains"
          placeholder={labels.streamDomainsPlaceholder}
          className="w-full rounded-md border border-gray-600 bg-gray-900 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {labels.streamDomainsTip}
          </p>
          <button
            type="button"
            onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onSave(); }}
            disabled={streamSaving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {streamSaving ? labels.saving : labels.saveStreamDomains}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { isViewer } = useAuth();
  const {
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
  } = useAdminSettings();

  return (
    <div className="space-y-6">
      <AdminSettingsHeader saving={saving} isViewer={isViewer} onSave={handleSave} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminRegistrationSettingsSection
          loading={loading}
          settings={settings}
          onUpdateValue={updateValue}
        />
        <AdminEffectsSettingsSection />
      </div>

      <AdminSwaggerAccessSection
        swaggerAuth={swaggerAuth}
        swaggerAuthForm={swaggerAuthForm}
        swaggerSaving={swaggerSaving}
        isViewer={isViewer}
        onFormChange={(patch) => setSwaggerAuthForm((prev) => ({ ...prev, ...patch }))}
        onSave={handleSaveSwaggerAuth}
      />

      <AdminStreamDomainsSection
        streamDomainText={streamDomainText}
        streamSaving={streamSaving}
        isViewer={isViewer}
        onTextChange={setStreamDomainText}
        onSave={handleSaveStreamDomains}
      />
    </div>
  );
}

