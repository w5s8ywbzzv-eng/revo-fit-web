"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconBrandGoogle, IconBrandApple, IconMail, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { HeaderControls } from "@/components/HeaderControls";
import { Wordmark } from "@/components/Logo";
import { useToast } from "@/components/useToast";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { loginDict } from "@/lib/i18n/dictionaries/login";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { locale } = useLocale();
  const d = pick(loginDict, locale);
  const { show, ToastView } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      show("Supabase 未設定です（.env.local を設定してください）");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      show(error.message);
      return;
    }
    show(d.toast);
    router.push("/home");
  }

  async function handleForgot() {
    const supabase = getSupabaseClient();
    if (!supabase || !email) {
      show(d.forgotToast);
      return;
    }
    await supabase.auth.resetPasswordForEmail(email);
    show(d.forgotToast);
  }

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">revo にログインする画面。Google や Apple、またはメールアドレスとパスワードでログインできる。</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        <button className="rf-icon-btn" style={{ background: "transparent", border: "none" }} aria-label="戻る" onClick={() => router.back()}>
          <IconArrowLeft size={20} color="var(--text-sub)" />
        </button>
        <HeaderControls />
      </div>

      <div style={{ padding: "12px 30px 40px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 24px" }}>
          <Wordmark size={30} />
        </div>

        <p style={{ fontSize: 21, color: "var(--text)", margin: "0 0 6px", fontWeight: 400, textAlign: "center" }}>{d.ttl}</p>
        <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "0 0 28px", textAlign: "center", fontWeight: 300 }}>{d.ttlSub}</p>

        <button className="rf-btn-social google" style={{ marginBottom: 11 }} onClick={() => show("Google")}>
          <IconBrandGoogle size={17} color="#E3C56A" />
          {d.google}
        </button>
        <button className="rf-btn-social apple" style={{ marginBottom: 20 }} onClick={() => show("Apple")}>
          <IconBrandApple size={17} />
          {d.apple}
        </button>

        <div className="rf-divider-row" style={{ marginBottom: 20 }}>
          <div className="rf-divider-line" />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.or}</span>
          <div className="rf-divider-line" />
        </div>

        <label className="rf-field-label">{d.email}</label>
        <div className="rf-field" style={{ marginBottom: 15 }}>
          <IconMail size={16} color="var(--text-muted)" />
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 6px" }}>
          <label className="rf-field-label" style={{ margin: 0 }}>
            {d.pw}
          </label>
          <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500, cursor: "pointer" }} onClick={handleForgot}>
            {d.forgot}
          </span>
        </div>
        <div className="rf-field" style={{ marginBottom: 24 }}>
          <IconLock size={16} color="var(--text-muted)" />
          <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPw((v) => !v)} aria-label="パスワードを表示">
            {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>

        <button className="rf-btn-primary" style={{ marginBottom: 22 }} onClick={handleSubmit} disabled={submitting}>
          {d.submit}
        </button>

        <p style={{ fontSize: 12, color: "var(--text-sub)", textAlign: "center", margin: 0, fontWeight: 300 }}>
          {d.toSignup}
          <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 500 }}>
            {d.signup}
          </Link>
        </p>
      </div>

      {ToastView}
    </div>
  );
}
