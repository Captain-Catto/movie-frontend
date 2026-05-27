"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Trash2, Shield, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

interface BannedWord {
  id: number;
  word: string;
  severity: "low" | "medium" | "high";
  action: "filter" | "block" | "flag";
  createdBy?: number;
  createdAt: string;
}

export default function AdminBannedWordsPage() {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const { isViewer } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const adminApi = useAdminApi();

  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [newWord, setNewWord] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [action, setAction] = useState<"filter" | "block" | "flag">("filter");
  const [submitting, setSubmitting] = useState(false);

  const fetchBannedWords = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.get<BannedWord[]>("/admin/comments/banned-words");
      if (res.success && res.data) {
        setBannedWords(res.data);
      } else {
        setErrorMessage(res.error || "Failed to load banned words");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [adminApi]);

  useEffect(() => {
    fetchBannedWords();
  }, [fetchBannedWords]);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isViewer) {
      showWarning(
        language.startsWith("vi") ? "Không có quyền" : "Unauthorized",
        language.startsWith("vi") ? "Tài khoản Viewer chỉ có quyền xem" : "Viewer role is read-only"
      );
      return;
    }

    const trimmedWord = newWord.trim().toLowerCase();
    if (!trimmedWord) {
      showWarning(
        language.startsWith("vi") ? "Lỗi nhập liệu" : "Input Error",
        language.startsWith("vi") ? "Vui lòng nhập từ cấm" : "Please enter a banned word"
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.post<BannedWord>("/admin/comments/banned-words", {
        word: trimmedWord,
        severity,
        action,
      });

      if (res.success) {
        showSuccess(
          language.startsWith("vi") ? "Thêm thành công" : "Success",
          language.startsWith("vi") ? `Đã thêm từ cấm "${trimmedWord}"` : `Added banned word "${trimmedWord}"`
        );
        setNewWord("");
        setSeverity("medium");
        setAction("filter");
        fetchBannedWords();
      } else {
        showError(
          language.startsWith("vi") ? "Thêm thất bại" : "Error",
          res.error || (language.startsWith("vi") ? "Không thể thêm từ cấm" : "Failed to add banned word")
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      showError(
        language.startsWith("vi") ? "Lỗi" : "Error",
        msg
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWord = async (id: number, word: string) => {
    if (isViewer) {
      showWarning(
        language.startsWith("vi") ? "Không có quyền" : "Unauthorized",
        language.startsWith("vi") ? "Tài khoản Viewer chỉ có quyền xem" : "Viewer role is read-only"
      );
      return;
    }

    try {
      const res = await adminApi.delete(`/admin/comments/banned-words/${id}`);
      if (res.success) {
        showSuccess(
          language.startsWith("vi") ? "Xóa thành công" : "Success",
          language.startsWith("vi") ? `Đã xóa từ cấm "${word}"` : `Deleted banned word "${word}"`
        );
        fetchBannedWords();
      } else {
        showError(
          language.startsWith("vi") ? "Xóa thất bại" : "Error",
          res.error || (language.startsWith("vi") ? "Không thể xóa từ cấm" : "Failed to delete banned word")
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      showError(
        language.startsWith("vi") ? "Lỗi" : "Error",
        msg
      );
    }
  };

  // Helper styles for Severity Badges
  const getSeverityBadge = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "bg-red-500/10 border border-red-500/30 text-red-400";
      case "medium":
        return "bg-amber-500/10 border border-amber-500/30 text-amber-400";
      case "low":
      default:
        return "bg-green-500/10 border border-green-500/30 text-green-400";
    }
  };

  // Helper styles for Action Badges
  const getActionBadge = (act: "filter" | "block" | "flag") => {
    switch (act) {
      case "block":
        return "bg-rose-500/10 border border-rose-500/30 text-rose-400";
      case "flag":
        return "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400";
      case "filter":
      default:
        return "bg-sky-500/10 border border-sky-500/30 text-sky-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">{labels.bannedWordsHeaderTitle}</h1>
        <p className="text-gray-400">{labels.bannedWordsHeaderDesc}</p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-500 bg-red-900/50 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md space-y-4 lg:col-span-1">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Shield className="size-5 text-red-500" />
            {language.startsWith("vi") ? "Thêm từ cấm mới" : "Add New Banned Word"}
          </h2>

          <form onSubmit={handleAddWord} className="space-y-4">
            <div>
              <label htmlFor="banned-word-input" className="block text-sm font-medium text-gray-300 mb-1">
                {labels.tableHeaderWord}
              </label>
              <input
                id="banned-word-input"
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={language.startsWith("vi") ? "Ví dụ: spamword" : "e.g., spamword"}
                className="w-full border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="banned-word-severity" className="block text-sm font-medium text-gray-300 mb-1">
                {labels.tableHeaderSeverity}
              </label>
              <select
                id="banned-word-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high")}
                className="w-full border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={submitting}
              >
                <option value="low">{labels.severityLow}</option>
                <option value="medium">{labels.severityMedium}</option>
                <option value="high">{labels.severityHigh}</option>
              </select>
            </div>

            <div>
              <label htmlFor="banned-word-action" className="block text-sm font-medium text-gray-300 mb-1">
                {labels.tableHeaderAction}
              </label>
              <select
                id="banned-word-action"
                value={action}
                onChange={(e) => setAction(e.target.value as "filter" | "block" | "flag")}
                className="w-full border border-gray-700 bg-gray-900 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={submitting}
              >
                <option value="filter">{labels.actionFilter}</option>
                <option value="block">{labels.actionBlock}</option>
                <option value="flag">{labels.actionFlag}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {language.startsWith("vi") ? "Đang lưu..." : "Saving..."}
                </>
              ) : (
                labels.addWordButton
              )}
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <ShieldCheck className="size-5 text-green-500" />
              {labels.bannedWords}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {labels.tableHeaderWord}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {labels.tableHeaderSeverity}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {labels.tableHeaderAction}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {language.startsWith("vi") ? "Người tạo (ID)" : "Created By (ID)"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {language.startsWith("vi") ? "Ngày tạo" : "Created At"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {language.startsWith("vi") ? "Thao tác" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-red-500" />
                        <span>{language.startsWith("vi") ? "Đang tải dữ liệu..." : "Loading..."}</span>
                      </div>
                    </td>
                  </tr>
                ) : bannedWords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="size-8 text-gray-500" />
                        <span>{language.startsWith("vi") ? "Không tìm thấy từ cấm nào" : "No banned words found"}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bannedWords.map((word) => (
                    <tr key={word.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {word.word}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(word.severity)}`}>
                          {word.severity === "high" && labels.severityHigh}
                          {word.severity === "medium" && labels.severityMedium}
                          {word.severity === "low" && labels.severityLow}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadge(word.action)}`}>
                          {word.action === "filter" && labels.actionFilter}
                          {word.action === "block" && labels.actionBlock}
                          {word.action === "flag" && labels.actionFlag}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {word.createdBy ? `#${word.createdBy}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400" suppressHydrationWarning>
                        {new Date(word.createdAt).toLocaleDateString(language.startsWith("vi") ? "vi-VN" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleDeleteWord(word.id, word.word)}
                          className="text-red-500 hover:text-red-400 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title={language.startsWith("vi") ? "Xóa từ cấm" : "Delete Banned Word"}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
