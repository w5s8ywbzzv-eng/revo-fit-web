# Stripe 課金セットアップ（Web直課金・ROADMAP 8/9章準拠）

コード（`api/checkout.js` / `api/webhook.js` / `api/portal.js`）は実装済み。
**Vercel デプロイ＋下記設定で課金が有効**になります。未設定の間は、プラン選択はローカル保存（プレビュー）のまま安全に動作します。

> ⚠️ まず **テストモード**（sk_test_）で全フローを確認してから本番キーへ。

## 1. Vercel デプロイ（先にこちら）
1. `revo-fit-app` フォルダを GitHub リポジトリに push
2. https://vercel.com → Add New → Project → リポジトリを Import
   - Framework Preset: **Other**（静的＋`api/`のサーバレス関数が自動認識されます）
3. デプロイ後のURL（例 `https://revo-fit.vercel.app`）を控える
4. **Settings → Spend Management で支出上限を設定**（ROADMAP 10章）
5. Supabase 側: Authentication → URL Configuration に本番URLを追加

## 2. Stripe 商品・価格の作成
Stripe ダッシュボード → Products で6つの Price を作成（**通貨JPY・継続（サブスクリプション）**）：

| Product | Price | 種別 |
|---|---|---|
| revo fit ベーシック | ¥580 | 月次 |
| revo fit ベーシック | ¥5,800 | 年次 |
| revo fit スタンダード | ¥1,200 | 月次 |
| revo fit スタンダード | ¥12,000 | 年次 |
| revo 横断（fit+life） | **¥1,960** | 月次 |
| revo 横断（fit+life） | **¥19,600** | 年次 |

※ 横断価格は全画面の表示と一致させること（README「価格の整合」）。
各 Price の ID（`price_...`）を控える。

## 3. Webhook の登録
1. Developers → Webhooks → Add endpoint
2. URL: `https://あなたのURL/api/webhook`
3. イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Signing secret（`whsec_...`）を控える

## 4. 環境変数（Vercel → Settings → Environment Variables）
`.env.example` の項目をすべて設定：
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `PRICE_BASIC_MONTH` 〜 `PRICE_CROSS_YEAR`（手順2のID）
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / **`SUPABASE_SERVICE_ROLE_KEY`**（Webhookの書込用。サーバ専用！）
- `APP_URL`
設定後、Redeploy。

## 5. Supabase 側
- `supabase/schema.sql` を再実行（subscriptions テーブルが追加されます。何度でも実行可）

## 6. テスト（本番キーに切り替える前に必ず）
- [ ] ログイン済み状態で plans から スタンダード を選択 → Stripe Checkout が開く
- [ ] テストカード `4242 4242 4242 4242`（未来の日付/任意CVC）で決済
- [ ] score_total / plans に戻る（success/cancel URL）
- [ ] Supabase の subscriptions に行ができている（plan/cycle/status=active）
- [ ] cross_confirm から横断（¥1,960）も同様に確認
- [ ] billing の解約 → Stripe カスタマーポータルが開く → 解約 → subscriptions の status 更新
- [ ] Stripe ダッシュボード → Radar が有効（不正検知・ROADMAP 9章）

## セキュリティ実装済み（ROADMAP 9章）
- 金額・プランはサーバ側 Price ID で決定（クライアント値は不使用）
- Checkout は Supabase JWT 検証済みユーザーのみ／冪等性キーで二重課金防止
- Webhook は署名検証。subscriptions への書込は service_role のみ（クライアント書込ポリシー無し）

## 14日間全額返金（新規購入のみ・README確定仕様）
- v1 は **手動運用**：申請 → Stripe ダッシュボードから Refund（更新2年目以降は適用しない）
- 自動化（返金API＋購入日判定）は次フェーズ。※日数・各国消費者保護法は要・弁護士確認（README注記どおり）
