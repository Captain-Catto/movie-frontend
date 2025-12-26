import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";

export default function ContinueWatchingPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Container size="narrow" withHeaderOffset className="py-12">
          <h1 className="text-4xl font-bold text-white mb-6">
            ⏱️ Continue Watching
          </h1>

          <div className="bg-gray-800/50 rounded-xl p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              No viewing history
            </h2>
            <p className="text-gray-400 mb-6">
              Start watching movies to track your progress
            </p>
            <a
              href="/browse"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Browse Movies
            </a>
          </div>
        </Container>
      </div>
    </Layout>
  );
}
