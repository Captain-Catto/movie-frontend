import { useEffect, useState, useCallback, useMemo } from "react";
import { useToastRedux } from "@/hooks/useToastRedux";
import { useAdminApi } from "@/hooks/useAdminApi";
import { SeoMetadata } from "@/types/seo";

export const PAGE_TYPE_OPTIONS = [
  "home",
  "movies",
  "tv_series",
  "trending",
  "browse",
  "favorites",
  "people",
  "custom",
];

export const LOCALE_OPTIONS = ["vi", "en"] as const;

export interface SeoStats {
  totalPages: number;
  activePages: number;
  inactivePages: number;
  avgTitleLength: number;
  avgDescriptionLength: number;
}

export const mapSeoRecord = (item: unknown): SeoMetadata => {
  const record = item as Record<string, unknown>;
  const getString = (key: string, fallback = "") => {
    const value = record[key];
    return typeof value === "string" ? value : fallback;
  };
  const getBoolean = (key: string): boolean | undefined => {
    const value = record[key];
    return typeof value === "boolean" ? value : undefined;
  };

  const rawKeywords = record["keywords"];
  const keywordsArray = Array.isArray(rawKeywords)
    ? rawKeywords
    : typeof rawKeywords === "string"
    ? rawKeywords
        .replace(/[{}]/g, "")
        .split(/[;,]/)
        .flatMap((k) => {
          const t = k.trim();
          return t ? [t] : [];
        })
    : [];

  return {
    id: Number(record["id"] || 0),
    pageType: getString("pageType") || getString("page_type"),
    path: getString("pageSlug") || getString("page_slug") || getString("path"),
    locale: (getString("locale") || "vi").toLowerCase(),
    title: getString("title"),
    description: getString("description"),
    keywords: keywordsArray,
    ogTitle: getString("ogTitle") || getString("og_title"),
    ogDescription: getString("ogDescription") || getString("og_description"),
    ogImage: getString("ogImage") || getString("og_image"),
    twitterTitle: getString("twitterTitle") || getString("twitter_title"),
    twitterDescription: getString("twitterDescription") || getString("twitter_description"),
    twitterImage: getString("twitterImage") || getString("twitter_image"),
    isActive: getBoolean("isActive") ?? getBoolean("is_active") ?? true,
    createdAt: getString("createdAt") || getString("created_at"),
    updatedAt: getString("updatedAt") || getString("updated_at"),
  };
};

const REFRESH_INTERVAL_MS = 30_000;

export function useAdminSeo() {
  const [seoData, setSeoData] = useState<SeoMetadata[]>([]);
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [lastCheckSummary, setLastCheckSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showSuccess, showError } = useToastRedux();
  const adminApi = useAdminApi();

  const [editModal, setEditModal] = useState<{
    open: boolean;
    seo: SeoMetadata | null;
    isNew: boolean;
  }>({ open: false, seo: null, isNew: false });

  const [formData, setFormData] = useState({
    pageType: "",
    path: "",
    locale: "vi",
    title: "",
    description: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    isActive: true,
  });

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [resolvePath, setResolvePath] = useState("/");
  const [resolveLocale, setResolveLocale] = useState<"vi" | "en">("vi");
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveResult, setResolveResult] = useState<SeoMetadata | null>(null);

  const revalidateSeoCache = useCallback(async (path?: string, locale?: string) => {
    try {
      await fetch("/api/revalidate/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path,
          locale,
        }),
      });
    } catch (error) {
      console.error("Failed to revalidate SEO cache:", error);
    }
  }, []);

  const fetchSeoData = useCallback(async () => {
    if (!adminApi.isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await adminApi.get<SeoMetadata[] | { data: SeoMetadata[] }>("/admin/seo");

      if (response.success) {
        const payload = response.data;
        const rawItems = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as { data?: unknown })?.data)
          ? ((payload as { data: unknown[] }).data as unknown[])
          : [];

        const normalized = rawItems.map(mapSeoRecord);
        setSeoData(normalized);
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
    } finally {
      setLoading(false);
    }
  }, [adminApi]);

  const fetchStats = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    try {
      const response = await adminApi.get<SeoStats | { data: SeoStats }>("/admin/seo/stats/overview");

      if (response.success && response.data) {
        const stats = (response.data as { data?: SeoStats })?.data || response.data;
        setStats(stats as SeoStats);
      }
    } catch (error) {
      console.error("Error fetching SEO stats:", error);
    }
  }, [adminApi]);

  useEffect(() => {
    if (adminApi.isAuthenticated) {
      fetchSeoData();
      fetchStats();
    }
  }, [adminApi.isAuthenticated, fetchSeoData, fetchStats]);

  useEffect(() => {
    if (!autoRefresh || !adminApi.isAuthenticated) return;
    const id = window.setInterval(() => {
      fetchSeoData();
      fetchStats();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, adminApi.isAuthenticated, fetchSeoData, fetchStats]);

  const handleSubmit = async () => {
    if (!adminApi.isAuthenticated) {
      setErrorMessage("Missing authentication token");
      return;
    }
    try {
      setErrorMessage(null);

      if (!PAGE_TYPE_OPTIONS.includes(formData.pageType)) {
        const msg = "Page type must be one of the predefined options.";
        setErrorMessage(msg);
        showError("Invalid page type", msg);
        return;
      }

      const normalizedKeywords = formData.keywords
        .split(",")
        .flatMap((k) => {
          const t = k.trim();
          return t ? [t] : [];
        })
        .join(", ");

      const payload = {
        ...formData,
        pageSlug: formData.path || null,
        keywords: normalizedKeywords,
      };

      const response = editModal.isNew
        ? await adminApi.post("/admin/seo", payload)
        : await adminApi.put(`/admin/seo/${editModal.seo?.id}`, payload);

      if (!response.success) {
        const message = response.error || "Failed to save SEO metadata";
        setErrorMessage(message);
        showError("Save failed", message);
        return;
      }

      setEditModal({ open: false, seo: null, isNew: false });
      resetForm();
      fetchSeoData();
      fetchStats();
      await revalidateSeoCache(formData.path, formData.locale);
      showSuccess("Saved", editModal.isNew ? "Created SEO metadata" : "Updated SEO metadata");
    } catch (error) {
      console.error("Error saving SEO data:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error saving SEO data");
      showError("Save failed", error instanceof Error ? error.message : "Error saving SEO data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!adminApi.isAuthenticated) {
      showError("Delete failed", "Missing authentication token");
      return;
    }
    if (!confirm("Are you sure you want to delete this SEO metadata?")) return;

    try {
      const response = await adminApi.delete(`/admin/seo/${id}`);

      if (response.success) {
        fetchSeoData();
        fetchStats();
        await revalidateSeoCache();
        showSuccess("Deleted", "SEO metadata removed");
      } else {
        const msg = response.error || "Failed to delete SEO metadata";
        showError("Delete failed", msg);
      }
    } catch (error) {
      console.error("Error deleting SEO data:", error);
      showError("Delete failed", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleToggleActive = async (id: number) => {
    if (!adminApi.isAuthenticated) {
      showError("Toggle failed", "Missing authentication token");
      return;
    }
    try {
      const response = await adminApi.post(`/admin/seo/${id}/toggle`);

      if (response.success) {
        fetchSeoData();
        fetchStats();
        await revalidateSeoCache();
        showSuccess("Toggled", "SEO status updated");
      } else {
        const msg = response.error || "Failed to toggle SEO status";
        showError("Toggle failed", msg);
      }
    } catch (error) {
      console.error("Error toggling SEO status:", error);
      showError("Toggle failed", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const setupDefaults = async () => {
    if (!adminApi.isAuthenticated) {
      showError("Setup failed", "Missing authentication token");
      return;
    }
    try {
      const response = await adminApi.post("/admin/seo/setup/defaults");

      if (response.success) {
        fetchSeoData();
        fetchStats();
        await revalidateSeoCache();
        showSuccess("Defaults created", "Default SEO entries set up");
      } else {
        const msg = response.error || "Failed to setup defaults";
        showError("Setup failed", msg);
      }
    } catch (error) {
      console.error("Error setting up defaults:", error);
      showError("Setup failed", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const openEditModal = (seo: SeoMetadata | null, isNew: boolean) => {
    if (seo) {
      setFormData({
        pageType: seo.pageType,
        path: seo.path,
        locale: seo.locale || "vi",
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords.join(", "),
        ogTitle: seo.ogTitle || "",
        ogDescription: seo.ogDescription || "",
        ogImage: seo.ogImage || "",
        twitterTitle: seo.twitterTitle || "",
        twitterDescription: seo.twitterDescription || "",
        twitterImage: seo.twitterImage || "",
        isActive: seo.isActive,
      });
    } else {
      resetForm();
    }
    setEditModal({ open: true, seo, isNew });
  };

  const resetForm = () => {
    setFormData({
      pageType: "",
      path: "",
      locale: "vi",
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      isActive: true,
    });
  };

  const handleRefresh = useCallback(() => {
    fetchSeoData();
    fetchStats();
  }, [fetchSeoData, fetchStats]);

  const handleResolvePreview = async () => {
    const normalizedPath = resolvePath.trim();
    if (!normalizedPath) {
      showError("Resolve failed", "Path is required");
      return;
    }

    try {
      setResolveLoading(true);
      setResolveResult(null);
      const response = await adminApi.get<SeoMetadata | { data?: SeoMetadata | null } | null>(
        `/seo/resolve?path=${encodeURIComponent(normalizedPath)}&locale=${encodeURIComponent(
          resolveLocale
        )}`
      );

      if (!response.success) {
        const message = response.error || "Failed to resolve SEO metadata";
        showError("Resolve failed", message);
        return;
      }

      const payload = response.data as SeoMetadata | { data?: SeoMetadata | null } | null;
      const raw =
        payload && typeof payload === "object" && "data" in payload
          ? (payload as { data?: unknown }).data
          : payload;

      if (!raw || typeof raw !== "object") {
        showSuccess("Resolve", "No SEO metadata found for this path/locale");
        return;
      }

      setResolveResult(mapSeoRecord(raw));
      showSuccess("Resolve", "SEO metadata resolved");
    } catch (error) {
      showError("Resolve failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setResolveLoading(false);
    }
  };

  const exportSeoData = (format: "csv" | "excel") => {
    if (!seoData.length) {
      const message = "No SEO data to export";
      setErrorMessage(message);
      showError("Export failed", message);
      return;
    }

    const escapeValue = (value: unknown) => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      "Page Type",
      "Path",
      "Locale",
      "Title",
      "Description",
      "Keywords",
      "Active",
      "OG Title",
      "OG Description",
      "OG Image",
      "Twitter Title",
      "Twitter Description",
      "Twitter Image",
      "Updated At",
    ];

    const rows = seoData.map((item) => [
      escapeValue(item.pageType),
      escapeValue(item.path),
      escapeValue(item.locale || "vi"),
      escapeValue(item.title),
      escapeValue(item.description),
      escapeValue(Array.isArray(item.keywords) ? item.keywords.join(", ") : ""),
      escapeValue(item.isActive ? "Yes" : "No"),
      escapeValue(item.ogTitle || ""),
      escapeValue(item.ogDescription || ""),
      escapeValue(item.ogImage || ""),
      escapeValue(item.twitterTitle || ""),
      escapeValue(item.twitterDescription || ""),
      escapeValue(item.twitterImage || ""),
      escapeValue(item.updatedAt || ""),
    ]);

    const csvString = [headers.map(escapeValue).join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const isExcel = format === "excel";
    const blob = new Blob([isExcel ? `sep=,\n${csvString}` : csvString], {
      type: isExcel ? "application/vnd.ms-excel;charset=utf-8;" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seo-metadata-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.${isExcel ? "xls" : "csv"}`;
    link.click();
    URL.revokeObjectURL(url);

    showSuccess("Export ready", `Downloaded SEO data as ${isExcel ? "Excel" : "CSV"}`);
  };

  const handleSeoHealthComplete = useCallback((res: {
    total: number;
    missingTitle: number;
    missingDescription: number;
    duplicates: unknown[];
  }) => {
    setLastCheckedAt(new Date().toLocaleString());
    setLastCheckSummary(
      `Checked ${res.total} entries · Missing titles: ${res.missingTitle}, descriptions: ${res.missingDescription}, duplicates: ${res.duplicates.length}`
    );
  }, []);

  const statusChartData = useMemo(
    () =>
      stats
        ? [
            { name: "Active", value: stats.activePages },
            { name: "Inactive", value: stats.inactivePages },
          ]
        : [],
    [stats]
  );

  const lengthChartData = useMemo(
    () =>
      stats
        ? [
            { name: "Title length", value: stats.avgTitleLength },
            { name: "Description length", value: stats.avgDescriptionLength },
          ]
        : [],
    [stats]
  );

  const filteredSeoData = Array.isArray(seoData)
    ? seoData.filter((seo) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "active" && seo.isActive) ||
          (filter === "inactive" && !seo.isActive);

        const matchesSearch =
          searchTerm === "" ||
          seo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seo.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seo.pageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (seo.locale || "vi").toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
      })
    : [];

  return {
    seoData,
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
    revalidateSeoCache,
    fetchSeoData,
    fetchStats,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    setupDefaults,
    openEditModal,
    resetForm,
    handleRefresh,
    handleResolvePreview,
    exportSeoData,
    handleSeoHealthComplete,
  };
}
