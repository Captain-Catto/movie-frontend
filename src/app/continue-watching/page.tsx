import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ContinueWatchingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">
            ⏱️ Xem tiếp
          </h1>

          <div className="bg-gray-800/50 rounded-xl p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              No viewing history
            </h2>
            <p className="text-gray-400 mb-6">
              Bắt đầu xem phim để theo dõi tiến trình của bạn
            </p>
            <a
              href="/browse"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Tìm phim hay
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
