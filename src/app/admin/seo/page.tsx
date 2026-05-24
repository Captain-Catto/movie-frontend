"use client";

import dynamic from "next/dynamic";
import CheckSeoHealth from "./checker";
import { SeoMetadata } from "@/types/seo";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";
import {
  useAdminSeo,
  PAGE_TYPE_OPTIONS,
  LOCALE_OPTIONS,
  type SeoStats,
} from "@/hooks/useAdminSeo";

const SeoChartsSection = dynamic(() => import("./SeoChartsSection"), { ssr: false });

function AdminSeoHeader() {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold text-white">{labels.seoHeaderTitle}</h1>
      <p className="text-gray-400">
        {labels.seoHeaderDesc}
      </p>
    </div>
  );
}

function AdminSeoErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-red-500 bg-red-900/50 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}

function AdminSeoHealthSection({
  lastCheckedAt,
  lastCheckSummary,
  onComplete,
}: {
  lastCheckedAt: string | null;
  lastCheckSummary: string | null;
  onComplete: (res: {
    total: number;
    missingTitle: number;
    missingDescription: number;
    duplicates: unknown[];
  }) => void;
}) {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 gap-y-3">
      <CheckSeoHealth onComplete={onComplete} />
      {lastCheckedAt && lastCheckSummary && (
        <p className="text-sm text-gray-500" suppressHydrationWarning>
          {language.startsWith("vi") ? "Lần kiểm tra cuối: " : "Last checker run: "} {lastCheckedAt}, {lastCheckSummary}
        </p>
      )}
    </div>
  );
}

function AdminSeoStatsSection({
  stats,
  statusChartData,
  lengthChartData,
}: {
  stats: SeoStats | null;
  statusChartData: { name: string; value: number }[];
  lengthChartData: { name: string; value: number }[];
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  if (!stats) return null;

  return (
    <div className="gap-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white">{labels.seoTotalPages}</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.totalPages}</p>
          <p className="text-xs text-gray-400 mt-1">{labels.seoAllTracked}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white">{labels.seoActive}</h3>
          <p className="text-3xl font-bold text-green-400">{stats.activePages}</p>
          <p className="text-xs text-gray-400 mt-1">{labels.seoCurrentlyEnabled}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white">{labels.seoInactive}</h3>
          <p className="text-3xl font-bold text-red-400">{stats.inactivePages}</p>
          <p className="text-xs text-gray-400 mt-1">{labels.seoDisabledOrDraft}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white">{labels.seoAvgTitleLength}</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.avgTitleLength}</p>
          <p className="text-xs text-gray-400 mt-1">{labels.seoIdealTitle}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white">{labels.seoAvgDescLength}</h3>
          <p className="text-3xl font-bold text-amber-400">{stats.avgDescriptionLength}</p>
          <p className="text-xs text-gray-400 mt-1">{labels.seoIdealDesc}</p>
        </div>
      </div>

      <SeoChartsSection
        statusChartData={statusChartData}
        lengthChartData={lengthChartData}
      />
    </div>
  );
}

function AdminSeoToolbar({
  autoRefresh,
  filter,
  searchTerm,
  onAdd,
  onSetupDefaults,
  onRefresh,
  onAutoRefreshChange,
  onFilterChange,
  onSearchTermChange,
  onExport,
}: {
  autoRefresh: boolean;
  filter: "all" | "active" | "inactive";
  searchTerm: string;
  onAdd: () => void;
  onSetupDefaults: () => void;
  onRefresh: () => void;
  onAutoRefreshChange: (checked: boolean) => void;
  onFilterChange: (value: "all" | "active" | "inactive") => void;
  onSearchTermChange: (value: string) => void;
  onExport: (format: "csv" | "excel") => void;
}) {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 gap-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={onAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          {language.startsWith("vi") ? "Thêm SEO Metadata" : "Add SEO Metadata"}
        </button>
        <button
          type="button"
          onClick={onSetupDefaults}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
        >
          {language.startsWith("vi") ? "Thiết lập mặc định" : "Setup Defaults"}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 cursor-pointer"
        >
          {language.startsWith("vi") ? "Tải lại dữ liệu" : "Refresh now"}
        </button>
        <div className="flex items-center gap-2">
          <input
            id="auto-refresh"
            type="checkbox"
            aria-label="Auto refresh SEO data"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
            className="size-4 accent-red-500"
          />
          <label htmlFor="auto-refresh" className="text-sm text-gray-300">
            {language.startsWith("vi") ? "Tự động tải lại (30s)" : "Auto refresh (30s)"}
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          aria-label="Filter by status"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as "all" | "active" | "inactive")}
          className="border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2"
        >
          <option value="all">{language.startsWith("vi") ? "Tất cả" : "All"}</option>
          <option value="active">{language.startsWith("vi") ? "Hoạt động" : "Active"}</option>
          <option value="inactive">{language.startsWith("vi") ? "Không hoạt động" : "Inactive"}</option>
        </select>

        <input
          type="text"
          placeholder={language.startsWith("vi") ? "Tìm kiếm các trang..." : "Search pages..."}
          aria-label="Search SEO pages"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2 flex-1 min-w-[220px] max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onExport("csv")}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 cursor-pointer"
          >
            {language.startsWith("vi") ? "Xuất file CSV" : "Export CSV"}
          </button>
          <button
            type="button"
            onClick={() => onExport("excel")}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 cursor-pointer"
          >
            {language.startsWith("vi") ? "Xuất file Excel" : "Export Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminSeoResolveSection({
  resolvePath,
  resolveLocale,
  resolveLoading,
  resolveResult,
  onResolvePathChange,
  onResolveLocaleChange,
  onResolve,
}: {
  resolvePath: string;
  resolveLocale: "vi" | "en";
  resolveLoading: boolean;
  resolveResult: SeoMetadata | null;
  onResolvePathChange: (value: string) => void;
  onResolveLocaleChange: (value: "vi" | "en") => void;
  onResolve: () => void;
}) {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 gap-y-3">
      <h3 className="text-base font-semibold text-white">
        {language.startsWith("vi") ? "Kiểm tra hiển thị SEO (Test Resolve)" : "SEO Resolve Test"}
      </h3>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={resolvePath}
          aria-label="Resolve path"
          onChange={(e) => onResolvePathChange(e.target.value)}
          placeholder={language.startsWith("vi") ? "Ví dụ: /movies hoặc /movie/[id]" : "e.g., /movies or /movie/[id]"}
          className="border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2 flex-1 min-w-[220px]"
        />
        <select
          aria-label="Resolve locale"
          value={resolveLocale}
          onChange={(e) => onResolveLocaleChange(e.target.value as "vi" | "en")}
          className="border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2"
        >
          {LOCALE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onResolve}
          disabled={resolveLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {resolveLoading ? (language.startsWith("vi") ? "Đang truy vấn…" : "Resolving…") : (language.startsWith("vi") ? "Truy vấn" : "Resolve")}
        </button>
      </div>
      {resolveResult && (
        <div className="rounded-md border border-gray-700 bg-gray-900 p-3 text-sm text-gray-200">
          <p>
            <span className="text-gray-400">Path:</span> {resolveResult.path}
          </p>
          <p>
            <span className="text-gray-400">Locale:</span> {resolveResult.locale.toUpperCase()}
          </p>
          <p>
            <span className="text-gray-400">Title:</span> {resolveResult.title}
          </p>
          <p>
            <span className="text-gray-400">Description:</span> {resolveResult.description}
          </p>
        </div>
      )}
    </div>
  );
}

function AdminSeoTable({
  loading,
  filteredSeoData,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  loading: boolean;
  filteredSeoData: SeoMetadata[];
  onEdit: (seo: SeoMetadata) => void;
  onToggleActive: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {language.startsWith("vi") ? "Trang" : "Page"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {language.startsWith("vi") ? "Ngôn ngữ" : "Locale"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {language.startsWith("vi") ? "Tiêu đề" : "Title"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {language.startsWith("vi") ? "Mô tả" : "Description"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {language.startsWith("vi") ? "Trạng thái" : "Status"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {language.startsWith("vi") ? "Thao tác" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 border border-gray-700 divide-y divide-gray-700">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center">
                {language.startsWith("vi") ? "Đang tải dữ liệu…" : "Loading…"}
              </td>
            </tr>
          ) : filteredSeoData.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center">
                {language.startsWith("vi") ? "Không tìm thấy dữ liệu SEO nào" : "No SEO data found"}
              </td>
            </tr>
          ) : (
            filteredSeoData.map((seo) => (
              <tr key={seo.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">{seo.pageType}</div>
                    <div className="text-sm text-gray-400">{seo.path}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100">
                    {(seo.locale || "vi").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white max-w-xs truncate">{seo.title}</div>
                  <div className="text-xs text-gray-400">{seo.title.length} {language.startsWith("vi") ? "ký tự" : "chars"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white max-w-xs truncate">{seo.description}</div>
                  <div className="text-xs text-gray-400">{seo.description.length} {language.startsWith("vi") ? "ký tự" : "chars"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      seo.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {seo.isActive 
                      ? (language.startsWith("vi") ? "Hoạt động" : "Active") 
                      : (language.startsWith("vi") ? "Tắt" : "Inactive")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-x-2">
                    <button
                      type="button"
                      onClick={() => onEdit(seo)}
                      className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    >
                      {language.startsWith("vi") ? "Sửa" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(seo.id)}
                      aria-label={seo.isActive ? "Deactivate" : "Activate"}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {seo.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(seo.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      {language.startsWith("vi") ? "Xóa" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminSeoEditModal({
  open,
  isNew,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}: {
  open: boolean;
  isNew: boolean;
  formData: {
    pageType: string;
    path: string;
    locale: string;
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    isActive: boolean;
  };
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (patch: Partial<{
    pageType: string;
    path: string;
    locale: string;
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    isActive: boolean;
  }>) => void;
}) {
  const { language } = useLanguage();
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-white">
          {isNew ? (language.startsWith("vi") ? "Thêm mới SEO" : "Add SEO Metadata") : (language.startsWith("vi") ? "Cập nhật SEO" : "Edit SEO Metadata")}
        </h2>

        <div className="gap-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="seo-page-type" className="block text-sm font-medium text-white">
                {language.startsWith("vi") ? "Loại Trang" : "Page Type"}
              </label>
              <select
                id="seo-page-type"
                aria-label="SEO page type"
                value={formData.pageType}
                onChange={(e) => onFormChange({ pageType: e.target.value })}
                className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              >
                <option value="">{language.startsWith("vi") ? "Chọn loại trang" : "Select page type"}</option>
                {PAGE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="seo-path" className="block text-sm font-medium text-white">
                {language.startsWith("vi") ? "Đường dẫn (Path)" : "Path"}
              </label>
              <input
                id="seo-path"
                type="text"
                aria-label="SEO path"
                value={formData.path}
                onChange={(e) => onFormChange({ path: e.target.value })}
                className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
                placeholder="e.g., /movie/[id]"
              />
            </div>
            <div>
              <label htmlFor="seo-locale" className="block text-sm font-medium text-white">
                {language.startsWith("vi") ? "Ngôn ngữ" : "Locale"}
              </label>
              <select
                id="seo-locale"
                aria-label="SEO locale"
                value={formData.locale}
                onChange={(e) => onFormChange({ locale: e.target.value })}
                className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              >
                {LOCALE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="seo-title" className="block text-sm font-medium text-white">
              {language.startsWith("vi") ? "Tiêu đề (Title)" : "Title"}
            </label>
            <input
              id="seo-title"
              type="text"
              aria-label="SEO title"
              value={formData.title}
              onChange={(e) => onFormChange({ title: e.target.value })}
              className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.title.length} {language.startsWith("vi") ? "ký tự" : "characters"}</p>
          </div>

          <div>
            <label htmlFor="seo-description" className="block text-sm font-medium text-white">
              {language.startsWith("vi") ? "Mô tả (Description)" : "Description"}
            </label>
            <textarea
              id="seo-description"
              aria-label="SEO description"
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length} {language.startsWith("vi") ? "ký tự" : "characters"}</p>
          </div>

          <div>
            <label htmlFor="seo-keywords" className="block text-sm font-medium text-white">
              {language.startsWith("vi") ? "Từ khóa (ngăn cách bằng dấu phẩy)" : "Keywords (comma-separated)"}
            </label>
            <input
              id="seo-keywords"
              type="text"
              aria-label="SEO keywords"
              value={formData.keywords}
              onChange={(e) => onFormChange({ keywords: e.target.value })}
              className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
            />
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-md font-medium mb-2 text-white">Open Graph</h3>
            <div className="gap-y-3">
              <input
                type="text"
                placeholder={language.startsWith("vi") ? "OG Title" : "OG Title"}
                aria-label="OG Title"
                value={formData.ogTitle}
                onChange={(e) => onFormChange({ ogTitle: e.target.value })}
                className="block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              />
              <textarea
                placeholder={language.startsWith("vi") ? "OG Description" : "OG Description"}
                aria-label="OG Description"
                value={formData.ogDescription}
                onChange={(e) => onFormChange({ ogDescription: e.target.value })}
                className="block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
                rows={2}
              />
              <input
                type="text"
                placeholder={language.startsWith("vi") ? "Link hình ảnh OG" : "OG Image URL"}
                aria-label="OG Image URL"
                value={formData.ogImage}
                onChange={(e) => onFormChange({ ogImage: e.target.value })}
                className="block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-md font-medium mb-2 text-white">Twitter</h3>
            <div className="gap-y-3">
              <input
                type="text"
                placeholder="Twitter Title"
                aria-label="Twitter Title"
                value={formData.twitterTitle}
                onChange={(e) => onFormChange({ twitterTitle: e.target.value })}
                className="block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              />
              <textarea
                placeholder="Twitter Description"
                aria-label="Twitter Description"
                value={formData.twitterDescription}
                onChange={(e) => onFormChange({ twitterDescription: e.target.value })}
                className="block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
                rows={2}
              />
              <input
                type="text"
                placeholder="Twitter Image URL"
                aria-label="Twitter Image URL"
                value={formData.twitterImage}
                onChange={(e) => onFormChange({ twitterImage: e.target.value })}
                className="block w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-900 text-white"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              aria-label="SEO entry active"
              checked={formData.isActive}
              onChange={(e) => onFormChange({ isActive: e.target.checked })}
              className="mr-2 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer select-none">
              {language.startsWith("vi") ? "Hoạt động" : "Active"}
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 cursor-pointer"
          >
            {language.startsWith("vi") ? "Hủy" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer"
          >
            {isNew ? (language.startsWith("vi") ? "Tạo" : "Create") : (language.startsWith("vi") ? "Cập nhật" : "Update")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSeoPage() {
  const {
    stats,
    loading,
    lastCheckedAt,
    lastCheckSummary,
    errorMessage,
    editModal,
    formData,
    filter,
    searchTerm,
    autoRefresh,
    resolvePath,
    resolveLocale,
    resolveLoading,
    resolveResult,
    statusChartData,
    lengthChartData,
    filteredSeoData,
    setFormData,
    setFilter,
    setSearchTerm,
    setAutoRefresh,
    setResolvePath,
    setResolveLocale,
    setEditModal,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    setupDefaults,
    openEditModal,
    handleRefresh,
    handleResolvePreview,
    exportSeoData,
    handleSeoHealthComplete,
  } = useAdminSeo();

  return (
    <div className="space-y-6">
      <AdminSeoHeader />
      <AdminSeoErrorBanner message={errorMessage} />
      <AdminSeoHealthSection
        lastCheckedAt={lastCheckedAt}
        lastCheckSummary={lastCheckSummary}
        onComplete={handleSeoHealthComplete}
      />
      <AdminSeoStatsSection
        stats={stats}
        statusChartData={statusChartData}
        lengthChartData={lengthChartData}
      />
      <AdminSeoToolbar
        autoRefresh={autoRefresh}
        filter={filter}
        searchTerm={searchTerm}
        onAdd={() => openEditModal(null, true)}
        onSetupDefaults={setupDefaults}
        onRefresh={handleRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onFilterChange={setFilter}
        onSearchTermChange={setSearchTerm}
        onExport={exportSeoData}
      />
      <AdminSeoResolveSection
        resolvePath={resolvePath}
        resolveLocale={resolveLocale}
        resolveLoading={resolveLoading}
        resolveResult={resolveResult}
        onResolvePathChange={setResolvePath}
        onResolveLocaleChange={setResolveLocale}
        onResolve={handleResolvePreview}
      />
      <AdminSeoTable
        loading={loading}
        filteredSeoData={filteredSeoData}
        onEdit={(seo) => openEditModal(seo, false)}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />
      <AdminSeoEditModal
        open={editModal.open}
        isNew={editModal.isNew}
        formData={formData}
        onClose={() => setEditModal({ open: false, seo: null, isNew: false })}
        onSubmit={handleSubmit}
        onFormChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
      />
    </div>
  );
}
