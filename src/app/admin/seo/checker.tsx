"use client";

import { useEffect, useState } from "react";
import { SeoMetadata } from "@/types/seo";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface CheckerResult {
  total: number;
  active: number;
  missingTitle: number;
  missingDescription: number;
  longTitle: number;
  longDescription: number;
  keywordsMissing: number;
  ogMissing: number;
  twitterMissing: number;
  duplicates: Array<{ title: string; paths: string[] }>;
}

const CheckSeoHealth: React.FC<{ onComplete?: (result: CheckerResult) => void }> = ({
  onComplete,
}) => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckerResult | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!checking) return;
    if (!token) {
      setChecking(false);
      return;
    }

    fetch(`${API_BASE_URL}/admin/seo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const entries: SeoMetadata[] = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const check: CheckerResult = {
          total: entries.length,
          active: entries.filter((entry) => entry.isActive).length,
          missingTitle: entries.filter((entry) => !entry.title?.trim()).length,
          missingDescription: entries.filter((entry) => !entry.description?.trim()).length,
          longTitle: entries.filter((entry) => entry.title?.length > 60).length,
          longDescription: entries.filter((entry) => entry.description?.length > 160).length,
          keywordsMissing: entries.filter((entry) => !entry.keywords || entry.keywords.length === 0)
            .length,
          ogMissing: entries.filter(
            (entry) => !entry.ogTitle || !entry.ogDescription || !entry.ogImage
          ).length,
          twitterMissing: entries.filter(
            (entry) =>
              !entry.twitterTitle || !entry.twitterDescription || !entry.twitterImage
          ).length,
          duplicates: [],
        };

        const titleMap = new Map<string, string[]>();
        entries.forEach((entry) => {
          if (!entry.title) return;
          const key = entry.title.trim().toLowerCase();
          if (!titleMap.has(key)) {
            titleMap.set(key, []);
          }
          titleMap.get(key)?.push(entry.path);
        });

        check.duplicates = Array.from(titleMap.entries())
          .filter(([, paths]) => paths.length > 1)
          .map(([title, paths]) => ({ title, paths }));

        setResult(check);
        onComplete?.(check);
      })
      .finally(() => setChecking(false));
  }, [checking, onComplete, token]);

  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">SEO Health Check</h3>
          <p className="text-sm text-gray-400">
            Run quick diagnostics to validate metadata quality.
          </p>
        </div>
        <button
          onClick={() => setChecking(true)}
          disabled={checking}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {checking ? "Checking…" : "Run Checker"}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-200">
          <div>
            <p>Total entries: <span className="font-semibold">{result.total}</span></p>
            <p>Active pages: <span className="font-semibold">{result.active}</span></p>
            <p>Missing titles: <span className="font-semibold text-yellow-400">{result.missingTitle}</span></p>
            <p>Missing descriptions: <span className="font-semibold text-yellow-400">{result.missingDescription}</span></p>
          </div>
          <div>
            <p>Long titles (&gt; 60): <span className="font-semibold">{result.longTitle}</span></p>
            <p>Long descriptions (&gt; 160): <span className="font-semibold">{result.longDescription}</span></p>
            <p>Missing keywords: <span className="font-semibold">{result.keywordsMissing}</span></p>
          </div>
          <div>
            <p>OG incomplete: <span className="font-semibold">{result.ogMissing}</span></p>
            <p>Twitter incomplete: <span className="font-semibold">{result.twitterMissing}</span></p>
            <p>
              Duplicate titles:
              <span className="font-semibold">
                {" "}
                {result.duplicates.length}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckSeoHealth;
