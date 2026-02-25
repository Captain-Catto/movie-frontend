"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isVietnamese, setIsVietnamese] = useState(false);

  useEffect(() => {
    const cookie = document.cookie;
    setIsVietnamese(
      cookie.includes("preferred-language=vi-VN") ||
        cookie.includes("preferred-language=vi")
    );
  }, []);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {isVietnamese ? "Lỗi nghiêm trọng" : "Critical Error"}
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                {isVietnamese
                  ? "Đã xảy ra lỗi nghiêm trọng. Vui lòng tải lại trang."
                  : "A critical error occurred. Please refresh the page."}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isVietnamese ? "Tải lại trang" : "Refresh Page"}
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
