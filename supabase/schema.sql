-- ============================================================
-- サクサク確定申告 — Supabase Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. profiles — ユーザープロフィール（初期設定）
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  business_name text not null default '',
  industry text not null default '',
  tax_return_type text not null default 'blue' check (tax_return_type in ('blue', 'white')),
  consumption_tax_type text not null default 'exempt' check (consumption_tax_type in ('exempt', 'simplified', 'standard')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- 2. transactions — 仕訳（複式簿記）
-- ============================================================
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  debit_account_id text not null,
  credit_account_id text not null,
  amount integer not null check (amount > 0),
  tax_included boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transactions_user_date on transactions (user_id, date desc);
create index idx_transactions_debit on transactions (user_id, debit_account_id);
create index idx_transactions_credit on transactions (user_id, credit_account_id);

alter table transactions enable row level security;

create policy "Users can view own transactions"
  on transactions for select using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on transactions for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete using (auth.uid() = user_id);

-- ============================================================
-- 3. katei_anbun — 家事按分設定
-- ============================================================
create table katei_anbun (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  account_id text not null,
  business_ratio integer not null check (business_ratio >= 0 and business_ratio <= 100),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, account_id)
);

alter table katei_anbun enable row level security;

create policy "Users can view own katei_anbun"
  on katei_anbun for select using (auth.uid() = user_id);

create policy "Users can insert own katei_anbun"
  on katei_anbun for insert with check (auth.uid() = user_id);

create policy "Users can update own katei_anbun"
  on katei_anbun for update using (auth.uid() = user_id);

create policy "Users can delete own katei_anbun"
  on katei_anbun for delete using (auth.uid() = user_id);

-- ============================================================
-- 4. templates — 仕訳テンプレート
-- ============================================================
create table templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  debit_account_id text not null,
  credit_account_id text not null,
  amount integer,
  tax_included boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table templates enable row level security;

create policy "Users can view own templates"
  on templates for select using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on templates for insert with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on templates for update using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on templates for delete using (auth.uid() = user_id);

-- ============================================================
-- 5. tax_settings — 税金設定
-- ============================================================
create table tax_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null unique,
  fiscal_year_start text not null default '01',
  tax_method text not null default 'exempt' check (tax_method in ('exempt', 'simplified', 'standard')),
  simplified_business_type integer check (simplified_business_type >= 1 and simplified_business_type <= 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tax_settings enable row level security;

create policy "Users can view own tax_settings"
  on tax_settings for select using (auth.uid() = user_id);

create policy "Users can insert own tax_settings"
  on tax_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own tax_settings"
  on tax_settings for update using (auth.uid() = user_id);

-- ============================================================
-- 6. csv_imports — CSVインポート履歴
-- ============================================================
create table csv_imports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  row_count integer not null default 0,
  imported_at timestamptz not null default now()
);

alter table csv_imports enable row level security;

create policy "Users can view own csv_imports"
  on csv_imports for select using (auth.uid() = user_id);

create policy "Users can insert own csv_imports"
  on csv_imports for insert with check (auth.uid() = user_id);
