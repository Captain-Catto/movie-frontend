"use client";

import { useCallback, useRef, useState } from "react";

interface UploadResult {
  success: boolean;
  message: string;
  url: string;
  key: string;
  filename: string;
}

const MAX_SIZE = 500 * 1024 * 1024; // 500MB
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface UseVideoUploaderResult {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  uploading: boolean;
  uploadResult: UploadResult | null;
  error: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  removeSelectedFile: () => void;
  formatFileSize: (bytes: number) => string;
}

export function useVideoUploader(): UseVideoUploaderResult {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Only video files accepted (mp4, avi, mov, etc.)");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File too large. Maximum 500MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/upload/video`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result: UploadResult = await response.json();
      setUploadResult(result);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [selectedFile]);

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  return {
    fileInputRef,
    selectedFile,
    uploading,
    uploadResult,
    error,
    handleFileSelect,
    handleUpload,
    removeSelectedFile,
    formatFileSize,
  };
}
