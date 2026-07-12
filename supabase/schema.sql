-- =====================================================================
-- revo fit — Supabase スキーマ（docs/01・02・03 の設計書に準拠）
-- ローカル版（localStorage）から移行する際に適用する。
-- RLS：全テーブル「本人のみ」。visibility による読み取り制御は profile のみ。
-- =====================================================================

-- ---------- profile（docs/01 §5 統合版 ＋ docs/04 §3 テーマ列） ----------
create table if not exists profile (
  user_id uuid primary key references auth.users(id),
  -- 言語・国
  lang text, country text,
  -- 基本プロフィール（goal_setup）
  nickname text,
  level text,                 -- 'beginner' | 'experienced'
  goals text[],               -- ['lose','gain','maintain','sleep','gut'] 複数可
  height_cm numeric, weight_kg numeric, goal_weight_kg numeric,
  body_fat numeric, body_muscle numeric,
  -- SNS公開プロフィール（sns_profile）
  avatar_url text,
  display_name text,
  username text unique,       -- @ユーザー名。全体で一意
  title text,
  bio text,                   -- 160字まで（アプリ側で制限）
  links jsonb default '{}',   -- {"instagram":"...","x":"...","youtube":"..."}
  visibility text default 'all',  -- 'all'|'followers'|'private'
  -- テーマ（docs/04）
  theme_color text default 'groove',  -- 'chill'|'groove'|'energetic'|'focus'|'muse'
  theme_mode  text default 'dark',    -- 'dark'|'light'
  -- 状態
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- daily_log（docs/03 §2 親テーブル） ----------
create table if not exists daily_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  log_date date not null,
  body_weight numeric, body_fat numeric, body_muscle numeric,
  sleep_hours numeric, sleep_quality int,
  move_total_min int default 0,
  water_total_ml int default 0,
  diet_style int default 0,                 -- 0:バランス 1:低糖質 2:低脂質
  protein_g numeric, fat_g numeric, carb_g numeric,
  sugar_g numeric, fiber_g numeric, salt_g numeric,
  cond_mood int, cond_bowel int, muscle_sore boolean default false,
  cond_note text,
  payload jsonb,                            -- クライアント完全復元用（明細含む。正規化テーブルは第2段階）
  updated_at timestamptz default now(),
  unique(user_id, log_date)                 -- 1ユーザー×1日=1レコード（upsertキー）
);

-- ---------- 子テーブル（docs/03 §2） ----------
create table if not exists workout_set (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references daily_log(id) on delete cascade,
  part text,
  exercise text,
  weight_kg numeric,
  reps int,
  sets int,
  sort int default 0
);

create table if not exists meal_entry (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references daily_log(id) on delete cascade,
  slot text,          -- 'breakfast'|'lunch'|'dinner'|'snack'
  name text,
  kcal int,
  protein_g numeric, fat_g numeric, carb_g numeric,
  photo_url text
);

create table if not exists water_intake (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references daily_log(id) on delete cascade,
  kind text,
  ml int,
  is_supp boolean default false
);

-- ---------- daily_score（docs/02 §4） ----------
create table if not exists daily_score (
  user_id uuid not null references auth.users(id),
  log_date date not null,
  sleep_score int, food_score int, move_score int, recover_score int,
  total_score int,             -- 加重平均（睡眠25/食事30/運動25/回復20）
  updated_at timestamptz default now(),
  primary key(user_id, log_date)
);

-- ---------- RLS（docs/03 §8：必須） ----------
-- ※ このスクリプトは何度実行しても安全（既存ポリシーは作り直す）
alter table profile enable row level security;
alter table daily_log enable row level security;
alter table workout_set enable row level security;
alter table meal_entry enable row level security;
alter table water_intake enable row level security;
alter table daily_score enable row level security;

drop policy if exists "profile_own_write" on profile;
drop policy if exists "profile_public_read" on profile;
drop policy if exists "daily_log_own" on daily_log;
drop policy if exists "daily_score_own" on daily_score;
drop policy if exists "workout_set_own" on workout_set;
drop policy if exists "meal_entry_own" on meal_entry;
drop policy if exists "water_intake_own" on water_intake;

create policy "profile_own_write" on profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profile_public_read" on profile
  for select using (visibility = 'all' or auth.uid() = user_id);
  -- 'followers' の読み取りはフォロー関係テーブル導入時に拡張する

create policy "daily_log_own" on daily_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_score_own" on daily_score
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_set_own" on workout_set
  for all using (exists (select 1 from daily_log l where l.id = log_id and l.user_id = auth.uid()));
create policy "meal_entry_own" on meal_entry
  for all using (exists (select 1 from daily_log l where l.id = log_id and l.user_id = auth.uid()));
create policy "water_intake_own" on water_intake
  for all using (exists (select 1 from daily_log l where l.id = log_id and l.user_id = auth.uid()));

-- 旧版スキーマからの差分（存在しなければ追加）
alter table daily_log add column if not exists payload jsonb;

-- ---------- subscriptions（Stripe Webhook が service_role で書き込む） ----------
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id),
  plan text,                    -- 'basic' | 'standard' | 'cross'
  cycle text,                   -- 'month' | 'year'
  status text,                  -- 'active' | 'canceled' | Stripeのstatus
  cancel_at_period_end boolean default false,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz default now()
);
alter table subscriptions enable row level security;
drop policy if exists "subscriptions_read_own" on subscriptions;
create policy "subscriptions_read_own" on subscriptions
  for select using (auth.uid() = user_id);
-- 書き込みポリシーは意図的に無し（クライアントから書けない。Webhookのservice_roleのみ）

-- ---------- SNS（posts / cheers / follows） ----------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  kind text not null,             -- 'training' | 'recipe' | 'ranking'
  title text, body text,
  tags text[] default '{}',
  moods text[] default '{}',
  photos jsonb default '[]',      -- v1は縮小dataURL。将来はStorage URLへ
  extra jsonb default '{}',       -- レシピの材料・工程など
  author_name text,               -- 表示名スナップショット
  cheer_count int default 0,
  created_at timestamptz default now()
);
alter table posts enable row level security;
drop policy if exists "posts_read_all" on posts;
create policy "posts_read_all" on posts for select using (true);
drop policy if exists "posts_write_own" on posts;
create policy "posts_write_own" on posts
  for insert with check (auth.uid() = user_id);
drop policy if exists "posts_update_own" on posts;
create policy "posts_update_own" on posts
  for update using (auth.uid() = user_id);
drop policy if exists "posts_delete_own" on posts;
create policy "posts_delete_own" on posts
  for delete using (auth.uid() = user_id);

create table if not exists cheers (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  primary key(post_id, user_id)
);
alter table cheers enable row level security;
drop policy if exists "cheers_read_all" on cheers;
create policy "cheers_read_all" on cheers for select using (true);
drop policy if exists "cheers_write_own" on cheers;
create policy "cheers_write_own" on cheers
  for insert with check (auth.uid() = user_id);

create table if not exists follows (
  follower_id uuid not null references auth.users(id),
  followee_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  primary key(follower_id, followee_id)
);
alter table follows enable row level security;
drop policy if exists "follows_read_all" on follows;
create policy "follows_read_all" on follows for select using (true);
drop policy if exists "follows_write_own" on follows;
create policy "follows_write_own" on follows
  for insert with check (auth.uid() = follower_id);
drop policy if exists "follows_delete_own" on follows;
create policy "follows_delete_own" on follows
  for delete using (auth.uid() = follower_id);

-- 応援数はトリガで集計（クライアントからの直接更新を不要に）
create or replace function bump_cheer_count() returns trigger as $$
begin
  update posts set cheer_count = cheer_count + 1 where id = new.post_id;
  return new;
end; $$ language plpgsql security definer;
drop trigger if exists trg_bump_cheer on cheers;
create trigger trg_bump_cheer after insert on cheers
  for each row execute function bump_cheer_count();

-- ---------- tips（応援・投げ銭。Webhook が service_role で書込） ----------
create table if not exists tips (
  id text primary key,            -- Stripe checkout session id（冪等キー）
  post_id uuid references posts(id) on delete set null,
  from_user uuid references auth.users(id),
  to_user uuid references auth.users(id),
  amount int not null,
  currency text default 'jpy',
  created_at timestamptz default now()
);
alter table tips enable row level security;
drop policy if exists "tips_read_own" on tips;
create policy "tips_read_own" on tips
  for select using (auth.uid() = from_user or auth.uid() = to_user);
-- 書き込みポリシー無し（Webhookのservice_roleのみ）

-- 背景テーマ（2026-07-09 追加）
alter table profile add column if not exists bg_theme text;

-- ---------- food_cache（AIカロリー推定の共有キャッシュ。書込はservice_roleのみ） ----------
create table if not exists food_cache (
  name_norm text primary key,
  portions jsonb default '[]',
  created_at timestamptz default now()
);
alter table food_cache enable row level security;
drop policy if exists "food_cache_read_all" on food_cache;
create policy "food_cache_read_all" on food_cache for select using (true);
