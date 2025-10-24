"use client";

import { useState } from "react";
import Image from "next/image";
import Layout from "@/components/layout/Layout";
import VideoPlayer from "@/components/ui/VideoPlayer";
import MovieUploader from "@/components/ui/MovieUploader";
import VideoUploader from "@/components/ui/VideoUploader";
import { Upload, Play, Database } from "lucide-react";

const demoMovies = [
  {
    id: "demo-1",
    title: "Big Buck Bunny",
    description: "Phim hoạt hình ngắn mã nguồn mở từ Blender Foundation",
    poster:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    subtitles: [],
  },
  {
    id: "demo-2",
    title: "Elephant Dream",
    description:
      "Phim hoạt hình ngắn đầu tiên được làm hoàn toàn bằng phần mềm mã nguồn mở",
    poster:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Elephants_Dream_s5_proog.jpg/800px-Elephants_Dream_s5_proog.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    subtitles: [],
  },
  {
    id: "demo-3",
    title: "Sintel",
    description: "Phim hoạt hình ngắn về cuộc phiêu lưu của cô gái trẻ Sintel",
    poster:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Sintel_poster.jpg/800px-Sintel_poster.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    subtitles: [],
  },
];

export default function DemoPage() {
  const [selectedMovie, setSelectedMovie] = useState<
    (typeof demoMovies)[0] | null
  >(null);
  const [watchTime, setWatchTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"demo" | "upload" | "uploaded">(
    "uploaded"
  );

  const handleMovieSelect = (movie: (typeof demoMovies)[0]) => {
    setSelectedMovie(movie);
    setWatchTime(0);
  };

  const handleTimeUpdate = (currentTime: number) => {
    setWatchTime(currentTime);
  };

  const handleMovieEnd = () => {
    console.log(
      `Phim "${selectedMovie?.title}" đã xem xong, thời gian xem: ${Math.floor(
        watchTime / 60
      )} phút`
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            🎬 Demo Phát Phim
          </h1>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab("uploaded")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeTab === "uploaded"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Database size={16} />
              <span>Phim đã Upload</span>
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeTab === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Upload size={16} />
              <span>Upload lên S3</span>
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeTab === "demo"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Play size={16} />
              <span>Video Demo</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === "uploaded" ? (
            <VideoUploader />
          ) : activeTab === "upload" ? (
            <MovieUploader />
          ) : !selectedMovie ? (
            <div>
              <p className="text-gray-300 mb-6">
                Chọn một phim demo để test khả năng phát video:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleMovieSelect(movie)}
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {movie.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {movie.description}
                      </p>
                      <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                        Xem Ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  📝 Hướng Dẫn Upload Phim Riêng
                </h2>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Cách 1: Upload File Local
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Đặt file video vào thư mục{" "}
                        <code className="bg-gray-700 px-2 py-1 rounded">
                          public/videos/
                        </code>
                      </li>
                      <li>
                        Cập nhật URL trong component:{" "}
                        <code className="bg-gray-700 px-2 py-1 rounded">
                          &quot;/videos/your-movie.mp4&quot;
                        </code>
                      </li>
                      <li>Refresh trang để xem phim</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Cách 2: Streaming URL
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Upload phim lên cloud (Google Drive, OneDrive, v.v.)
                      </li>
                      <li>Lấy direct link streaming</li>
                      <li>
                        Thay thế URL trong{" "}
                        <code className="bg-gray-700 px-2 py-1 rounded">
                          videoUrl
                        </code>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Cách 3: HLS Streaming (Pro)
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Convert video thành HLS format (.m3u8)</li>
                      <li>Setup CDN hoặc streaming server</li>
                      <li>Sử dụng HLS player như Video.js hoặc HLS.js</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedMovie.title}
                  </h2>
                  <p className="text-gray-300 mt-1">
                    {selectedMovie.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  ← Quay Lại
                </button>
              </div>

              <div className="bg-black rounded-lg overflow-hidden">
                <VideoPlayer
                  src={selectedMovie.videoUrl}
                  title={selectedMovie.title}
                  poster={selectedMovie.poster}
                  subtitles={selectedMovie.subtitles}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleMovieEnd}
                />
              </div>

              <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  📊 Thống Kê Xem Phim
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-500">
                      {Math.floor(watchTime / 60)}:
                      {(Math.floor(watchTime) % 60).toString().padStart(2, "0")}
                    </p>
                    <p className="text-gray-400 text-sm">Thời Gian Xem</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">
                      {selectedMovie.title.length > 10 ? "HD" : "FHD"}
                    </p>
                    <p className="text-gray-400 text-sm">Chất Lượng</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">MP4</p>
                    <p className="text-gray-400 text-sm">Định Dạng</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">✓</p>
                    <p className="text-gray-400 text-sm">Trạng Thái</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
