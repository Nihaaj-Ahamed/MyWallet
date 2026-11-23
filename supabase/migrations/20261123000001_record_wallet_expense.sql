create or replace function public.record_wallet_expense(expense_data jsonb)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  expense public.transactions%rowtype;
  wallet_id text;
  wallet_name text;
  wallet_balance numeric;
begin
  if owner_id is null then
    raise exception 'Sign in before recording expenses.' using errcode = '42501';
  end if;

  expense := jsonb_populate_record(null::public.transactions, expense_data);
  if expense.amount is null or expense.amount >= 0 then
    raise exception 'Enter a positive expense amount.';
  end if;

  if expense.description like '[Bank] %' then
    wallet_id := 'wallet-bank';
    wallet_name := 'Bank Money';
  elsif expense.description like '[Hand] %' then
    wallet_id := 'wallet-hand';
    wallet_name := 'Hand Money';
  else
    raise exception 'Select Bank Money or Hand Money.';
  end if;

  insert into public.transactions (id, user_id, cycle_id, amount, type, category, description, date, created_at)
  values (expense.id, owner_id, expense.cycle_id, expense.amount, 'expense', expense.category, expense.description, expense.date, expense.created_at);

  insert into public.savings_vault as wallet (id, user_id, name, current_balance, target_goal, created_at)
  values (wallet_id, owner_id, wallet_name, expense.amount, 0, now())
  on conflict (user_id, id) do update
    set current_balance = wallet.current_balance + excluded.current_balance
  returning current_balance into wallet_balance;

  return wallet_balance;
end;
$$;

revoke execute on function public.record_wallet_expense(jsonb) from public, anon;
grant execute on function public.record_wallet_expense(jsonb) to authenticated;
