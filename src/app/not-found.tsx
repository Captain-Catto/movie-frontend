import Link from "next/link";
import TrendingSuggestions from "@/components/movie/TrendingSuggestions";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getNotFoundUiMessages } from "@/lib/ui-messages";

export default async function NotFound() {
  const language = await getServerPreferredLanguage();
  const labels = getNotFoundUiMessages(language);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-500 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">
            {labels.title}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {labels.description}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {labels.goHome}
          </Link>
          <Link
            href="/browse"
            className="inline-block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {labels.browseMovies}
          </Link>
        </div>
      </div>
      <div className="w-full">
        <TrendingSuggestions
          type="all"
          title={labels.trendingNow}
        />
      </div>
    </div>
  );
}
