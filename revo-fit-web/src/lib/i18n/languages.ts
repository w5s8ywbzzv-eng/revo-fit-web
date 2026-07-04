// The 14 user-facing languages revo fit ships with (per SCREENS.md / README.md).
// Admin screens (screens_admin) are Japanese-only and are out of scope here.

export type LocaleCode =
  | "ja"
  | "en"
  | "zh-Hans"
  | "zh-Hant"
  | "ko"
  | "fr"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "th"
  | "hi"
  | "vi"
  | "id";

export interface LanguageMeta {
  code: LocaleCode;
  label: string; // native name, shown in the language switcher
  subLabel?: string; // localized description shown under the native name (in the current UI language when possible; falls back to Japanese gloss from the source mockups)
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English", subLabel: "英語" },
  { code: "zh-Hans", label: "简体中文", subLabel: "中国語（簡体）" },
  { code: "zh-Hant", label: "繁體中文", subLabel: "中国語（繁体）" },
  { code: "ko", label: "한국어", subLabel: "韓国語" },
  { code: "fr", label: "Français", subLabel: "フランス語" },
  { code: "es", label: "Español", subLabel: "スペイン語" },
  { code: "de", label: "Deutsch", subLabel: "ドイツ語" },
  { code: "it", label: "Italiano", subLabel: "イタリア語" },
  { code: "pt", label: "Português", subLabel: "ポルトガル語" },
  { code: "th", label: "ภาษาไทย", subLabel: "タイ語" },
  { code: "hi", label: "हिन्दी", subLabel: "ヒンディー語" },
  { code: "vi", label: "Tiếng Việt", subLabel: "ベトナム語" },
  { code: "id", label: "Bahasa Indonesia", subLabel: "インドネシア語" }
];

export const DEFAULT_LOCALE: LocaleCode = "ja";

export function isLocaleCode(value: string): value is LocaleCode {
  return LANGUAGES.some((l) => l.code === value);
}
