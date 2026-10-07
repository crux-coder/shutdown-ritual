-- Lets a signed-in user delete their own account. Deleting the auth user
-- cascades to everything they own: profile, rituals, completions and step
-- checks. Runs with the definer's rights, so the app needs no admin key, but
-- it only ever touches the caller's own row.

create function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
