import Link from "next/link";
import Layout from "@/components/layout/Layout";
import TrendingSuggestions from "@/components/movie/TrendingSuggestions";
import { getServerPreferredLanguage } from "@/lib/server-language";

export default async function MovieNotFound() {
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-white mb-4">
              {isVietnamese ? "Không tìm thấy phim" : "Movie Not Found"}
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {isVietnamese
                ? "Không tìm thấy phim bạn đang tìm. Có thể phim đã bị gỡ hoặc đường dẫn không chính xác."
                : "We couldn&apos;t find the movie you&apos;re looking for. It might have been removed or the URL is incorrect."}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/browse?type=movie"
              className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isVietnamese ? "← Quay lại phim lẻ" : "← Back to Movies"}
            </Link>
            <Link
              href="/"
              className="inline-block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isVietnamese ? "Về trang chủ" : "Go Home"}
            </Link>
          </div>
        </div>
      </div>
      <TrendingSuggestions
        type="movie"
        title={
          isVietnamese
            ? "Phim phổ biến có thể bạn thích"
            : "Popular Movies You Might Like"
        }
      />
    </Layout>
  );
}
