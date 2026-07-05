-- revo fit — starter Supabase schema
-- ---------------------------------------------------------------------------
-- Scope: only what the screens implemented so far need
-- (signup/login, onboarding language+region, goal_setup, home, log).
-- The original design references ~25 tables (profiles, goals, daily_logs,
-- meals, training_logs, subscriptions, etc.) — add those incrementally as
-- each screen (nutrition, recipes, ranking, medals, billing, ...) gets
-- implemented. This file is a foundation, not the final schema.
--
-- NOTE: policy names below are plain snake_case identifiers (no quotes/
-- colons/spaces). An earlier draft used quoted names like "profiles: read
-- own" — those broke when pasted into the Supabase SQL Editor (colons got
-- mangled), so every policy here uses a quote-free name instead.
--
-- How to apply: Supabase dashboard → SQL Editor → paste and run.
-- Or via CLI: supabase db push (after `supabase link`).
-- ---------------------------------------------------------------------------

-- Every table with a user_id column gets Row Level Security enabled below,
-- so a user can only ever read/write their own rows (roadmap §9 checklist).

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row. Created automatically on signup
-- via the trigger at the bottom of this file.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'ja',        -- one of the 14 LocaleCode values
  region text,                              -- ISO-ish region code chosen in onboarding (e.g. "JP")
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_read_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- user_goals: the multi-select goals from goal_setup ("lose", "gain",
-- "maintain", "sleep", "gut"). A user can hold several at once.
-- ---------------------------------------------------------------------------
create table if not exists public.user_goals (
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal_key text not null check (goal_key in ('lose', 'gain', 'maintain', 'sleep', 'gut')),
  created_at timestamptz not null default now(),
  primary key (user_id, goal_key)
);

alter table public.user_goals enable row level security;

create policy user_goals_read_own on public.user_goals
  for select using (auth.uid() = user_id);
create policy user_goals_write_own on public.user_goals
  for insert with check (auth.uid() = user_id);
create policy user_goals_delete_own on public.user_goals
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- body_metrics: point-in-time entries from goal_setup's sliders and from the
-- "body" category on the /log screen. Keeping this as a time series (rather
-- than columns on profiles) lets the analysis/forecast screens chart trends,
-- and lets /log pre-fill weight/body fat/muscle from the most recent row.
-- ---------------------------------------------------------------------------
create table if not exists public.body_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  weight_kg numeric(5, 2),
  height_cm numeric(5, 1),
  goal_weight_kg numeric(5, 2),
  body_fat_pct numeric(4, 1),
  muscle_mass_kg numeric(5, 2)
);

alter table public.body_metrics enable row level security;

create policy body_metrics_read_own on public.body_metrics
  for select using (auth.uid() = user_id);
create policy body_metrics_write_own on public.body_metrics
  for insert with check (auth.uid() = user_id);
create policy body_metrics_update_own on public.body_metrics
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_scores: the rf score (0-100) and its four factors (sleep/food/move/
-- recover) shown on the home ring + gauges. One row per user per day.
-- Until the log/nutrition/training screens exist, this table stays empty for
-- new users — which is exactly the "empty state" the home screen expects
-- (see src/app/home/page.tsx: useHomeSummary() returns null when there's no
-- row for today, and the UI shows the zero/empty state per roadmap §13).
-- ---------------------------------------------------------------------------
create table if not exists public.daily_scores (
  user_id uuid not null references public.profiles (id) on delete cascade,
  score_date date not null default current_date,
  total_score smallint check (total_score between 0 and 100),
  sleep_score smallint check (sleep_score between 0 and 100),
  food_score smallint check (food_score between 0 and 100),
  move_score smallint check (move_score between 0 and 100),
  recover_score smallint check (recover_score between 0 and 100),
  next_step_key text, -- references a catalog of "today's one step" suggestions (future table)
  created_at timestamptz not null default now(),
  primary key (user_id, score_date)
);

alter table public.daily_scores enable row level security;

create policy daily_scores_read_own on public.daily_scores
  for select using (auth.uid() = user_id);
create policy daily_scores_write_own on public.daily_scores
  for insert with check (auth.uid() = user_id);
create policy daily_scores_update_own on public.daily_scores
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- subscriptions: placeholder for the plans/billing/cross_confirm/receipt
-- screens (not yet implemented). Kept minimal — expand once Stripe (web) and
-- StoreKit/Play Billing (native, if that path is revisited) are wired up.
-- Do NOT trust amounts/plan from the client — this table is written only by
-- a server-side webhook handler once Stripe is connected (roadmap §9).
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'basic', 'standard', 'cross')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy subscriptions_read_own on public.subscriptions
  for select using (auth.uid() = user_id);
-- No client insert/update policy on purpose: only the Stripe webhook
-- (using the service role key, which bypasses RLS) should write here.

-- ---------------------------------------------------------------------------
-- Auto-create a profiles row whenever a new auth.users row is created
-- (i.e. right after signup, before addhome/onboarding runs).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
 