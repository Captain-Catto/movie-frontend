const regionDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

export function formatDateTime(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
}

export function formatDuration(seconds?: number | null) {
  const value = Number(seconds || 0);
  if (!value) return "N/A";
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(minutes, 1)}m`;
}

export function countryCodeToFlag(code?: string | null) {
  if (!code || code.length !== 2) return "🏳️";
  const upper = code.toUpperCase();
  return upper
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export function countryCodeToName(code?: string | null) {
  if (!code) return "N/A";
  try {
    return regionDisplayNames.of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function countryFlagUrl(code?: string | null) {
  if (!code || code.length !== 2) return null;
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}
