"use client";

import { useCallback, useState } from "react";

interface UploadedMovie {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  fileSize: number;
  originalName: string;
  uploadDate: string;
}

interface MovieUploadFormData {
  title: string;
  description: string;
  year: number;
  genre: string;
  duration: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

const defaultMovieData = (): MovieUploadFormData => ({
  title: "",
  description: "",
  year: new Date().getFullYear(),
  genre: "Demo",
  duration: "",
});

export interface UseMovieUploaderResult {
  selectedFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  uploadedMovie: UploadedMovie | null;
  error: string | null;
  movieData: MovieUploadFormData;
  setMovieData: React.Dispatch<React.SetStateAction<MovieUploadFormData>>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  resetUpload: () => void;
  formatFileSize: (bytes: number) => string;
}

export function useMovieUploader(): UseMovieUploaderResult {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMovie, setUploadedMovie] = useState<UploadedMovie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [movieData, setMovieData] = useState<MovieUploadFormData>(defaultMovieData);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("video/")) {
        setError("Only video files accepted (mp4, avi, mov, etc.)");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("File too large. Maximum 500MB for demo.");
        return;
      }

      setSelectedFile(file);
      setError(null);

      if (!movieData.title) {
        const titleFromFile = file.name.replace(/\.[^/.]+$/, "");
        setMovieData((prev) => ({ ...prev, title: titleFromFile }));
      }
    },
    [movieData.title]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select a video file");
      return;
    }

    if (!movieData.title.trim()) {
      setError("Please enter movie title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      const formData = new FormData();
      formData.append("movie", selectedFile);
      formData.append("title", movieData.title);
      formData.append("description", movieData.description);
      formData.append("year", movieData.year.toString());
      formData.append("genre", movieData.genre);
      formData.append("duration", movieData.duration);

      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/api/movie-upload/upload`, {
        method: "POST",
        body: formData,
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setUploadProgress(100);
      const result = await response.json();

      if (result.success) {
        setUploadedMovie(result.data as UploadedMovie);
        setSelectedFile(null);
        setMovieData(defaultMovieData());
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Upload failed: ${message}`);
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [selectedFile, movieData]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  const resetUpload = useCallback(() => {
    setUploadedMovie(null);
    setSelectedFile(null);
    setError(null);
  }, []);

  return {
    selectedFile,
    uploading,
    uploadProgress,
    uploadedMovie,
    error,
    movieData,
    setMovieData,
    handleFileSelect,
    handleUpload,
    resetUpload,
    formatFileSize,
  };
}
