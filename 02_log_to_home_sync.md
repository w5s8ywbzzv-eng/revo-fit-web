# revo fit — 起動フロー（オンボーディング導線）設計書

**目的**：アプリ初回起動〜ホーム到達までの画面遷移を定義する。現状のモックは各画面が独立HTMLで遷移が繋がっていないため、Claude Code 実装時にこの順序で接続する。

## 問題（修正前）
サインイン → メール認証 → 言語・国設定 → **いきなりスコア画面**（データが空で意味を持たない）。
プロフィール設定（目標・体組成）が導線から抜けており、初回のスコアが空っぽで表示されていた。

## 正しいフロー（修正後）

```
1. スプラッシュ           revo_fit_splash_black.html
      ↓（アイコン→ワードマーク演出のあと自動遷移）
2. ウェルカム             revo_fit_welcome_black.html
      ↓「はじめる」
3. 新規登録 / ログイン    revo_fit_signup_black.html ⇄ revo_fit_login_black.html
      ↓「続ける」→ メール送信（マジックリンク／OTP）
   （メール内リンクで認証完了 → アプリに戻る）
      ↓
4. 言語・国の設定         revo_fit_onboarding_black.html
      ↓「はじめる」
5. ★プロフィール設定★    revo_fit_goal_setup_black.html   ← ここを必ず通す（今回追加）
      ・ニックネーム
      ・レベル（はじめて/経験者）
      ・目標（減量・増量・維持・睡眠改善・腸内改善／複数可）
      ・体組成（体重・身長・目標体重／体脂肪率・筋肉量は任意）
      ↓「はじめる」
6. 通知の許可             revo_fit_notif_permission_black.html
      ↓「許可」or「あとで」
7. ホーム画面に追加(PWA)  revo_fit_addhome_steps_saved.html（or pwa_install）
      ↓「続ける」or「あとで」
8. ホーム／スコア画面      revo_fit_home_black.html
      → このときプロフィールで入れた目標・体組成が初期スコアに反映され、
        「空っぽのスコア」ではなく意味のある初期状態で迎えられる。
```

## 各接続の実装メモ

| 画面 | ボタン | 次の遷移先 |
|---|---|---|
| splash | (自動) | welcome |
| welcome | はじめる | signup |
| signup | 続ける | メール送信 →（認証後）onboarding |
| login | 続ける | メール送信 →（認証後）home（既存ユーザーはプロフィール済みなので直接ホーム） |
| onboarding | はじめる | **goal_setup（プロフィール）** |
| goal_setup | はじめる | notif_permission |
| notif_permission | 許可/あとで | addhome_steps_saved |
| addhome | 続ける/あとで | home |

- **新規ユーザー**：4→5→6→7→8 を必ず通す。
- **既存ユーザー（再ログイン）**：プロフィールは設定済みなので、login → 直接 home（8）へ。onboarding/goal_setup はスキップ。
- goal_setup で入力した内容は `profile` テーブルに保存し、初回の `daily_score` 計算のベースにする（別設計書「記録→ホーム連携」参照）。

## プロフィール保存先（推奨）

```sql
create table profile (
  user_id uuid primary key references auth.users(id),
  nickname text,
  level text,              -- 'beginner' | 'experienced'
  goals text[],            -- ['lose','gain','maintain','sleep','gut'] 複数可
  height_cm numeric,
  weight_kg numeric,
  goal_weight_kg numeric,
  body_fat numeric,        -- 任意
  body_muscle numeric,     -- 任意
  lang text, country text, -- onboardingで設定
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 実装チェックリスト
- [ ] onboarding「はじめる」→ goal_setup へ遷移（現状は `/* アプリへ（デモ）*/` で停止中）。
- [ ] goal_setup「はじめる」→ notif_permission へ遷移。
- [ ] goal_setup の入力（ニックネーム・レベル・目標・体組成）を profile に保存。
- [ ] 新規は 4→5→6→7→8、既存ログインは直接 home に分岐。
- [ ] home 初回表示時、profile を元に初期スコアを算出（空スコアを見せない）。
- [ ] レベル（beginner/experienced）で提案の粒度・重量目安を出し分け（ビギナー/トレーニーの設計思想）。

---

**要点**：言語・国設定のあと、**必ずプロフィール設定（goal_setup）を通してからホーム**へ。これで初回のスコアが空っぽにならず、ユーザーは自分の目標・体組成が反映された状態で revo を始められる。今回 goal_setup にニックネームとレベルを追加し、フルなプロフィール入力にした。
