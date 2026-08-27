-- ============================================================================
-- MyWallet — Data Privacy & Multi-Tenancy Migration
-- ----------------------------------------------------------------------------
-- Adds a user_id ownership column to every user-owned table, then enables Row
-- Level Security so each authenticated user can ONLY read/write their own rows.
--
-- Tables scoped: cycles, transactions, debts, savings_vault
--
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Ensure pgcrypto is available (usually already enabled on Supabase)
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Add user_id ownership column to each table.
--    - UUID foreign key -> auth.users(id), cascading delete on user removal.
--    - DEFAULT auth.uid() stamps the owner automatically on insert as a safety
--      net, even if a client forgets to send user_id.
--    - Kept NULLABLE for now so existing/orphaned rows don't break the deploy.
-- ----------------------------------------------------------------------------
alter table public.cycles
  add column if not exists user_id uuid
  references auth.users (id) on delete cascade
  default auth.uid();

alter table public.transactions
  add column if not exists user_id uuid
  references auth.users (id) on delete cascade
  default auth.uid();

alter table public.debts
  add column if not exists user_id uuid
  references auth.users (id) on delete cascade
  default auth.uid();

alter table public.savings_vault
  add column if not exists user_id uuid
  references auth.users (id) on delete cascade
  default auth.uid();

-- ----------------------------------------------------------------------------
-- 2. Indexes for fast per-user filtering.
-- ----------------------------------------------------------------------------
create index if not exists idx_cycles_user_id        on public.cycles (user_id);
create index if not exists idx_transactions_user_id  on public.transactions (user_id);
create index if not exists idx_debts_user_id         on public.debts (user_id);
create index if not exists idx_savings_vault_user_id on public.savings_vault (user_id);

-- ----------------------------------------------------------------------------
-- 2b. Backfill: pre-auth rows have no owner. If exactly ONE auth user exists
--     (typical for this project's migration), attribute all legacy rows to
--     that user so no data is lost. With multiple users, shared rows cannot be
--     fairly attributed, so they are removed instead (the app re-seeds empty
--     per-user wallets automatically on next sign-in).
-- ----------------------------------------------------------------------------
do $$
declare
  single_owner uuid;
begin
  if (select count(*) from auth.users) = 1 then
    select id into single_owner from auth.users limit 1;
    update public.cycles        set user_id = single_owner where user_id is null;
    update public.transactions  set user_id = single_owner where user_id is null;
    update public.debts         set user_id = single_owner where user_id is null;
    update public.savings_vault set user_id = single_owner where user_id is null;
  else
    delete from public.transactions  where user_id is null;
    delete from public.debts         where user_id is null;
    delete from public.cycles        where user_id is null;
    delete from public.savings_vault where user_id is null;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3. savings_vault: the three core wallets (wallet-bank / wallet-hand /
--    wallet-option) use fixed ids. Under multi-tenancy each user owns their own
--    set, so id alone cannot be the primary key. Convert it to a composite key
--    (user_id, id) so every user can hold their own wallet rows.
-- ----------------------------------------------------------------------------
alter table public.savings_vault drop constraint if exists savings_vault_pkey;
-- Remove any leftover single-column unique on id before adding the composite key
drop index if exists public.savings_vault_id_key;
alter table public.savings_vault add primary key (user_id, id);

-- ----------------------------------------------------------------------------
-- 4. Enable Row Level Security on all user-owned tables.
-- ----------------------------------------------------------------------------
alter table public.cycles        enable row level security;
alter table public.transactions  enable row level security;
alter table public.debts         enable row level security;
alter table public.savings_vault enable row level security;

-- ----------------------------------------------------------------------------
-- 5. RLS policies: users can ONLY select/insert/update/delete rows where
--    auth.uid() = user_id.
--    Each block is idempotent (drop policy if exists before create).
-- ----------------------------------------------------------------------------

-- ---- cycles -----------------------------------------------------------------
drop policy if exists "cycles_select_own" on public.cycles;
create policy "cycles_select_own" on public.cycles
  for select using (auth.uid() = user_id);

drop policy if exists "cycles_insert_own" on public.cycles;
create policy "cycles_insert_own" on public.cycles
  for insert with check (auth.uid() = user_id);

drop policy if exists "cycles_update_own" on public.cycles;
create policy "cycles_update_own" on public.cycles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cycles_delete_own" on public.cycles;
create policy "cycles_delete_own" on public.cycles
  for delete using (auth.uid() = user_id);

-- ---- transactions -----------------------------------------------------------
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- ---- debts ------------------------------------------------------------------
drop policy if exists "debts_select_own" on public.debts;
create policy "debts_select_own" on public.debts
  for select using (auth.uid() = user_id);

drop policy if exists "debts_insert_own" on public.debts;
create policy "debts_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);

drop policy if exists "debts_update_own" on public.debts;
create policy "debts_update_own" on public.debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "debts_delete_own" on public.debts;
create policy "debts_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

-- ---- savings_vault ----------------------------------------------------------
drop policy if exists "savings_vault_select_own" on public.savings_vault;
create policy "savings_vault_select_own" on public.savings_vault
  for select using (auth.uid() = user_id);

drop policy if exists "savings_vault_insert_own" on public.savings_vault;
create policy "savings_vault_insert_own" on public.savings_vault
  for insert with check (auth.uid() = user_id);

drop policy if exists "savings_vault_update_own" on public.savings_vault;
create policy "savings_vault_update_own" on public.savings_vault
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "savings_vault_delete_own" on public.savings_vault;
create policy "savings_vault_delete_own" on public.savings_vault
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. OPTIONAL hardening (run only after you are sure every row has an owner):
--    a) Assign any orphaned (user_id IS NULL) legacy rows to YOUR user id, so
--       you don't lose existing data. Replace '<YOUR-USER-UUID>' below.
--    b) Then make user_id NOT NULL for a strict guarantee.
--
--    update public.cycles        set user_id = '<YOUR-USER-UUID>' where user_id is null;
--    update public.transactions  set user_id = '<YOUR-USER-UUID>' where user_id is null;
--    update public.debts         set user_id = '<YOUR-USER-UUID>' where user_id is null;
--    update public.savings_vault set user_id = '<YOUR-USER-UUID>' where user_id is null;
--
--    alter table public.cycles        alter column user_id set not null;
--    alter table public.transactions  alter column user_id set not null;
--    alter table public.debts         alter column user_id set not null;
--    alter table public.savings_vault alter column user_id set not null;
-- ----------------------------------------------------------------------------
