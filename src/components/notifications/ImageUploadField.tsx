"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import { ImageIcon, X, Loader2, Link2 } from "lucide-react";
import { authStorage } from "@/lib/auth-storage";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

export default function ImageUploadField({ value, onChange }: Props) {
  const fileInputId = "notification-image-upload";
  const urlInputId = "notification-image-url";
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(value || "");
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(value);

  if (value !== prevValueRef.current) {
    prevValueRef.current = value;
    if (!value) {
      setPreview("");
      setUrlInput("");
    }
  }

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPT.includes(file.type)) {
        setError("Only JPEG, PNG, GIF, WebP, AVIF allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File too large — max 5 MB.");
        return;
      }

      // Immediate local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setError(null);
      setUploading(true);

      try {
        const fd = new FormData();
        fd.append("image", file);

        const token = authStorage.getToken();
        const res = await fetch("/api/upload/image", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");

        const remoteUrl: string = json.url || json.data?.url || "";
        if (!remoteUrl) throw new Error("No URL returned from server");

        onChange(remoteUrl);
        setPreview(remoteUrl);
        setUrlInput(remoteUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview("");
        onChange("");
      } finally {
        setUploading(false);
        URL.revokeObjectURL(localUrl);
      }
    },
    [onChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    setPreview("");
    setUrlInput("");
    onChange("");
    setError(null);
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    onChange(trimmed);
    setPreview(trimmed);
    setShowUrlInput(false);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={showUrlInput ? urlInputId : fileInputId} className="text-sm font-medium text-gray-300">
          Image <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        {!preview && (
          <button
            type="button"
            onClick={() => setShowUrlInput((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <Link2 size={12} />
            Paste URL instead
          </button>
        )}
      </div>

      {/* Preview */}
      {preview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
          <Image
            src={preview}
            alt="preview"
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            onError={() => {
              setError("Could not load image from URL");
              setPreview("");
              onChange("");
            }}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-7 text-white animate-spin" />
              <span className="text-xs text-gray-300">Uploading…</span>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute top-2 right-2 size-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Drop zone */}
          <button
            type="button"
            aria-label="Select notification image"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !showUrlInput && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (showUrlInput) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-900/20 cursor-copy"
                : showUrlInput
                ? "border-gray-700 bg-gray-800/30 cursor-default"
                : "border-gray-600 hover:border-gray-500 bg-gray-800/30 cursor-pointer"
            }`}
          >
            <ImageIcon className="size-8 text-gray-500" />
            <p className="text-sm text-gray-300 text-center">
              {isDragging ? "Drop image here" : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-gray-600">JPEG · PNG · GIF · WebP (max 5 MB)</p>
          </button>

          {/* URL input (inline, below drop zone) */}
          {showUrlInput && (
            <div className="flex gap-2">
              <input
                id={urlInputId}
                type="text"
                aria-label="Notification image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlApply(); } }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                disabled={!urlInput.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        id={fileInputId}
        ref={inputRef}
        type="file"
        aria-label="Upload notification image"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
