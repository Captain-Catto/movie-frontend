"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CheckSeoHealth from "./checker";
import { SeoMetadata } from "@/types/seo";
import { API_BASE_URL } from "@/services/api";

interface SeoStats {
  totalPages: number;
  activePages: number;
  inactivePages: number;
  avgTitleLength: number;
  avgDescriptionLength: number;
}

export default function AdminSeoPage() {
  const [seoData, setSeoData] = useState<SeoMetadata[]>([]);
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [lastCheckSummary, setLastCheckSummary] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    seo: SeoMetadata | null;
    isNew: boolean;
  }>({ open: false, seo: null, isNew: false });

  const [formData, setFormData] = useState({
    pageType: "",
    path: "",
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

  useEffect(() => {
    fetchSeoData();
    fetchStats();
  }, []);

  const fetchSeoData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/seo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 SEO API response:", data);

        // Unwrap common shapes: ApiResponse { data: { data: [...] } } or plain array
        const payload = data?.data ?? data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const normalized = items.map((item: Record<string, unknown>) => {
          const getString = (key: string, fallback = "") => {
            const value = item[key];
            return typeof value === "string" ? value : fallback;
          };

          const getBoolean = (key: string, fallback = true) => {
            const value = item[key];
            return typeof value === "boolean" ? value : fallback;
          };

          const rawKeywords = item["keywords"];
          const keywordsArray = Array.isArray(rawKeywords)
            ? rawKeywords
            : typeof rawKeywords === "string"
            ? rawKeywords
                .replace(/[{}]/g, "")
                .split(/[;,]/)
                .map((k) => k.trim())
                .filter(Boolean)
            : [];

          return {
            id: item["id"] as number,
            pageType: getString("pageType") || getString("page_type"),
            path:
              getString("pageSlug") ||
              getString("page_slug") ||
              getString("path"),
            title: getString("title"),
            description: getString("description"),
            keywords: keywordsArray,
            ogTitle: getString("ogTitle") || getString("og_title"),
            ogDescription:
              getString("ogDescription") || getString("og_description"),
            ogImage: getString("ogImage") || getString("og_image"),
            twitterTitle: getString("twitterTitle") || getString("twitter_title"),
            twitterDescription:
              getString("twitterDescription") ||
              getString("twitter_description"),
            twitterImage: getString("twitterImage") || getString("twitter_image"),
            isActive:
              getBoolean("isActive", true) || getBoolean("is_active", true),
            createdAt: getString("createdAt") || getString("created_at"),
            updatedAt: getString("updatedAt") || getString("updated_at"),
          } as SeoMetadata;
        });

        console.log("🔍 Normalized SEO array:", normalized);
        setSeoData(normalized);
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/admin/seo/stats/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || null);
      }
    } catch (error) {
      console.error("Error fetching SEO stats:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        ...formData,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),
      };

      const url = editModal.isNew
        ? `${API_BASE_URL}/admin/seo`
        : `${API_BASE_URL}/admin/seo/${editModal.seo?.id}`;

      const method = editModal.isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEditModal({ open: false, seo: null, isNew: false });
        resetForm();
        fetchSeoData();
        fetchStats();
      }
    } catch (error) {
      console.error("Error saving SEO data:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SEO metadata?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/seo/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSeoData();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting SEO data:", error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/admin/seo/${id}/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchSeoData();
        fetchStats();
      }
    } catch (error) {
      console.error("Error toggling SEO status:", error);
    }
  };

  const setupDefaults = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/admin/seo/setup/defaults`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchSeoData();
        fetchStats();
      }
    } catch (error) {
      console.error("Error setting up defaults:", error);
    }
  };

  const openEditModal = (seo: SeoMetadata | null, isNew: boolean) => {
    if (seo) {
      setFormData({
        pageType: seo.pageType,
        path: seo.path,
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
          seo.pageType.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
      })
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="mb-6 space-y-4">
          <h1 className="text-2xl font-bold text-white mb-2">SEO Management</h1>
          <p className="text-gray-400">
            Monitor and tune metadata so search crawlers pick up the latest updates.
          </p>

          <CheckSeoHealth
            onComplete={(res) => {
              setLastCheckedAt(new Date().toLocaleString());
              setLastCheckSummary(
                `Checked ${res.total} entries · Missing titles: ${res.missingTitle}, descriptions: ${res.missingDescription}, duplicates: ${res.duplicates.length}`
              );
            }}
          />
          {lastCheckedAt && lastCheckSummary && (
            <p className="text-sm text-gray-500">
              Last checker run: {lastCheckedAt} — {lastCheckSummary}
            </p>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Total Pages</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalPages}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Active</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activePages}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Inactive</h3>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactivePages}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Avg Title Length</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgTitleLength}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">
                  Avg Description Length
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.avgDescriptionLength}
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <button
              onClick={() => openEditModal(null, true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add SEO Metadata
            </button>
            <button
              onClick={setupDefaults}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Setup Defaults
            </button>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2 flex-1 max-w-xs"
            />
          </div>
        </div>

        {/* SEO Data Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 border border-gray-700 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredSeoData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No SEO data found
                  </td>
                </tr>
              ) : (
                filteredSeoData.map((seo) => (
                  <tr key={seo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {seo.pageType}
                        </div>
                        <div className="text-sm text-gray-400">{seo.path}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white max-w-xs truncate">
                        {seo.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {seo.title.length} chars
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white max-w-xs truncate">
                        {seo.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        {seo.description.length} chars
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          seo.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {seo.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(seo, false)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(seo.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {seo.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(seo.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">
                {editModal.isNew ? "Add" : "Edit"} SEO Metadata
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white">
                      Page Type
                    </label>
                    <input
                      type="text"
                      value={formData.pageType}
                      onChange={(e) =>
                        setFormData({ ...formData, pageType: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2"
                      placeholder="e.g., movie, tv, home"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white">
                      Path
                    </label>
                    <input
                      type="text"
                      value={formData.path}
                      onChange={(e) =>
                        setFormData({ ...formData, path: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2"
                      placeholder="e.g., /movie/:id"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.title.length} characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2"
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.description.length} characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) =>
                      setFormData({ ...formData, keywords: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-700 rounded-md px-3 py-2"
                  />
                </div>

                {/* Open Graph */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-2">Open Graph</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="OG Title"
                      value={formData.ogTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, ogTitle: e.target.value })
                      }
                      className="block w-full border border-gray-700 rounded-md px-3 py-2"
                    />
                    <textarea
                      placeholder="OG Description"
                      value={formData.ogDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ogDescription: e.target.value,
                        })
                      }
                      className="block w-full border border-gray-700 rounded-md px-3 py-2"
                      rows={2}
                    />
                    <input
                      type="text"
                      placeholder="OG Image URL"
                      value={formData.ogImage}
                      onChange={(e) =>
                        setFormData({ ...formData, ogImage: e.target.value })
                      }
                      className="block w-full border border-gray-700 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-2">Twitter</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Twitter Title"
                      value={formData.twitterTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twitterTitle: e.target.value,
                        })
                      }
                      className="block w-full border border-gray-700 rounded-md px-3 py-2"
                    />
                    <textarea
                      placeholder="Twitter Description"
                      value={formData.twitterDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twitterDescription: e.target.value,
                        })
                      }
                      className="block w-full border border-gray-700 rounded-md px-3 py-2"
                      rows={2}
                    />
                    <input
                      type="text"
                      placeholder="Twitter Image URL"
                      value={formData.twitterImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twitterImage: e.target.value,
                        })
                      }
                      className="block w-full border border-gray-700 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-white"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setEditModal({ open: false, seo: null, isNew: false })
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  {editModal.isNew ? "Create" : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
