import { LocaleCode } from "./languages";

export type Dict<T> = Record<LocaleCode, T>;

/** Looks up a per-screen dictionary for the current locale, falling back to English. */
export function pick<T>(dict: Dict<T>, locale: LocaleCode): T {
  return dict[locale] ?? dict.en;
}
