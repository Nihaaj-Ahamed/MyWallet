create or replace function public.reset_wallet_data()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise exception 'Sign in before resetting wallet data.' using errcode = '42501';
  end if;

  delete from public.transactions where user_id = owner_id;
  delete from public.debts where user_id = owner_id;
  delete from public.cycles where user_id = owner_id;
  delete from public.savings_vault where user_id = owner_id;

  insert into public.savings_vault (user_id, id, name, current_balance, target_goal, created_at)
  values
    (owner_id, 'wallet-bank', 'Bank Money', 0, 0, now()),
    (owner_id, 'wallet-hand', 'Hand Money', 0, 0, now()),
    (owner_id, 'wallet-option', 'Option Money', 0, 0, now());
end;
$$;

revoke execute on function public.reset_wallet_data() from public, anon;
grant execute on function public.reset_wallet_data() to authenticated;
