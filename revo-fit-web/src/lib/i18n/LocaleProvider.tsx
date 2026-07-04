"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LocaleCode, isLocaleCode } from "./languages";

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "revo_locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isLocaleCode(stored)) {
      setLocaleState(stored);
      return;
    }
    // Best-effort guess from the browser on first visit; the user can
    // always change it from the language switcher afterwards.
    const nav = window.navigator.language.toLowerCase();
    if (nav.startsWith("ja")) setLocaleState("ja");
    else if (nav.startsWith("zh-tw") || nav.startsWith("zh-hant")) setLocaleState("zh-Hant");
    else if (nav.startsWith("zh")) setLocaleState("zh-Hans");
    else if (nav.startsWith("ko")) setLocaleState("ko");
    else if (nav.startsWith("fr")) setLocaleState("fr");
    else if (nav.startsWith("es")) setLocaleState("es");
    else if (nav.startsWith("de")) setLocaleState("de");
    else if (nav.startsWith("it")) setLocaleState("it");
    else if (nav.startsWith("pt")) setLocaleState("pt");
    else if (nav.startsWith("th")) setLocaleState("th");
    else if (nav.startsWith("hi")) setLocaleState("hi");
    else if (nav.startsWith("vi")) setLocaleState("vi");
    else if (nav.startsWith("id")) setLocaleState("id");
    else if (nav.startsWith("en")) setLocaleState("en");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale: setLocaleState }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
