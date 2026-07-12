# revo fit — 実装版 PWA（ローカル保存・コア導線 完全動作）

`screens/` のHTMLモックを**1pxも変えず**そのまま活かし、遷移・データ保存・スコア計算・PWA化を組み込んだ実装です。
データ層は localStorage（Supabase の代替）。**Supabase / Stripe のキーが用意でき次第、`js/revo.js` の公開APIを差し替えるだけで移行できる**構造にしています。

## 動かし方

- そのまま：`index.html` をブラウザで開く（ローカル保存・全機能動作）。
- 推奨（PWA要件＝ホーム追加・Service Worker には HTTP 配信が必要）：
  ```
  cd revo-fit-app
  python -m http.server 8000   # または任意の静的サーバ
  → http://localhost:8000/
  ```
- Vercel へのデプロイ：このフォルダをそのまま静的サイトとしてデプロイ（HTTPSは標準）。

## 実装済み（docs 準拠）

1. **起動フロー（docs/01）**
   splash →（自動）welcome → signup/login →（擬似メール認証）→ onboarding（言語・国）→ goal_setup → sns_profile → notif_permission → addhome → home。
   既存ユーザー（profile.onboarded=true）は splash から home へ直行。各画面の入力は profile に保存。
2. **記録 → ホーム反映（docs/02・03）**
   log の6セクション（body/sleep/move/food/water/condition）が実データで動作。「記録する」で daily_log を upsert →
   4要素スコア＋総合（睡眠25/食事30/運動25/回復20 の加重平均）を再計算 → home のリング・ゲージに反映（既存アニメがそのまま増減を表現）。
   体組成はスコアに直結させず前日比表示のみ（docs/02 の思想どおり）。
3. **エンプティステート（ROADMAP 13章）**
   新規ユーザーはリング「--」・ゲージ空・「最初の記録をつけてみましょう」（14言語）。サンプル数値の焼き込みは撤去済み。
   記録済み要素のみで暫定総合を表示（docs/02 §6）。
4. **テーマカラー5色（docs/04）**
   sns_profile の5色選択が全画面のアクセントに連動（CSS値はモックのまま。既定 groove は完全無変換）。明暗テーマ・言語（14言語）も全画面で共有・永続化。
5. **課金導線（README §4 の遷移）**
   plans「横断を選ぶ」→ cross_confirm → 完了 → score_total ／ billing「領収書」→ receipt ／ billing「横断にする」→ cross_confirm。
   価格は全画面 ¥1,960/月・¥19,600/年 のまま（未変更）。契約はローカル保存（Stripe接続まではプレビュー）。
6. **PWA**：manifest / Service Worker（オフラインキャッシュ）/ アイコン / iOS用メタタグ。
7. **設定**：プラン・契約・法務（規約/プライバシー/特商法）・お問い合わせへの遷移、ログアウト。
8. **分析系の実データ化（2026-07-09 追加）**：
   - analysis：週次総挙上量（12週チャート）・部位バランス・自己ベスト履歴をローカル記録から算出。
   - forecast：体重の7日移動平均トレンド（直近14日の線形回帰）から30日後の3シナリオを描画。目標は goal_setup の値。
   - medals：連続記録・朝/夜/週末の実績から獲得判定（SNS系・停滞期突破はデータ層接続後に判定）。
   - muscle_calendar：今週・当月・部位ごとの経過日数を運動記録から生成。
   - いずれもデータ不足時はエンプティステート（ROADMAP 13章文言・14言語、js/revo.js の EMPTY2。要レビュー）。

## 画面一覧

- コア導線（完全動作）：splash / welcome / signup / login / onboarding / goal_setup / sns_profile / notif_permission / addhome / home / log / plans / cross_confirm / billing / score_total / receipt / settings
- プレビュー同梱（遷移・テーマ・言語は共有済み、**中身はサンプルデータのまま**）：
  navigator / forecast / medals / analysis / notif_settings / legal_* / support / contact /
  feed / ranking / ranking_post / ranking_shop / training_post / recipes / recipe_detail / recipe_post / recipe_awards /
  creator_profile / creator_dashboard / muscle_map / muscle_calendar / workout_detail / nutrition / mysupp / mypillow /
  pillow_ranking / plan_builder / bgm / bgm_control / bgm_picker / pwa_install
  ※ 全56画面を収録。SNS・レシピ等の投稿はUI遷移のみ（データ層はSupabase接続時）。
  ※ feed・ranking・recipes・muscle_map・muscle_calendar・nutrition・mysupp・mypillow・BGM への入口は、
    **navigator（次の一手）末尾の機能メニュー**に追加済み（オーナー承認済み・2026-07-09）。
    様式は同ページ「余裕があれば、こちらも」のカードを踏襲し、ラベルは各画面の14言語辞書から抽出した既存コピーのみ使用。
    home 自体は無改変（home 下タブ「次の一手」→ navigator 経由で全機能に到達）。
  ※ BGM 3画面は埋め込みbase64音源を assets/audio/City_Pulse.mp3 への参照に置換（挙動不変・14MB削減）。初期はBGMオフ・自動再生なし（ROADMAP 13章）。

## デザインについて（重要）

モックの見た目・文言・アニメーションは無変更。実装上やむを得ず加えた差分は以下の3点のみです。

1. **スマホ幅（≤440px）でプレビュー枠を外して全画面表示**にするCSSを追加（PC幅ではモックと同一のベージュ枠で表示）。
2. **エンプティステート・動的コピーの文言を追加**（ROADMAP 13章・docs/02 §6 が要求する新規文言。14言語で `js/revo.js` の `EMPTY` に定義。要レビュー）。
3. **log の入力可能化**：食事の品名/kcal・PFC・水分内訳・種目の追加編集に、同ページ body セクションと同じ「破線下線の直接入力」様式を流用（モックに入力UIが無かった箇所）。

⚠️ **アプリアイコンは暫定**です（Jost がサンドボックスに無いため Poppins で生成。ROADMAP フェーズ5「確定版アセット」で差し替えてください）。

## Supabase 接続層（実装済み・2026-07-09）

- `js/config.js` に SUPABASE_URL / ANON_KEY を設定するだけでクラウド同期が有効化（**未設定なら完全にローカル動作のまま**）。
- 実装：`js/revo-cloud.js`（認証=メールMagic Link/Google/Apple、profile・daily_log・daily_score の双方向同期、
  オフライン再送キュー、アバターのStorageアップロード）。画面側のコードは無変更（REVO.* をラップ）。
- 手順は **`SETUP_SUPABASE.md`** 参照。⚠ 実プロジェクトでの動作検証はキー設定後に必ず実施（チェックリスト同梱）。

## SNSデータ層（実装済み・2026-07-09）

- **投稿**：training_post / recipe_post の「投稿する」が実保存（ローカル即時＋ログイン時はクラウド同期）。
  training_post の「きょうの記録」カードも実データ化（サンプル焼き込み撤去）。
- **feed**：実投稿をモックと同一のカード様式で表示。応援ボタンで加算（cheers テーブル＋DBトリガで集計）。
  実投稿がある場合はサンプル投稿を出さない。本番（クラウド有効）で投稿ゼロなら
  「フォローすると、仲間の記録が届きます」のエンプティステート（ROADMAP 13章）。
  ローカルプレビュー（キー未設定）ではモックのサンプル表示を維持。
- **スキーマ**：posts / cheers / follows（RLS：読み＝公開、書き＝本人のみ）＋応援数集計トリガ。
  → **supabase/schema.sql を再実行してください**（何度でも安全）。
- **投稿写真（2026-07-09 追加）**：training_post（複数枚・80px枠）/ recipe_post（1枚・大枠）で実ファイル選択→縮小。
  ログイン時は Storage バケット `posts` へアップロードし公開URLに差し替え（未作成時は縮小dataURLのまま動作）。
- **フォロー（2026-07-09 追加）**：feedカードの「フォロー」が follows テーブルと連動（ON/OFF・✓表示）。
- 未実装（次フェーズ）：フォロー中での絞り込み表示、返信、ランキング集計。
- ローンチ前の最終確認は **LAUNCH_CHECKLIST.md**（ROADMAP 9〜13章準拠）。

## AI食事推定の課金設計（2026-07-09 確定）

- **内蔵辞書（136品目）＝全プラン無料**（間口を狭めない原則）。
- **AI推定（✨チップ）＝スタンダード（¥1,200）/ 横断（¥1,960）の特典**。
  - サーバ側（api/food.js）で subscriptions を確認し、未加入は 402 で拒否（コスト保護・改ざん不可）。
  - 未加入者にもチップは表示し、タップで plans へ誘導（既存の「スタンダードで解放」導線と整合）。
  - 推定結果は food_cache に共有キャッシュ（同じ料理名は世界で1回だけAI課金）。

## 写真でかんたん＝写真AI解析（実装済み・スタンダード特典）

- 記録画面の「写真でかんたん」で写真を選ぶと、AIが料理を認識し**品目・カロリーを自動入力**（api/food-photo.js）。
- 自動入力後は編集状態で表示＝ユーザーが確認・修正してから確定（「目安」の思想と整合）。
- スタンダード/横断のみ（サーバ側で subscriptions 検証・402）。未加入者はタップで plans へ。
- コスト制御：画像はクライアントで512pxに縮小・サーバ側でサイズ上限検証・トークン上限。
- クラウド未接続時は従来どおり写真添付＋手入力で動作。

## Stripe 課金（実装済み・2026-07-09）

- `api/checkout.js`（金額はサーバ側Price決定・JWT検証・冪等キー）／`api/webhook.js`（署名検証→subscriptions upsert）／
  `api/portal.js`（解約・支払い方法変更のカスタマーポータル）。
- フロント：plans / cross_confirm はログイン済み＋デプロイ済み環境では Stripe Checkout に接続。
  未設定環境では従来どおりローカル保存（プレビュー）で安全に動作。billing の解約ボタン → ポータル。
- 手順は **`SETUP_STRIPE.md`**（Vercelデプロイ → Price作成 → Webhook → 環境変数）。
- ⚠ 実Stripeアカウントでの動作検証は未実施。テストモードで SETUP_STRIPE.md §6 を必ず確認。

## Supabase / Stripe への移行

- `supabase/schema.sql` … docs/01・02・03 準拠のスキーマ＋RLS。Supabase の SQL Editor に貼るだけ。
- 差し替えポイントは `js/revo.js` の公開API（profile / getLog / saveLog / auth）。画面側は REVO.* しか呼ばないため、Supabase クライアント実装に置き換えれば全画面が切り替わります。
- 決済：plans / cross_confirm の `REVO.setSub(...)` 箇所を Stripe Checkout 呼び出しに差し替え（金額・プランは必ずサーバ側で決定。ROADMAP 9章）。

## 既知の制限

- 認証は擬似（メール送信・マジックリンクは未接続。Supabase Auth 接続時に置換）。
- BMR は性別未取得のため簡易推定（体脂肪率があれば Katch-McArdle、なければ 22×体重）。要調整。
- スコア式は docs/02 の初期版。運用で調整する前提の実装です。
- iOS の通知は「ホーム画面に追加」後のみ（ROADMAP 12章のとおり）。
