"use client";

import { IconChevronRight, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { HeaderControls } from "@/components/HeaderControls";
import { WordmarkSmall } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/useToast";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { homeDict, FACTORS, EMPTY_STATE_FALLBACK } from "@/lib/i18n/dictionaries/home";

/**
 * Home screen ("revo_fit_home_black.html" in the mockups).
 *
 * IMPORTANT (roadmap §13 — empty state): the mockup hardcodes sample numbers
 * (score 78, sleep 82, etc.) for visual review purposes. A brand-new account
 * has none of that yet, so this page currently renders the zero/empty state
 * by design — wire `useHomeSummary()` (TODO below) up to Supabase and this
 * will start showing real numbers once a user has logged at least one day.
 */

// TODO: replace with a real hook that reads today's score + factor breakdown
// from Supabase once daily_logs / scores tables exist. Returning `null` here
// is what makes this page render the correct empty state for new users.
function useHomeSummary(): { score: number; factorScores: Record<string, number> } | null {
  return null;
}

export default function HomePage() {
  const { locale } = useLocale();
  const d = pick(homeDict, locale);
  const empty = d.empty ?? EMPTY_STATE_FALLBACK;
  const { show, ToastView } = useToast();
  const summary = useHomeSummary();

  const score = summary?.score ?? 0;
  const stateText = summary ? d.state : empty.state;
  const nextTtl = summary ? d.nextTtl : empty.nextTtl;
  const nextSub = summary ? d.nextSub : empty.nextSub;

  const full = 628; // ring circumference at r=100
  const offset = full - full * (score / 100);

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">revo Fit のホーム。総合スコアと、睡眠・食事・運動・回復の内訳。そこから導かれた今日の一手。</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 18px 10px" }}>
        <WordmarkSmall width={92} />
        <HeaderControls />
      </div>

      <div style={{ flex: 1, padding: "6px 20px 0", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 14, color: "var(--text-sub)", margin: "6px 0 6px" }}>{d.greet}</p>
        <p style={{ fontSize: 14, color: summary ? "var(--state-good)" : "var(--text-sub)", margin: "0 0 18px", fontWeight: 500 }}>{stateText}</p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 0 6px" }}>
          <svg viewBox="0 0 240 240" style={{ width: 188, height: 188 }} role="img" aria-label={`${d.ringLbl} ${score}`}>
            <defs>
              <linearGradient id="fitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0D98A" />
                <stop offset="55%" stopColor="#E3C56A" />
                <stop offset="100%" stopColor="#C9A24E" />
              </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="100" fill="none" stroke="var(--border)" strokeWidth="13" />
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="url(#fitGlow)"
              strokeWidth="13"
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
              strokeDasharray={full}
              strokeDashoffset={offset}
              style={{ filter: score > 0 ? "drop-shadow(0 0 8px rgba(227,197,106,0.4))" : undefined, transition: "stroke-dashoffset 1s ease" }}
            />
            <text x="120" y="90" textAnchor="middle" fontSize="19" fontWeight={500} fill="#C9A24E" fontFamily="var(--font-jost)" letterSpacing="1">
              {d.ringLbl}
            </text>
            <text x="120" y="154" textAnchor="middle" fontSize="62" fontWeight={600} fill="var(--text)">
              {score}
            </text>
          </svg>
        </div>

        <div style={{ display: "flex", gap: 8, margin: "20px 0 0" }}>
          {FACTORS.map((f) => {
            const val = summary?.factorScores[f.key] ?? 0;
            const color = val >= 75 ? "var(--state-good)" : val >= 60 ? "var(--accent)" : "var(--text-muted)";
            return (
              <div key={f.key} style={{ flex: 1, background: "var(--field-bg)", border: "0.5px solid var(--field-border)", borderRadius: 14, padding: "11px 6px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color }}>{val}</span>
                <div style={{ width: "100%", height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${val}%`, height: 3, background: color }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--text-sub)" }}>{d.factors[f.key]}</span>
              </div>
            );
          })}
        </div>

        <div style={{ margin: "22px 0 0" }}>
          <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "0 0 9px", fontWeight: 500, letterSpacing: "0.03em" }}>{d.nextLbl}</p>
          <div
            style={{
              background: "linear-gradient(135deg,#1F1B12,#46412F)",
              border: "0.5px solid #4A4230",
              borderRadius: 18,
              padding: 17,
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer"
            }}
            onClick={() => show(d.more)}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#F0EBE2", margin: "0 0 3px" }}>{nextTtl}</p>
              <p style={{ fontSize: 12, color: "#B0A488", margin: 0, lineHeight: 1.5 }}>{nextSub}</p>
            </div>
            <IconChevronRight size={19} color="#8A7E68" />
          </div>
        </div>

        <button className="rf-btn-primary" style={{ marginTop: 14 }} onClick={() => show(empty.recordHint + " — /log 🚧")}>
          <IconPlus size={18} />
          <span>{d.record}</span>
        </button>

        <button style={{ margin: "13px 0 6px", background: "transparent", border: "none", color: "var(--text-sub)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => show(d.more + " 🚧")}>
          <span>{d.more}</span>
          <IconChevronDown size={15} />
        </button>
      </div>

      <BottomNav labels={d.nav} activeIndex={0} />
      {ToastView}
    </div>
  );
}
