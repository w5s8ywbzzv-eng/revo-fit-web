# Supabase 接続手順（revo fit ローカル版 → クラウド同期）

接続層（`js/revo-cloud.js`）は実装済みです。**下記の設定だけでクラウド同期が有効**になります。
キー未設定の間は完全にローカル保存で動作します（現在の状態）。

> ⚠️ この接続層は実プロジェクト未検証です（キー取得前に実装したため）。
> 設定後、必ず「動作確認チェックリスト」を全項目確認してください。

## 1. プロジェクト作成
1. https://supabase.com → New project（リージョンは Tokyo 推奨）
2. **Spend Cap が ON（既定）であることを確認**（ROADMAP 10章：課金の暴走防止）

## 2. スキーマ適用
1. ダッシュボード → SQL Editor
2. `supabase/schema.sql` の中身を貼り付けて Run
   （profile / daily_log / daily_score ほか＋RLS。全テーブル本人のみアクセス可）

## 3. 認証の設定
- Authentication → Providers:
  - **Email**: ON（Magic Link / OTP。パスワードレス＝docs/01の設計どおり）
  - Google / Apple: 使う場合は各社のOAuth設定を投入（後回しでも可。ボタンは未設定なら無反応になるだけ）
- Authentication → URL Configuration:
  - Site URL と Redirect URLs に **デプロイ先のURL**（例 `https://xxx.vercel.app/index.html`）を追加
  - ローカル確認するなら `http://localhost:8000/index.html` も追加

## 4. Storage バケット（任意・推奨）
**SQL Editor で `supabase/storage.sql` を全文実行するだけ**（avatars / posts バケット＋本人のみ書込のポリシーを一括作成。何度でも実行可）。
手作業でやる場合は Storage → New bucket（Public）×2 ＋ authenticated アップロード許可。
（未作成でもアプリは動作します。画像が縮小dataURLのままDB/ローカルに保存されるだけ）

## 5. キーの設定 【✅ 設定済み（2026-07-09）】
`js/config.js` を編集：
```js
window.REVO_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."   // Project Settings → API → anon public
};
```
- anon key はフロント公開前提のキーです（RLSで保護）。**service_role キーは絶対に書かない**。

## 6. デプロイ（Vercel）
1. このフォルダをGitHubへ push → Vercel で Import（Framework: Other / 静的サイト）
2. HTTPSは自動。**Spend Management（支出上限）を設定**（ROADMAP 10章）
3. デプロイURLを手順3の Redirect URLs に追加

## 同期の仕組み（実装仕様）
- 画面側は `REVO.*` のみ使用。`revo-cloud.js` が `saveProfile` / `saveLog` / `setAuth` をラップ。
- **書き込み**: ローカル保存→即時、クラウドへは再送キュー（`revo.cloudQueue`）経由。オフラインでも失われない。
- **読み込み**: ログイン時に profile＋直近90日の daily_log/daily_score を取得し、
  `updated_at` の新しい方を採用（新しいローカルは逆にクラウドへ送信）。初回同期時のみ画面を再読込。
- **認証**: メール→ Magic Link（`signInWithOtp`）。リンククリックで `index.html` に戻り、セッション確立後に通常分岐。
- daily_log は正規化カラム＋ `payload jsonb`（明細の完全復元用）の二重書き。
  子テーブル（workout_set / meal_entry / water_intake）への正規化展開は第2段階（サーバ側トリガ推奨）。

## 動作確認（自動テストページ）
**`selftest.html` をブラウザで開くと下記チェックリストを自動実行します**（要ローカルサーバ or デプロイ先）。
- 手順2（schema.sql）が未実行なら「4. スキーマ適用」が✘になり、案内が表示されます。
- メール認証テストの前に、手順3の Redirect URLs に selftest.html のURLを追加してください。

## 動作確認チェックリスト（キー設定後に必ず）
- [ ] 新規メールでサインアップ → 確認メールが届く → リンクで戻れる
- [ ] オンボーディング完了 → Supabase の profile テーブルに行ができている
- [ ] 記録を保存 → daily_log / daily_score に行ができている（payload に明細）
- [ ] 別ブラウザで同アカウントにログイン → プロフィール・記録が復元される
- [ ] 機内モードで記録 → 復帰後に自動送信される（cloudQueue が空になる）
- [ ] 他人のデータが見えないこと（別アカウントで確認＝RLS）
- [ ] ログアウト → welcome に戻る

## 次のフェーズ（未実装）
- Stripe 課金（plans/cross_confirm の `REVO.setSub` を Checkout に差し替え。金額はサーバ側決定・Webhook署名検証：ROADMAP 9章）
- SNS投稿・フォロー・ランキングのデータ層
- daily_log 明細の正規化トリガ／Realtime購読
