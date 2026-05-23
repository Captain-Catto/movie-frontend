import Image from "next/image";
import { useRef, useReducer, useCallback } from "react";
import { ImageIcon, X, Loader2, Link2 } from "lucide-react";
import { authStorage } from "@/lib/auth-storage";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

interface UploadState {
  uploading: boolean;
  error: string | null;
  preview: string;
  isDragging: boolean;
  showUrlInput: boolean;
  urlInput: string;
}

type UploadAction =
  | { type: "START_UPLOAD"; payload: { localUrl: string } }
  | { type: "UPLOAD_SUCCESS"; payload: { remoteUrl: string } }
  | { type: "UPLOAD_FAILURE"; payload: { error: string } }
  | { type: "REMOVE_IMAGE" }
  | { type: "SET_IS_DRAGGING"; payload: boolean }
  | { type: "TOGGLE_URL_INPUT" }
  | { type: "SET_URL_INPUT"; payload: string }
  | { type: "APPLY_URL"; payload: { url: string } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PREVIEW"; payload: string }
  | { type: "IMAGE_LOAD_ERROR"; payload: { error: string } }
  | { type: "SYNC_VALUE"; payload: { value: string } };

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "START_UPLOAD":
      return {
        ...state,
        preview: action.payload.localUrl,
        error: null,
        uploading: true,
      };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        uploading: false,
        preview: action.payload.remoteUrl,
        urlInput: action.payload.remoteUrl,
      };
    case "UPLOAD_FAILURE":
      return {
        ...state,
        uploading: false,
        preview: "",
        error: action.payload.error,
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        preview: "",
        urlInput: "",
        error: null,
      };
    case "SET_IS_DRAGGING":
      return { ...state, isDragging: action.payload };
    case "TOGGLE_URL_INPUT":
      return { ...state, showUrlInput: !state.showUrlInput };
    case "SET_URL_INPUT":
      return { ...state, urlInput: action.payload };
    case "APPLY_URL":
      return {
        ...state,
        preview: action.payload.url,
        showUrlInput: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_PREVIEW":
      return { ...state, preview: action.payload };
    case "IMAGE_LOAD_ERROR":
      return {
        ...state,
        preview: "",
        error: action.payload.error,
      };
    case "SYNC_VALUE":
      return {
        ...state,
        preview: action.payload.value,
        urlInput: action.payload.value,
      };
    default:
      return state;
  }
}

export default function ImageUploadField({ value, onChange }: Props) {
  const fileInputId = "notification-image-upload";
  const urlInputId = "notification-image-url";

  const [state, dispatch] = useReducer(uploadReducer, {
    uploading: false,
    error: null,
    preview: value || "",
    isDragging: false,
    showUrlInput: false,
    urlInput: value || "",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(value);

  if (value !== prevValueRef.current) {
    prevValueRef.current = value;
    dispatch({ type: "SYNC_VALUE", payload: { value: value || "" } });
  }

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPT.includes(file.type)) {
        dispatch({ type: "SET_ERROR", payload: "Only JPEG, PNG, GIF, WebP, AVIF allowed." });
        return;
      }
      if (file.size > MAX_SIZE) {
        dispatch({ type: "SET_ERROR", payload: "File too large — max 5 MB." });
        return;
      }

      // Immediate local preview
      const localUrl = URL.createObjectURL(file);
      dispatch({ type: "START_UPLOAD", payload: { localUrl } });

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
        dispatch({ type: "UPLOAD_SUCCESS", payload: { remoteUrl } });
      } catch (err) {
        dispatch({
          type: "UPLOAD_FAILURE",
          payload: { error: err instanceof Error ? err.message : "Upload failed" },
        });
        onChange("");
      } finally {
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
    dispatch({ type: "SET_IS_DRAGGING", payload: false });
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    dispatch({ type: "REMOVE_IMAGE" });
    onChange("");
  };

  const handleUrlApply = () => {
    const trimmed = state.urlInput.trim();
    onChange(trimmed);
    dispatch({ type: "APPLY_URL", payload: { url: trimmed } });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={state.showUrlInput ? urlInputId : fileInputId} className="text-sm font-medium text-gray-300">
          Image <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        {!state.preview && (
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_URL_INPUT" })}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <Link2 size={12} />
            Paste URL instead
          </button>
        )}
      </div>

      {/* Preview */}
      {state.preview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
          <Image
            src={state.preview}
            alt="preview"
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            onError={() => {
              dispatch({ type: "IMAGE_LOAD_ERROR", payload: { error: "Could not load image from URL" } });
              onChange("");
            }}
          />
          {state.uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-7 text-white animate-spin" />
              <span className="text-xs text-gray-300">Uploading…</span>
            </div>
          )}
          {!state.uploading && (
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
            onDragOver={(e) => { e.preventDefault(); dispatch({ type: "SET_IS_DRAGGING", payload: true }); }}
            onDragLeave={() => dispatch({ type: "SET_IS_DRAGGING", payload: false })}
            onDrop={handleDrop}
            onClick={() => !state.showUrlInput && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (state.showUrlInput) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-colors ${
              state.isDragging
                ? "border-blue-500 bg-blue-900/20 cursor-copy"
                : state.showUrlInput
                ? "border-gray-700 bg-gray-800/30 cursor-default"
                : "border-gray-600 hover:border-gray-500 bg-gray-800/30 cursor-pointer"
            }`}
          >
            <ImageIcon className="size-8 text-gray-500" />
            <p className="text-sm text-gray-300 text-center">
              {state.isDragging ? "Drop image here" : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-gray-600">JPEG · PNG · GIF · WebP (max 5 MB)</p>
          </button>

          {/* URL input (inline, below drop zone) */}
          {state.showUrlInput && (
            <div className="flex gap-2">
              <input
                id={urlInputId}
                type="text"
                aria-label="Notification image URL"
                value={state.urlInput}
                onChange={(e) => dispatch({ type: "SET_URL_INPUT", payload: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlApply(); } }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                disabled={!state.urlInput.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </>
      )}

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

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
