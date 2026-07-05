"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconWorld, IconMapPin, IconChevronDown, IconChevronUp, IconCheck, IconArrowRight } from "@tabler/icons-react";
import { ThemeToggleButton } from "@/components/HeaderControls";
import { WordmarkSmall } from "@/components/Logo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { onboardingDict, REGIONS } from "@/lib/i18n/dictionaries/onboarding";
import { LANGUAGES } from "@/lib/i18n/languages";

export default function OnboardingPage() {
  const { locale, setLocale } = useLocale();
  const d = pick(onboardingDict, locale);
  const router = useRouter();

  const [region, setRegion] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setRegionOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const regionLabel = (code: string) => {
    const r = REGIONS.find((x) => x.code === code);
    if (!r) return d.regionPh;
    return d.local ? r.name : r.en;
  };

  return (
    <div className="rf-screen" ref={wrapRef}>
      <h1 className="rf-visually-hidden">revo fit のオンボーディング。言語と国・地域をプルダウンで選ぶ。あとから設定でいつでも変更できる。</h1>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 18px 0" }}>
        <ThemeToggleButton />
      </div>

      <div style={{ padding: "30px 22px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginBottom: 22 }}>
          <WordmarkSmall width={132} />
        </div>
        <p style={{ fontSize: 22, fontWeight: 500, color: "var(--text)", margin: "0 0 8px" }}>{d.welcome}</p>
        <p style={{ fontSize: 12, color: "var(--text-sub)", margin: 0, textAlign: "center", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: d.welcomeSub }} />
      </div>

      <div style={{ flex: 1, padding: "34px 22px 0", position: "relative" }}>
        <p style={{ fontSize: 11, color: "var(--text-sub)", margin: "0 0 7px", letterSpacing: "0.03em" }}>{d.langLbl}</p>
        <button
          className="rf-field"
          style={{ width: "100%", justifyContent: "space-between", padding: "14px 16px", marginBottom: 18, cursor: "pointer" }}
          onClick={() => {
            setLangOpen((v) => !v);
            setRegionOpen(false);
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconWorld size={18} color="var(--accent)" />
            <span style={{ fontSize: 14, color: "var(--text)" }}>{LANGUAGES.find((l) => l.code === locale)?.label}</span>
          </span>
          {langOpen ? <IconChevronUp size={18} color="var(--text-muted)" /> : <IconChevronDown size={18} color="var(--text-muted)" />}
        </button>
        {langOpen && (
          <div className="rf-menu" style={{ left: 22, right: 22, top: 96 }}>
            {LANGUAGES.map((l) => {
              const active = l.code === locale;
              return (
                <div
                  key={l.code}
                  className="rf-menu-row"
                  onClick={() => {
                    setLocale(l.code);
                    setLangOpen(false);
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: active ? 500 : 400, color: active ? "var(--accent)" : "var(--text)" }}>{l.label}</p>
                  </div>
                  {active && <IconCheck size={16} color="var(--accent)" />}
                </div>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--text-sub)", margin: "0 0 7px", letterSpacing: "0.03em" }}>{d.regionLbl}</p>
        <button
          className="rf-field"
          style={{ width: "100%", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer" }}
          onClick={() => {
            setRegionOpen((v) => !v);
            setLangOpen(false);
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconMapPin size={18} color="var(--accent)" />
            <span style={{ fontSize: 14, color: region ? "var(--text)" : "var(--text-sub)" }}>{region ? regionLabel(region) : d.regionPh}</span>
          </span>
          {regionOpen ? <IconChevronUp size={18} color="var(--text-muted)" /> : <IconChevronDown size={18} color="var(--text-muted)" />}
        </button>
        {regionOpen && (
          <div className="rf-menu" style={{ left: 22, right: 22, top: 220 }}>
            {REGIONS.map((r) => {
              const active = r.code === region;
              const label = d.local ? r.name : r.en;
              const sub = label !== r.en ? r.en : "";
              return (
                <div
                  key={r.code}
                  className="rf-menu-row"
                  onClick={() => {
                    setRegion(r.code);
                    setRegionOpen(false);
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: active ? 500 : 400, color: active ? "var(--accent)" : "var(--text)" }}>{label}</p>
                    {sub && <p style={{ fontSize: 10, margin: "1px 0 0", color: "var(--text-sub)" }}>{sub}</p>}
                  </div>
                  {active && <IconCheck size={16} color="var(--accent)" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 22px 24px" }}>
        <button className="rf-btn-primary" disabled={!region} onClick={() => router.push("/goal-setup")}>
          <span>{d.start}</span>
          <IconArrowRight size={18} />
        </button>
        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "12px 2px 0", lineHeight: 1.65, textAlign: "center" }} dangerouslySetInnerHTML={{ __html: d.disc }} />
      </div>
    </div>
  );
}
