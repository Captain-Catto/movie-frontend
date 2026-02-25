"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  useEffect(() => {
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {isVietnamese ? "Đã xảy ra lỗi" : "Something Went Wrong"}
          </h2>
          <p className="text-gray-400 text-lg mb-4">
            {isVietnamese
              ? "Đã có lỗi không mong muốn. Vui lòng thử lại."
              : "We encountered an unexpected error. Please try again."}
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-gray-500 text-xs mt-2">
                  {isVietnamese ? "Mã lỗi:" : "Error ID:"} {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isVietnamese ? "Thử lại" : "Try Again"}
          </button>
          <Link
            href="/"
            className="inline-block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isVietnamese ? "Về trang chủ" : "Go Back Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
