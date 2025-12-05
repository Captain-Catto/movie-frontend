"use client";

import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";

export default function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-6 animate-pulse">
            <div className="flex items-start space-x-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-700 rounded w-1/4" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-700/50 rounded-lg p-4 space-y-2"
                    >
                      <div className="h-3 bg-gray-600 rounded w-1/2" />
                      <div className="h-4 bg-gray-600 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
