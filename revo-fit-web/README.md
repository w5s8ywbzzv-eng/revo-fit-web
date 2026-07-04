# revo fit — web (Next.js PWA)

`revo_handoff/` の UIモックアップ（47画面）を、実際に動く Next.js アプリに実装していくプロジェクトの土台です。ROADMAP §8 の方針転換（ネイティブ申請ではなく PWA を本命にする）に沿っています。

## 技術構成

- Next.js 14（App Router）+ TypeScript
- Supabase（認証・DB） — `src/lib/supabase/client.ts`
- Stripe（Web課金） — 未実装（billing 画面実装時に接続）
- PWA — `public/manifest.json` + `public/sw.js`
- 14言語 i18n — `src/lib/i18n/`（自前の軽量実装。次から次へ画面を増やしやすいよう、画面ごとに辞書ファイルを分割）

## セットアップ

初回セットアップ（Supabase/Stripe/Vercel/GitHub）は **[SETUP.md](./SETUP.md)** を参照してください。

```bash
npm install
npm run dev
```

## 実装済みの画面

| ルート | モック元 | 状態 |
|---|---|---|
| `/` | revo_fit_splash_black.html | ロゴアニメーション→自動遷移 |
| `/welcome` | revo_fit_welcome_black.html | 完了 |
| `/signup` | revo_fit_signup_black.html | 完了（Supabase Auth 接続済み） |
| `/login` | revo_fit_login_black.html | 完了（Supabase Auth 接続済み） |
| `/addhome` | revo_fit_addhome_black.html | 完了 |
| `/onboarding` | revo_fit_onboarding_black.html | 完了 |
| `/goal-setup` | revo_fit_goal_setup_black.html | 完了 |
| `/home` | revo_fit_home_black.html | 完了（空データ時のエンプティステート実装、ROADMAP §13） |

残り39画面（log, nutrition, recipes, feed, ranking, medals, plans/billing/receipt, settings, legal, admin 8画面など）は未実装です。SCREENS.md の優先順（splash → onboarding → home → …）に沿って続けてください。

## ディレクトリ構成

```
src/
  app/                 各画面（Next.js App Router）
  components/          共有UI（Logo, HeaderControls, BottomNav, useToast）
  lib/
    theme/             ダーク/ライトテーマの Context
    i18n/              14言語の辞書・Context（画面ごとにファイル分割）
    supabase/          Supabase クライアント（未設定でも壊れない作り）
supabase/
  schema.sql           DB基盤（profiles/user_goals/body_metrics/daily_scores/subscriptions + RLS）
public/
  manifest.json, sw.js, icons/   PWA一式
```

## 設計上守っていること（revo_handoff/README.md より）

- ブランドカラー：黒 `#16140F` × 金 `#E3C56A`。ライトテーマも全画面対応。
- 新規ユーザーはゼロ状態（サンプル数値を出さない）— `home` 画面で実装済み。他の画面を実装する際も同じ方針を守ってください。
- 医療・法務の免責注記は削除しない。
- 価格・世界観（revo world は「?・構想中」で名前を伏せる等）は課金画面実装時に revo_handoff/README.md を再確認。
