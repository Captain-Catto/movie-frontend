interface StatusBannerProps {
  message: string;
  tone?: "error" | "info";
  className?: string;
}

export default function StatusBanner({
  message,
  tone = "error",
  className = "",
}: StatusBannerProps) {
  const toneClass =
    tone === "error"
      ? "bg-red-900/20 border-red-500 text-red-200"
      : "bg-blue-900/20 border-blue-500 text-blue-200";

  return (
    <div className={`border px-4 py-2 rounded ${toneClass} ${className}`}>
      {message}
    </div>
  );
}

