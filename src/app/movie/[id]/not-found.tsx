import Link from "next/link";
import Layout from "@/components/layout/Layout";
import TrendingSuggestions from "@/components/movie/TrendingSuggestions";

export default function MovieNotFound() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-white mb-4">Movie Not Found</h2>
            <p className="text-gray-400 text-lg mb-8">
              We couldn't find the movie you're looking for. It might have been removed or the URL is incorrect.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/browse?type=movie"
              className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Back to Movies
            </Link>
            <Link
              href="/"
              className="inline-block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
      <TrendingSuggestions type="movie" title="Popular Movies You Might Like" />
    </Layout>
  );
}
