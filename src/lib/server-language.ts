import { cookies, headers } from "next/headers";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
} from "@/constants/app.constants";

const LANGUAGE_COOKIE_KEY = "preferred-language";
const LANGUAGE_HEADER_KEY = "x-preferred-language";

export async function getServerPreferredLanguage(): Promise<SupportedLanguageCode> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const rawLanguage =
    headerStore.get(LANGUAGE_HEADER_KEY) ||
    cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const normalized = rawLanguage === "vi" ? "vi-VN" : rawLanguage;

  if (
    normalized &&
    SUPPORTED_LANGUAGES.some((language) => language.code === normalized)
  ) {
    return normalized as SupportedLanguageCode;
  }

  return DEFAULT_LANGUAGE as SupportedLanguageCode;
}
