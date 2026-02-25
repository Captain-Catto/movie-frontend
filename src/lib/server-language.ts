import { cookies } from "next/headers";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
} from "@/constants/app.constants";

const LANGUAGE_COOKIE_KEY = "preferred-language";

export async function getServerPreferredLanguage(): Promise<SupportedLanguageCode> {
  const cookieStore = await cookies();
  const rawLanguage = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const normalized = rawLanguage === "vi" ? "vi-VN" : rawLanguage;

  if (
    normalized &&
    SUPPORTED_LANGUAGES.some((language) => language.code === normalized)
  ) {
    return normalized as SupportedLanguageCode;
  }

  return DEFAULT_LANGUAGE as SupportedLanguageCode;
}
