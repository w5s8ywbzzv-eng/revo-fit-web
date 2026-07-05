# revo fit — セットアップ手順（あなたが行う作業）

このプロジェクトは、Windows のみで完結する「PWA（Next.js + Supabase + Stripe）」方針（ROADMAP §8）に沿って作られています。コードは書けていますが、以下はアカウントが必要なため、あなた自身が行う必要があります（ROADMAP §1 の役割分担どおり）。

## 0. まずローカルで動かす

このプロジェクトはこのセッションのサンドボックス内では `npm install` できませんでした（レジストリへのネットワークアクセスがブロックされていたため）。あなたの Windows PC 上で実行してください。

```bash
cd revo-fit-web
npm install
npm run dev
```

`http://localhost:3000` を開くと、splash → welcome → signup/login → addhome → onboarding → goal-setup → home の画面遷移を確認できます（バックエンド未接続でも画面は動きます）。

## 1. GitHub リポジトリ

1. GitHub で空のリポジトリを作成
2. このフォルダを push：
   ```bash
   git init
   git add .
   git commit -m "revo fit: PWA foundation scaffold"
   git remote add origin <あなたのリポジトリURL>
   git push -u origin main
   ```

## 2. Supabase プロジェクト作成

1. https://supabase.com でプロジェクトを作成（無料枠でOK）
2. Project Settings → API から `Project URL` と `anon public key` を取得
3. `.env.example` を `.env.local` にコピーし、値を貼り付け：
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Supabase ダッシュボード → SQL Editor で `supabase/schema.sql` の中身を貼り付けて実行
   - これで `profiles` / `user_goals` / `body_metrics` / `daily_scores` / `subscriptions` の5テーブルと、RLS（自分のデータしか見えない制御）、新規登録時に自動でプロフィール行を作るトリガーができます。
   - ⚠️ これは基盤のみです。README にあった「25テーブル」の残り（meals / training_logs / ranking など）は、該当する画面を実装するタイミングで追加してください。
5. Authentication → Providers で Google / Apple ログインを有効化（任意・あとからでも可）

## 3. Vercel へデプロイ

1. https://vercel.com でこの GitHub リポジトリをインポート
2. 環境変数（Vercel の Project Settings → Environment Variables）に `.env.local` と同じ値を設定
3. デプロイ後に発行される URL を `.env.local` / Vercel の `NEXT_PUBLIC_SITE_URL` に設定
4. Vercel は標準で HTTPS なので、PWA（Service Worker・ホーム画面追加）はそのまま動きます

## 4. Stripe（課金・あとの段階）

まだ課金画面（plans/cross_confirm/billing/receipt）は未実装です。実装時に：
1. https://dashboard.stripe.com でアカウント作成
2. Developers → API keys から publishable key / secret key を取得し `.env.local` に設定
3. Webhook（Developers → Webhooks）を追加し、署名シークレットを `STRIPE_WEBHOOK_SECRET` に設定
4. サブスク商品（無料/¥580/¥1,200/横断¥1,960）を Stripe Products で作成

## 5. コスト暴走防止（ROADMAP §10・必ず設定）

- Vercel: Settings → Usage → Spend Management で上限・アラートを設定
- Supabase: Settings → Billing で使用量アラートを設定
- Stripe: Radar を有効化

## 今のところ実装済み / 未実装

実装済み（このリポジトリに含まれる）:
- splash / welcome / signup / login / addhome / onboarding / goal-setup / home の8画面
- ダーク/ライトテーマ切替、14言語の言語切替（UIの土台と該当8画面分の翻訳）
- PWA 化（manifest.json・Service Worker・アイコン一式）
- Supabase 連携の土台（未設定でも画面は壊れず、設定後に自動で有効化される作り）
- 認証まわりの土台（signup/login は Supabase Auth の email/password に接続済み。Google/Apple ボタンは Supabase 側のプロバイダ設定後に配線が必要）

未実装（次にやること・ROADMAP のフェーズ2以降）:
- 残り39画面（log, nutrition, recipes, feed, ranking, medals, plans/billing/receipt など）
- 決済（Stripe）
- 実データ連携（home の `useHomeSummary()` は今 `null` を返すダミー実装 — daily_scores テーブルから読むように差し替える）
- 12言語の home 画面「エンプティステート文言」は現状 en のフォールバックです（ja/en のみ本文言。ローンチ前に翻訳を追加してください）
