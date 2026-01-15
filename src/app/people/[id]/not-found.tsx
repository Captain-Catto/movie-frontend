import Link from "next/link";
import Layout from "@/components/layout/Layout";

export default function ActorNotFound() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-white mb-4">Actor Not Found</h2>
            <p className="text-gray-400 text-lg mb-8">
              We couldn&apos;t find the actor you&apos;re looking for. They might have been removed or the ID is incorrect.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/people"
              className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Back to Actors
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
    </Layout>
  );
}
