"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/Logo";

/**
 * Splash screen ("revo_fit_splash_black.html" in the mockups).
 *
 * Design note: the original mockup also duplicated a full social/email login
 * form on this screen (same as welcome.html). We consolidate that into a
 * single entry point — this screen is purely the branded loading moment,
 * and /welcome owns the "get started / log in" choice — so there's one
 * source of truth for the entry flow instead of two nearly-identical ones.
 */
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/welcome");
    }, 2200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="rf-screen" style={{ alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div className="rf-anim-fadeup rf-anim-glow">
        <AppIcon size={112} />
      </div>
      <p style={{ fontSize: 14, color: "var(--text-sub)", margin: 0, textAlign: "center", letterSpacing: "0.08em", fontWeight: 300 }}>revo in your life</p>
      <div style={{ width: 140, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#C9A24E,#E3C56A)", borderRadius: 2, animation: "rfBar 1.8s cubic-bezier(0.5,0,0.2,1) 0.2s both" }} />
      </div>
    </div>
  );
}
