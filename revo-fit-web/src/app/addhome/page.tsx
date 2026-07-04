"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderControls } from "@/components/HeaderControls";
import { useToast } from "@/components/useToast";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { addHomeDict } from "@/lib/i18n/dictionaries/addhome";

export default function AddHomePage() {
  const { locale } = useLocale();
  const d = pick(addHomeDict, locale);
  const { show, ToastView } = useToast();
  const router = useRouter();
  const [device, setDevice] = useState<"ios" | "android">("ios");

  const steps = d[device];

  function proceed() {
    show(d.toast);
    setTimeout(() => router.push("/onboarding"), 400);
  }

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">revo をホーム画面に追加するための案内画面。iPhone と Android で手順を切り替えて示す。</h1>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 18px", gap: 8 }}>
        <HeaderControls />
      </div>

      <div style={{ padding: "24px 30px 40px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 34px" }}>
          <div style={{ width: 78, height: 78, borderRadius: 19, background: "var(--bg)", border: "0.5px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 16px 40px -10px rgba(0,0,0,0.6)" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-jost)", fontWeight: 200, fontSize: 21, color: "var(--text)", letterSpacing: 1 }}>revo</span>
            </div>
            <div style={{ height: 24, background: "#E3C56A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-jost)", fontWeight: 500, fontSize: 13, color: "#16140F", letterSpacing: 0.5 }}>fit</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 23, color: "var(--text)", margin: "0 0 12px", fontWeight: 300, letterSpacing: "0.02em" }}>{d.ttl}</p>
        <p style={{ fontSize: 13, color: "var(--text-sub)", margin: "0 0 40px", lineHeight: 1.9, fontWeight: 300 }}>{d.sub}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, margin: "0 0 22px" }}>
          <button
            onClick={() => setDevice("ios")}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 2px", color: device === "ios" ? "var(--text)" : "var(--text-muted)", fontWeight: device === "ios" ? 500 : 400 }}
          >
            iPhone
          </button>
          <span style={{ width: 0.5, height: 14, background: "var(--border-strong)" }} />
          <button
            onClick={() => setDevice("android")}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 2px", color: device === "android" ? "var(--text)" : "var(--text-muted)", fontWeight: device === "android" ? 500 : 400 }}
          >
            Android
          </button>
        </div>

        <div style={{ textAlign: "left", margin: "0 0 40px" }}>
          {steps.map((s, i) => (
            <div key={s[0]} style={{ padding: "16px 2px", borderBottom: i < steps.length - 1 ? "0.5px solid var(--border)" : "none" }}>
              <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: "0 0 4px", fontWeight: 500 }}>{s[0]}</p>
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0, fontWeight: 300, lineHeight: 1.5 }}>{s[1]}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto" }}>
          <button className="rf-btn-primary" style={{ marginBottom: 16 }} onClick={proceed}>
            {d.got}
          </button>
          <button style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }} onClick={proceed}>
            {d.later}
          </button>
        </div>
      </div>

      {ToastView}
    </div>
  );
}
