"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconChevronDown, IconChevronUp, IconCheck, IconFlame, IconBarbell, IconHeart, IconMoon, IconDroplet } from "@tabler/icons-react";
import { ThemeToggleButton } from "@/components/HeaderControls";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { goalSetupDict, GOALS, GoalKey } from "@/lib/i18n/dictionaries/goalSetup";

const GOAL_ICONS: Record<string, typeof IconFlame> = {
  IconFlame,
  IconBarbell,
  IconHeart,
  IconMoon,
  IconDroplet
};

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-sub)" }}>{label}</span>
        <span style={{ fontSize: 15, color: "var(--accent)", fontWeight: 600, fontFamily: "var(--font-jost)" }}>
          {value.toFixed(unit === "cm" ? 0 : 1)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ background: `linear-gradient(90deg, var(--accent) ${pct}%, var(--border) ${pct}%)` }}
      />
    </div>
  );
}

export default function GoalSetupPage() {
  const { locale } = useLocale();
  const d = pick(goalSetupDict, locale);
  const router = useRouter();

  const [selected, setSelected] = useState<Partial<Record<GoalKey, boolean>>>({});
  const [optOpen, setOptOpen] = useState(false);
  const [weight, setWeight] = useState(68.2);
  const [height, setHeight] = useState(170);
  const [goalWeight, setGoalWeight] = useState(64.0);
  const [bodyfat, setBodyfat] = useState(20.0);
  const [muscle, setMuscle] = useState(28.0);

  const anySelected = Object.values(selected).some(Boolean);
  const needsWeight = useMemo(() => GOALS.some((g) => g.needsWeight && selected[g.key]), [selected]);

  function toggle(k: GoalKey) {
    setSelected((s) => ({ ...s, [k]: !s[k] }));
  }

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">体組成と目標の設定。目指すことを複数選べる。体重と身長を入れ、体脂肪率や筋肉量は任意。</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 0" }}>
        <button className="rf-icon-btn" style={{ background: "transparent", border: "none" }} aria-label="戻る" onClick={() => router.back()}>
          <IconArrowLeft size={20} color="var(--text-sub)" />
        </button>
        <ThemeToggleButton />
      </div>

      <div style={{ flex: 1, padding: "14px 22px 0", overflowY: "auto" }}>
        <p style={{ fontSize: 21, fontWeight: 500, color: "var(--text)", margin: "0 0 6px" }}>{d.ttl}</p>
        <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "0 0 22px", lineHeight: 1.6 }}>{d.sub}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
          {GOALS.map((g) => {
            const on = !!selected[g.key];
            const Icon = GOAL_ICONS[g.icon];
            return (
              <div
                key={g.key}
                onClick={() => toggle(g.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "13px 15px",
                  borderRadius: 13,
                  cursor: "pointer",
                  background: on ? "var(--menu-hover)" : "var(--field-bg)",
                  border: on ? "1.5px solid var(--accent)" : "0.5px solid var(--field-border)"
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 11, background: on ? "rgba(227,197,106,0.13)" : "var(--icon-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={19} color={on ? "var(--accent)" : "var(--text-sub)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, margin: "0 0 2px", fontWeight: on ? 600 : 500, color: on ? "var(--accent)" : "var(--text)" }}>{d.goals[g.key]}</p>
                  <p style={{ fontSize: 11, color: "var(--text-sub)", margin: 0 }}>{d.goalsSub[g.key]}</p>
                </div>
                {on ? <IconCheck size={19} color="var(--accent)" /> : <div style={{ width: 19 }} />}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 4px", fontWeight: 600 }}>{d.bodyLbl}</p>
        <p style={{ fontSize: 11, color: "var(--text-sub)", margin: "0 0 14px", lineHeight: 1.6 }}>{d.bodySub}</p>

        <Slider label={d.rows.weight} value={weight} min={35} max={150} step={0.1} unit={d.kg} onChange={setWeight} />
        <Slider label={d.rows.height} value={height} min={130} max={210} step={0.5} unit={d.cm} onChange={setHeight} />
        {needsWeight && <Slider label={d.rows.goalWeight} value={goalWeight} min={35} max={150} step={0.1} unit={d.kg} onChange={setGoalWeight} />}

        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", cursor: "pointer", borderTop: "0.5px solid var(--border)", margin: "6px 0 0" }}
          onClick={() => setOptOpen((v) => !v)}
        >
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{d.opt}</span>
          {optOpen ? <IconChevronUp size={18} color="var(--text-muted)" /> : <IconChevronDown size={18} color="var(--text-muted)" />}
        </div>
        {optOpen && (
          <div style={{ paddingTop: 8 }}>
            <Slider label={d.rows.bodyfat} value={bodyfat} min={3} max={50} step={0.1} unit={d.pct} onChange={setBodyfat} />
            <Slider label={d.rows.muscle} value={muscle} min={15} max={70} step={0.1} unit={d.kg} onChange={setMuscle} />
          </div>
        )}
      </div>

      <div style={{ padding: "14px 22px 24px" }}>
        <button className="rf-btn-primary" disabled={!anySelected} onClick={() => router.push("/home")}>
          <span>{d.start}</span>
          <IconArrowRight size={18} />
        </button>
        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "12px 2px 0", lineHeight: 1.65, textAlign: "center" }}>{d.med}</p>
      </div>
    </div>
  );
}
