"use client";

import { useState } from "react";
import { getGlobalErrorUiMessages } from "@/lib/ui-messages";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [language] = useState<"vi" | "en">(() => {
    if (typeof window === "undefined") return "en";
    const cookie = document.cookie;
    return cookie.includes("preferred-language=vi-VN") || cookie.includes("preferred-language=vi")
      ? "vi"
      : "en";
  });
  const labels = getGlobalErrorUiMessages(language);

  return (
    <html lang={language === "vi" ? "vi" : "en"}>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-semibold text-white mb-4">
                {labels.title}
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                {labels.description}
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {labels.refreshPage}
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
