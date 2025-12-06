"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Film, Cloud } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

interface UploadedMovie {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  fileSize: number;
  originalName: string;
  uploadDate: string;
}

export default function MovieUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMovie, setUploadedMovie] = useState<UploadedMovie | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [movieData, setMovieData] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    genre: "Demo",
    duration: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError("Chỉ chấp nhận file video (mp4, avi, mov, etc.)");
        return;
      }

      // Validate file size (max 500MB for demo)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setError("File quá lớn. Giới hạn 500MB cho demo.");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Auto-fill title from filename
      if (!movieData.title) {
        const titleFromFile = file.name.replace(/\.[^/.]+$/, "");
        setMovieData((prev) => ({ ...prev, title: titleFromFile }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn file video");
      return;
    }

    if (!movieData.title.trim()) {
      setError("Vui lòng nhập tên phim");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("movie", selectedFile);
      formData.append("title", movieData.title);
      formData.append("description", movieData.description);
      formData.append("year", movieData.year.toString());
      formData.append("genre", movieData.genre);
      formData.append("duration", movieData.duration);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch(
        "http://localhost:8080/api/movie-upload/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadedMovie(result.data);
        setSelectedFile(null);
        setMovieData({
          title: "",
          description: "",
          year: new Date().getFullYear(),
          genre: "Demo",
          duration: "",
        });
      } else {
        setError(result.message || "Upload failed");
        if (result.data?.instructions) {
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Upload failed: ${message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetUpload = () => {
    setUploadedMovie(null);
    setSelectedFile(null);
    setError(null);
  };

  if (uploadedMovie) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="text-green-400 font-semibold">
                Upload thành công!
              </h3>
              <p className="text-green-300 text-sm">
                Movie uploaded to AWS S3 and ready to stream
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Film className="mr-2" size={24} />
              {uploadedMovie.title}
            </h2>
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Upload phim khác
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-300">
            <div>
              <strong>File gốc:</strong> {uploadedMovie.originalName}
            </div>
            <div>
              <strong>Kích thước:</strong>{" "}
              {formatFileSize(uploadedMovie.fileSize)}
            </div>
            <div>
              <strong>Upload lúc:</strong>{" "}
              {new Date(uploadedMovie.uploadDate).toLocaleString("vi-VN")}
            </div>
            <div className="flex items-center">
              <Cloud className="mr-1 text-blue-400" size={16} />
              <strong>Lưu trữ:</strong> AWS S3
            </div>
          </div>

          {uploadedMovie.description && (
            <p className="text-gray-300 mb-6">{uploadedMovie.description}</p>
          )}
        </div>

        <div className="bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            src={uploadedMovie.streamUrl}
            title={uploadedMovie.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Upload className="mr-2" size={24} />
          Upload Demo Movie to S3
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Chọn file video
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <label
              htmlFor="video-upload"
              className={`cursor-pointer ${uploading ? "opacity-50" : ""}`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <Film className="mx-auto text-green-500" size={48} />
                  <p className="text-green-400 font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={48} />
                  <p className="text-gray-400">
                    Click để chọn file video hoặc kéo thả vào đây
                  </p>
                  <p className="text-gray-500 text-sm">
                    Hỗ trợ: MP4, AVI, MOV, WMV (Tối đa 500MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Movie Info */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Tên phim *
            </label>
            <input
              type="text"
              value={movieData.title}
              onChange={(e) =>
                setMovieData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tên phim"
              disabled={uploading}
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Mô tả</label>
            <textarea
              value={movieData.description}
              onChange={(e) =>
                setMovieData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Mô tả về phim (tùy chọn)"
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Năm</label>
              <input
                type="number"
                value={movieData.year}
                onChange={(e) =>
                  setMovieData((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value) || new Date().getFullYear(),
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={uploading}
                min="1900"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Thể loại
              </label>
              <select
                value={movieData.genre}
                onChange={(e) =>
                  setMovieData((prev) => ({ ...prev, genre: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={uploading}
              >
                <option value="Demo">Demo</option>
                <option value="Action">Hành động</option>
                <option value="Drama">Chính kịch</option>
                <option value="Comedy">Hài kịch</option>
                <option value="Horror">Kinh dị</option>
                <option value="Documentary">Tài liệu</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Thời lượng
              </label>
              <input
                type="text"
                value={movieData.duration}
                onChange={(e) =>
                  setMovieData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="VD: 120 min"
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Uploading to S3...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || !movieData.title.trim()}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            !selectedFile || uploading || !movieData.title.trim()
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading to S3...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Cloud size={20} />
              <span>Upload lên S3</span>
            </div>
          )}
        </button>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-400">
          <p className="font-medium mb-2">📝 Lưu ý:</p>
          <ul className="space-y-1 text-xs">
            <li>• File sẽ được upload lên AWS S3 bucket</li>
            <li>• Cần cấu hình AWS credentials trong backend</li>
            <li>• File video sẽ có thể stream trực tiếp từ S3</li>
            <li>• Giới hạn 500MB cho demo (có thể tăng)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
