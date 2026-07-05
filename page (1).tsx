"use client";

import { useEffect, useRef, useState } from "react";
import { IconWorld, IconSun, IconMoon, IconCheck } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LANGUAGES } from "@/lib/i18n/languages";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="rf-icon-btn" aria-label="明るさ / theme" onClick={toggleTheme}>
      {theme === "dark" ? <IconSun size={16} color="var(--accent)" /> : <IconMoon size={16} color="var(--accent)" />}
    </button>
  );
}

export function LangToggleButton() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button className="rf-icon-btn" aria-label="言語 / language" onClick={() => setOpen((v) => !v)}>
        <IconWorld size={16} />
      </button>
      {open && (
        <div className="rf-menu" style={{ top: 40, right: 0 }}>
          {LANGUAGES.map((l) => {
            const active = l.code === locale;
            return (
              <div
                key={l.code}
                className="rf-menu-row"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
              >
                <div>
                  <p style={{ fontSize: 13, margin: 0, fontWeight: active ? 500 : 400, color: active ? "var(--accent)" : "var(--text)" }}>{l.label}</p>
                  {l.subLabel && <p style={{ fontSize: 10, margin: "1px 0 0", color: "var(--text-sub)" }}>{l.subLabel}</p>}
                </div>
                {active && <IconCheck size={16} color="var(--accent)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** The pair of round icon buttons (world + sun/moon) shown top-right on almost every screen. */
export function HeaderControls() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <LangToggleButton />
      <ThemeToggleButton />
    </div>
  );
}
