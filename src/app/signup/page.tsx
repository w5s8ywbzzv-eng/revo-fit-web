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
import { signupDict } from "@/lib/i18n/dictionaries/signup";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const { locale } = useLocale();
  const d = pick(signupDict, locale);
  const { show, ToastView } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      show(d.pwHint);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Supabase not configured yet — see .env.example / SETUP.md.
      show("Supabase 未設定です（.env.local を設定してください）");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) {
      show(error.message);
      return;
    }
    show(d.toast);
    router.push("/addhome");
  }

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">revo のアカウントを作成する画面。Google や Apple で素早く登録するか、メールアドレスとパスワードで登録できる。</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        <button className="rf-icon-btn" style={{ background: "transparent", border: "none" }} aria-label="戻る" onClick={() => router.back()}>
          <IconArrowLeft size={20} color="var(--text-sub)" />
        </button>
        <HeaderControls />
      </div>

      <div style={{ padding: "12px 30px 40px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 22px" }}>
          <Wordmark size={28} />
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

        <label className="rf-field-label">{d.pw}</label>
        <div className="rf-field" style={{ marginBottom: 8 }}>
          <IconLock size={16} color="var(--text-muted)" />
          <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPw((v) => !v)} aria-label="パスワードを表示">
            {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 22px", fontWeight: 300 }}>{d.pwHint}</p>

        <button className="rf-btn-primary" style={{ marginBottom: 20 }} onClick={handleSubmit} disabled={submitting}>
          {d.submit}
        </button>

        <p style={{ fontSize: 12, color: "var(--text-sub)", textAlign: "center", margin: "0 0 20px", fontWeight: 300 }}>
          {d.toLogin}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>
            {d.login}
          </Link>
        </p>

        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.7, fontWeight: 300 }}>{d.tos}</p>
      </div>

      {ToastView}
    </div>
  );
}
