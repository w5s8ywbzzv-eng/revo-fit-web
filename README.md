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
| `/log` | revo_fit_log_black.html | 完了（からだ＝体重・体脂肪・筋肉量は Supabase `body_metrics` に読み書き。睡眠・食事・運動・水分・コンディションは操作できるが保存先未実装 — 下記参照） |

残り38画面（nutrition, recipes, feed, ranking, medals, plans/billing/receipt, settings, legal, admin 8画面など）は未実装です。SCREENS.md の優先順（splash → onboarding → home → log → …）に沿って続けてください。

### `/log` 画面の既知の制限

- 「からだ」カテゴリだけが本物のデータ連携です（`body_metrics` テーブルに保存・直前の値を自動で読み込み）。
- 睡眠・食事・運動・水分・コンディションは見た目も操作もフル実装済みですが、まだ専用の保存先テーブルがないため、「記録する」を押しても今のセッション内でチェック済み表示になるだけです。次にやること：`daily_logs` 相当のテーブルを設計して保存を繋ぐ。
- 食事の「写真でかんたん」「書いて記録」ボタンは、実際の撮影・入力UIがまだ無いので「準備中」のトーストが出るだけです。

## ディレクトリ構成

```
src/
  app/                 各画面（Next.js App Router）
  components/          共有UI（Logo, HeaderControls, BottomNav,