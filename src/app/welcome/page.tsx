"use client";

import Link from "next/link";
import { HeaderControls } from "@/components/HeaderControls";
import { Wordmark } from "@/components/Logo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/dictionary";
import { welcomeDict } from "@/lib/i18n/dictionaries/welcome";

export default function WelcomePage() {
  const { locale } = useLocale();
  const d = pick(welcomeDict, locale);

  return (
    <div className="rf-screen">
      <h1 className="rf-visually-hidden">
        revo へようこそ、という入口の画面。金色に淡く輝く revo fit のアイコン、その下に revo in your life というタグラインと世界観のひとこと。始めるボタンと、すでにアカウントがある人向けのログイン。
      </h1>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 18px" }}>
        <HeaderControls />
      </div>

      <div style={{ padding: "20px 34px 44px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "52px 0 40px" }}>
          <Wordmark size={54} />
        </div>

        <p style={{ fontFamily: "var(--font-jost)", fontWeight: 300, fontSize: 19, color: "var(--accent)", margin: "0 0 18px", letterSpacing: "0.06em" }}>{d.tag}</p>

        <p style={{ fontSize: 15, color: "var(--text)", margin: "0 0 10px", fontWeight: 300, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: d.lead }} />
        <p style={{ fontSize: 12, color: "var(--text-sub)", margin: "0 0 46px", fontWeight: 300, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: d.sub }} />

        <div style={{ marginTop: "auto" }}>
          <Link href="/signup" className="rf-btn-primary" style={{ marginBottom: 14, textDecoration: "none" }}>
            {d.start}
          </Link>
          <Link href="/login" className="rf-btn-outline" style={{ textDecoration: "none" }}>
            {d.login}
          </Link>
          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "26px 0 0", lineHeight: 1.7, fontWeight: 300 }}>{d.tos}</p>
        </div>
      </div>
    </div>
  );
}
