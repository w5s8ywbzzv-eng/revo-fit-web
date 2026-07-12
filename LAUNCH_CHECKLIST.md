# revo fit — ローンチ前チェックリスト（ROADMAP 9〜13章準拠）

## A. インフラ・キー
- [ ] Supabase：schema.sql 適用済み（10テーブル：profile / daily_log / daily_score / workout_set / meal_entry / water_intake / subscriptions / posts / cheers / follows）
- [ ] Supabase：Spend Cap ON（10章）
- [ ] Storage：avatars / posts バケット（Public＋authenticatedアップロード）
- [ ] Vercel：デプロイ済み・Spend Management 設定（10章）
- [ ] Stripe：テストモードで SETUP_STRIPE.md §6 全通過 → 本番キー切替
- [ ] service_role キーが Vercel 環境変数**のみ**にある（フロント・Git・チャットに無い）

## B. セキュリティ（9章）
- [ ] selftest.html 全項目 ✔（RLS：未ログイン書込拒否を含む）
- [ ] 別アカウント同士でデータが見えない（daily_log等）／posts は公開読みのみ
- [ ] Webhook 署名検証が効いている（不正リクエストで400）
- [ ] Stripe Radar 有効
- [ ] 公開前に selftest.html を削除（開発用ページ）

## C. 課金の誠実さ（README 設計思想）
- [ ] 価格表示：全画面 ¥1,960/月・¥19,600/年 で一致（plans / cross_confirm / billing / receipt）
- [ ] 解約導線：billing → カスタマーポータルが開く
- [ ] 14日返金の運用手順を決めた（手動Refund／2年目以降は対象外。弁護士確認）
- [ ] 無料・¥580 の入口が残っている

## D. 初期体験（13章）
- [ ] まっさらな新規アカウントで全画面を開き、サンプル数値の残りが無い
- [ ] home：リング「--」→ 初記録 → スコア点灯 の流れが気持ちよい
- [ ] feed：投稿ゼロで「フォローすると、仲間の記録が届きます」
- [ ] BGM：初期オフ・自動再生なし
- [ ] 14言語×ライト/ダーク×5色でレイアウト崩れなし（最低：日英・両テーマ）

## E. PWA（8・12章）
- [ ] iPhone Safari：共有→ホーム画面に追加 → スタンドアロン起動
- [ ] ホーム追加後に通知許可（notif_permission から。順序が重要）
- [ ] オフラインで起動・記録→復帰後に同期（cloudQueue が空になる）

## F. 法務・運用（11章）
- [ ] legal_terms / legal_privacy / legal_tokusho を実際の会社情報に差し替え
- [ ] 医療・栄養の免責注記が残っている（消していない）
- [ ] エラー監視（Sentry等）・Supabaseバックアップ設定
- [ ] 小さくローンチ → 様子を見て拡大
