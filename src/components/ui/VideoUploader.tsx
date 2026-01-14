"use client";

import { useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, Cloud } from "lucide-react";

interface UploadResult {
  success: boolean;
  message: string;
  url: string;
  key: string;
  filename: string;
}

export default function VideoUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError("Only video files accepted (mp4, avi, mov, etc.)");
        return;
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setError("File too large. Maximum 500MB.");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      const response = await fetch("http://localhost:8080/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result: UploadResult = await response.json();
      setUploadResult(result);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "video-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Cloud className="w-6 h-6" />
        Upload Video to AWS S3
      </h2>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-6">
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <label htmlFor="video-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">
            Click to select video or drag and drop here
          </p>
          <p className="text-sm text-gray-500">
            Supported: MP4, AVI, MOV, etc. (Max 500MB)
          </p>
        </label>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-white cursor-pointer"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploadResult && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4" />
              Upload to S3
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {uploadResult && (
        <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-300 font-medium">{uploadResult.message}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">File: </span>
              <span className="text-white">{uploadResult.filename}</span>
            </div>
            <div>
              <span className="text-gray-400">S3 Key: </span>
              <span className="text-white font-mono text-xs">
                {uploadResult.key}
              </span>
            </div>
            <div>
              <span className="text-gray-400">URL: </span>
              <a
                href={uploadResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                {uploadResult.url}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
