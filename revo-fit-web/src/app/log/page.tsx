"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconChevronDown,
  IconChevronUp,
  IconMoon,
  IconSalad,
  IconBarbell,
  IconScale,
  IconDroplet,
  IconHeartRateMonitor,
  IconCamera,
  IconPencil,
  IconStar,
  IconChartDots,
  IconPlus,
  IconTrophy
} from "@tabler/icons-react";
import { HeaderControls } from "@/components/HeaderControls";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/useToast";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { logDict, LOG_ITEMS, LogItemKey } from "@/lib/i18n/dictionaries/log";
import { homeDict } from "@/lib/i18n/dictionaries/home";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Log screen ("revo_fit_log_black.html" in the mockups).
 *
 * Scope for this pass: every category (sleep/food/move/body/water/condition)
 * is fully interactive (chips, steppers, toggles), but only "body" actually
 * persists to Supabase (the `body_metrics` table already exists in schema.sql).
 * The rest — sleep/food/move/water/condition raw diary entries — need a new
 * `daily_logs`-style table before they can be saved for real; until then,
 * pressing "record" just marks them logged for this session and shows a
 * toast, the same stub pattern used by `useHomeSummary()` on the home screen.
 * Food photo/manual entry is intentionally a "coming soon" toast — that needs
 * its own capture UI + storage before it can go further than this mockup port.
 */

const ITEM_ICONS: Record<string, typeof IconMoon> = {
  IconMoon,
  IconSalad,
  IconBarbell,
  IconScale,
  IconDroplet,
  IconHeartRateMonitor
};

const stepBtnStyle: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "var(--field-bg)",
  border: "0.5px solid var(--field-border)",
  color: "var(--text-sub)",
  fontSize: 17,
  cursor: "pointer",
  lineHeight: 1,
  flexShrink: 0
};

function Chip({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  const c = color ?? "var(--accent)";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        fontSize: 12,
        padding: "7px 13px",
        borderRadius: 999,
        cursor: "pointer",
        background: active ? `color-mix(in srgb, ${c} 16%, transparent)` : "var(--field-bg)",
        color: active ? c : "var(--text-tertiary)",
        border: active ? `1.5px solid ${c}` : "0.5px solid var(--field-border)"
      }}
    >
      {label}
    </button>
  );
}

function StepBtn({ dir, onClick, disabled }: { dir: "-" | "+"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ ...stepBtnStyle, opacity: disabled ? 0.4 : 1 }}
    >
      {dir === "-" ? "−" : "＋"}
    </button>
  );
}

export default function LogPage() {
  const { locale } = useLocale();
  const d = pick(logDict, locale);
  const nav = pick(homeDict, locale).nav;
  const router = useRouter();
  const { show, ToastView } = useToast();

  const [open, setOpen] = useState<Record<LogItemKey, boolean>>({
    sleep: false,
    food: false,
    move: false,
    body: false,
    water: false,
    condition: false
  });
  const [done, setDone] = useState<Record<LogItemKey, boolean>>({
    sleep: false,
    food: false,
    move: false,
    body: false,
    water: false,
    condition: false
  });
  const [teaseOpen, setTeaseOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // sleep
  const [sleepMin, setSleepMin] = useState(420); // default 7h, editable
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);

  // food (see comment above re: scope)
  const [dietIdx, setDietIdx] = useState(0);
  const [nutOpen, setNutOpen] = useState(false);

  // move
  const [moveParts, setMoveParts] = useState<Set<number>>(new Set());
  const [moveMinutes, setMoveMinutes] = useState(0);

  // body — pre-filled from the user's last body_metrics row if one exists
  const [weight, setWeight] = useState(65.0);
  const [bodyFat, setBodyFat] = useState(20.0);
  const [muscle, setMuscle] = useState(28.0);

  // water
  const [waterMl, setWaterMl] = useState(0);
  const [waterType, setWaterType] = useState<number | null>(null);
  const [includeSupp, setIncludeSupp] = useState(false);

  // condition
  const [bowelIdx, setBowelIdx] = useState<number | null>(null);
  const [moodIdx, setMoodIdx] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("body_metrics")
        .select("weight_kg, body_fat_pct, muscle_mass_kg")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        if (data.weight_kg != null) setWeight(Number(data.weight_kg));
        if (data.body_fat_pct != null) setBodyFat(Number(data.body_fat_pct));
        if (data.muscle_mass_kg != null) setMuscle(Number(data.muscle_mass_kg));
      }
    })();
  }, []);

  function toggleOpen(key: LogItemKey) {
    setOpen((o) => ({ ...o, [key]: !o[key] }));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = getSupabaseClient();
    if (supabase) {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("body_metrics").insert({
          user_id: user.id,
          weight_kg: weight,
          body_fat_pct: bodyFat,
          muscle_mass_kg: muscle
        });
      }
    }
    setDone({ sleep: true, food: true, move: true, body: true, water: true, condition: true });
    setOpen({ sleep: false, food: false, move: false, body: false, water: false, condition: false });
    setSaving(false);
    show(d.savedToast);
  }

  const sleepH = Math.floor(sleepMin / 60);
  const sleepM = sleepMin % 60;
  const cups = Math.round(waterMl / 200);
  const waterTypeLabels = includeSupp ? [...d.waterTypes, d.waterSuppTag] : d.waterTypes;

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">
        revo Fit の記録。睡眠・食事・運動・からだ・水分・コンディションをタップして入れる。言語と明暗を切り替えられる。
      </h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <button className="rf-icon-btn" style={{ background: "transparent", border: "none" }} aria-label="戻る" onClick={() => router.back()}>
            <IconArrowLeft size={20} color="var(--text-sub)" />
          </button>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", margin: 0 }}>{d.hdr}</p>
        </div>
        <HeaderControls />
      </div>

      <div style={{ flex: 1, padding: "0 18px" }}>
        <p style={{ fontSize: 13, color: "var(--text-sub)", margin: "0 0 16px", lineHeight: 1.6 }}>{d.lead}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {LOG_ITEMS.map((item) => {
            const Icon = ITEM_ICONS[item.icon];
            const isOpen = open[item.key];
            const isDone = done[item.key];
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => toggleOpen(item.key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "var(--field-bg)",
                    border: "0.5px solid var(--field-border)",
                    borderRadius: 15,
                    padding: "14px 15px",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "var(--icon-bg)",
                      border: "0.5px solid var(--icon-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <Icon size={22} color={item.col} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: "var(--text)", margin: 0, fontWeight: 500 }}>{d.names[item.key]}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "4px 10px",
                      borderRadius: 999,
                      color: isDone ? "var(--state-good)" : "var(--text-muted)",
                      background: isDone ? "color-mix(in srgb, var(--state-good) 14%, transparent)" : "var(--border)"
                    }}
                  >
                    {isDone ? d.done : d.yet}
                  </span>
                  {isOpen ? <IconChevronUp size={17} color="var(--text-muted)" /> : <IconChevronDown size={17} color="var(--text-muted)" />}
                </button>

                {isOpen && (
                  <div
                    style={{
                      background: "var(--icon-bg)",
                      border: "0.5px solid var(--border-strong)",
                      borderTop: "none",
                      borderRadius: "0 0 15px 15px",
                      margin: "-6px 7px 0",
                      padding: "16px 15px 14px"
                    }}
                  >
                    {item.key === "sleep" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "0 0 12px" }}>
                          <StepBtn dir="-" onClick={() => setSleepMin((m) => Math.max(0, m - 15))} disabled={sleepMin <= 0} />
                          <span style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>
                            {sleepH}
                            <span style={{ fontSize: 11, color: "var(--text-sub)" }}>{d.sleepH}</span> {sleepM}
                            <span style={{ fontSize: 11, color: "var(--text-sub)" }}>{d.sleepM}</span>
                          </span>
                          <StepBtn dir="+" onClick={() => setSleepMin((m) => Math.min(960, m + 15))} disabled={sleepMin >= 960} />
                        </div>
                        <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap" }}>
                          {d.sleepQ.map((q, i) => (
                            <Chip key={q} label={q} active={sleepQuality === i} color="#B4ABE8" onClick={() => setSleepQuality(i)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {item.key === "food" && (
                      <div>
                        <div style={{ display: "flex", gap: 9, margin: "0 0 14px" }}>
                          <button
                            type="button"
                            onClick={() => show(d.foodComingSoon)}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 5,
                              background: "var(--field-bg)",
                              border: "0.5px solid var(--field-border)",
                              padding: "12px 8px",
                              borderRadius: 13,
                              cursor: "pointer"
                            }}
                          >
                            <IconCamera size={20} color="var(--accent)" />
                            <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{d.foodPhoto}</span>
                            <span style={{ fontSize: 9, color: "var(--text-muted)", background: "var(--border)", padding: "2px 8px", borderRadius: 999 }}>
                              {d.foodPhotoSub}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => show(d.foodComingSoon)}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 5,
                              background: "var(--field-bg)",
                              border: "0.5px solid var(--field-border)",
                              padding: "12px 8px",
                              borderRadius: 13,
                              cursor: "pointer"
                            }}
                          >
                            <IconPencil size={20} color="var(--accent)" />
                            <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{d.foodWrite}</span>
                            <span
                              style={{
                                fontSize: 9,
                                color: "var(--state-good)",
                                background: "color-mix(in srgb, var(--state-good) 14%, transparent)",
                                padding: "2px 8px",
                                borderRadius: 999
                              }}
                            >
                              {d.foodWriteSub}
                            </span>
                          </button>
                        </div>

                        <p style={{ fontSize: 11, color: "var(--text-sub)", margin: "0 0 8px", fontWeight: 500 }}>{d.foodLogged}</p>
                        <button
                          type="button"
                          onClick={() => show(d.foodComingSoon)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "transparent",
                            border: "0.5px dashed var(--border-strong)",
                            borderRadius: 11,
                            padding: "10px 13px",
                            cursor: "pointer",
                            marginBottom: 12
                          }}
                        >
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.foodEmpty}</span>
                          <IconPlus size={14} color="var(--text-muted)" />
                        </button>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 12px", borderTop: "0.5px solid var(--border-strong)" }}>
                          <span style={{ fontSize: 12, color: "var(--text-sub)" }}>{d.foodTotal}</span>
                          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                            0 <span style={{ fontSize: 11, color: "var(--text-sub)", fontWeight: 400 }}>kcal</span>
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 10, margin: "0 0 12px" }}>
                          {[d.pfc.p, d.pfc.f, d.pfc.c].map((lbl) => (
                            <div key={lbl} style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 0 4px" }}>
                                <span style={{ fontSize: 10, color: "var(--text-sub)" }}>{lbl}</span>
                                <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                                  0<span style={{ fontSize: 9, color: "var(--text-sub)", fontWeight: 400 }}>g</span>
                                </span>
                              </div>
                              <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: "0%", height: 5, background: "var(--accent)" }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 9px" }}>
                          <span style={{ fontSize: 11, color: "var(--text-sub)", fontWeight: 500 }}>{d.dietLbl}</span>
                        </div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "0 0 4px" }}>
                          {d.diets.map((diet, i) => (
                            <Chip key={diet} label={diet} active={dietIdx === i} onClick={() => setDietIdx(i)} />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNutOpen((v) => !v);
                          }}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            color: "var(--text-sub)",
                            fontSize: 11,
                            cursor: "pointer",
                            padding: "9px 0 2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5
                          }}
                        >
                          {nutOpen ? d.nutClose : d.nutMore}
                          {nutOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                        </button>
                        {nutOpen && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 9, margin: "10px 0 0", padding: "12px 0 0", borderTop: "0.5px solid var(--border-strong)" }}>
                            {[d.sugar, d.fiber, d.salt].map((lbl) => (
                              <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 12, color: "var(--text-sub)" }}>{lbl}</span>
                                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>0g</span>
                              </div>
                            ))}
                            <p style={{ fontSize: 10, color: "var(--state-good)", margin: "4px 0 0", lineHeight: 1.6 }}>{d.gutHint}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {item.key === "move" && (
                      <div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "0 0 13px" }}>
                          {d.moveParts.map((p, i) => (
                            <Chip
                              key={p}
                              label={p}
                              active={moveParts.has(i)}
                              color="var(--accent)"
                              onClick={() =>
                                setMoveParts((s) => {
                                  const n = new Set(s);
                                  if (n.has(i)) n.delete(i);
                                  else n.add(i);
                                  return n;
                                })
                              }
                            />
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                          <StepBtn dir="-" onClick={() => setMoveMinutes((m) => Math.max(0, m - 5))} disabled={moveMinutes <= 0} />
                          <span style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>
                            {moveMinutes}
                            <span style={{ fontSize: 11, color: "var(--text-sub)" }}> {d.moveMin}</span>
                          </span>
                          <StepBtn dir="+" onClick={() => setMoveMinutes((m) => Math.min(240, m + 5))} disabled={moveMinutes >= 240} />
                        </div>
                      </div>
                    )}

                    {item.key === "body" && (
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 10px" }}>{d.bodyDelta}</p>
                        {[
                          { lbl: d.bodyW, val: weight, unit: "kg", set: setWeight, step: 0.1, min: 30, max: 200 },
                          { lbl: d.bodyF, val: bodyFat, unit: "%", set: setBodyFat, step: 0.1, min: 3, max: 60 },
                          { lbl: d.bodyM, val: muscle, unit: "kg", set: setMuscle, step: 0.1, min: 10, max: 100 }
                        ].map((row, idx) => (
                          <div key={row.lbl}>
                            {idx > 0 && <div style={{ height: 0.5, background: "var(--border-strong)" }} />}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
                              <span style={{ fontSize: 13, color: "var(--text-sub)" }}>{row.lbl}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                <StepBtn dir="-" onClick={() => row.set((v: number) => Math.max(row.min, Math.round((v - row.step) * 10) / 10))} />
                                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--accent)", minWidth: 58, textAlign: "center" }}>
                                  {row.val.toFixed(1)}
                                  <span style={{ fontSize: 10, color: "var(--text-sub)", fontWeight: 400 }}>{row.unit}</span>
                                </span>
                                <StepBtn dir="+" onClick={() => row.set((v: number) => Math.min(row.max, Math.round((v + row.step) * 10) / 10))} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.key === "water" && (
                      <div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, margin: "0 0 13px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                            <StepBtn dir="-" onClick={() => setWaterMl((v) => Math.max(0, v - 50))} disabled={waterMl <= 0} />
                            <span style={{ fontSize: 22, fontWeight: 600, color: "var(--accent)", minWidth: 96, textAlign: "center" }}>
                              {waterMl.toLocaleString()}
                              <span style={{ fontSize: 12, color: "var(--text-sub)", fontWeight: 400 }}> ml</span>
                            </span>
                            <StepBtn dir="+" onClick={() => setWaterMl((v) => Math.min(5000, v + 50))} disabled={waterMl >= 5000} />
                          </div>
                          <span style={{ fontSize: 11, color: "var(--text-sub)" }}>
                            ≈ {cups} {d.waterCups}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", margin: "0 0 14px" }}>
                          {waterTypeLabels.map((w, i) => (
                            <Chip key={w} label={w} active={waterType === i} color="#6FA8DC" onClick={() => setWaterType(i)} />
                          ))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "var(--field-bg)",
                            border: "0.5px solid var(--field-border)",
                            borderRadius: 11,
                            padding: "11px 13px"
                          }}
                        >
                          <span style={{ fontSize: 11, color: "var(--text-sub)", lineHeight: 1.5, flex: 1, paddingRight: 10 }}>{d.waterSuppToggle}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIncludeSupp((v) => !v);
                            }}
                            style={{
                              width: 42,
                              height: 24,
                              borderRadius: 999,
                              border: "none",
                              cursor: "pointer",
                              position: "relative",
                              background: includeSupp ? "var(--state-good)" : "var(--border-strong)",
                              transition: "background 0.25s",
                              flexShrink: 0
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: 2,
                                left: includeSupp ? 20 : 2,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "#fff",
                                transition: "left 0.25s"
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {item.key === "condition" && (
                      <div>
                        <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "0 0 8px", fontWeight: 500 }}>{d.condBowel}</p>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "0 0 16px" }}>
                          {d.condBowelStates.map((s, i) => (
                            <Chip key={s} label={s} active={bowelIdx === i} color="#E89BB8" onClick={() => setBowelIdx(i)} />
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "0 0 8px", fontWeight: 500 }}>{d.condMood}</p>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "0 0 12px" }}>
                          {d.condMoods.map((m, i) => (
                            <Chip key={m} label={m} active={moodIdx === i} onClick={() => setMoodIdx(i)} />
                          ))}
                        </div>
                        <p style={{ fontSize: 10, color: "var(--state-good)", margin: 0, lineHeight: 1.6 }}>{d.condGut}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: "16px 0 0" }}>
          <div style={{ background: "var(--field-bg)", border: "0.5px solid var(--field-border)", borderRadius: 16, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setTeaseOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "15px 16px",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                textAlign: "left"
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--icon-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconChartDots size={19} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 2px", fontWeight: 600 }}>{d.tease.ttl}</p>
                <p style={{ fontSize: 11, color: "var(--text-sub)", margin: 0 }}>{d.tease.sub}</p>
              </div>
              {teaseOpen ? <IconChevronUp size={18} color="var(--text-sub)" /> : <IconChevronDown size={18} color="var(--text-sub)" />}
            </button>
            {teaseOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "4px 0 14px" }}>
                  <div style={{ background: "var(--bg)", border: "0.5px solid var(--border-strong)", borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 10, color: "var(--text-sub)", margin: "0 0 8px" }}>{d.tease.pv1}</p>
                    <svg viewBox="0 0 280 70" style={{ width: "100%", height: "auto" }} aria-hidden="true">
                      <polyline
                        points="6,58 30,52 54,54 78,44 102,46 126,36 150,38 174,28 198,30 222,20 246,22 270,12"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx={270} cy={12} r={3} fill="var(--accent)" />
                    </svg>
                  </div>
                  <div style={{ background: "var(--bg)", border: "0.5px solid var(--border-strong)", borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 10, color: "var(--text-sub)", margin: "0 0 8px" }}>{d.tease.pv2}</p>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 44 }}>
                      {[38, 26, 32, 18, 30, 22].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: h, background: "var(--accent)", opacity: 0.5 + h / 76, borderRadius: 4 }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "var(--bg)", border: "0.5px solid var(--border-strong)", borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 10, color: "var(--text-sub)", margin: "0 0 8px" }}>{d.tease.pv3}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <IconTrophy size={13} color="var(--accent)" />
                        <span style={{ fontSize: 11, color: "var(--text)" }}>{d.tease.pv3a}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: "var(--state-good)" }}>+5kg</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <IconTrophy size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.tease.pv3b}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: "var(--state-good)" }}>+2.5kg</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => show(`${d.tease.unlock} 🚧`)}
                  style={{
                    width: "100%",
                    background: "var(--accent)",
                    border: "none",
                    color: "var(--on-accent)",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: 13,
                    borderRadius: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7
                  }}
                >
                  <IconStar size={16} />
                  <span>{d.tease.unlock}</span>
                </button>
                <p style={{ textAlign: "center", fontSize: 10, color: "var(--text-sub)", margin: "9px 0 0" }}>{d.tease.unlockSub}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 18px 22px" }}>
        <button className="rf-btn-primary" onClick={handleSave} disabled={saving}>
          {d.save}
        </button>
      </div>

      <BottomNav
        labels={nav}
        activeIndex={3}
        onSelect={(i) => {
          if (i === 0) router.push("/home");
          else if (i !== 3) show(nav[i] + " 🚧");
        }}
      />
      {ToastView}
    </div>
  );
}
