-- Integration connections: one row per user per connected service, holding
-- the OAuth tokens the server uses to read from it. Tokens are encrypted by
-- the app before they're stored (see src/lib/integrations/crypto.ts), so a
-- row read from the browser only ever shows ciphertext.

create table public.integration_connections (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider public.ritual_integration not null,
  access_token text not null,
  -- Null for services or apps whose access tokens don't expire.
  refresh_token text,
  expires_at timestamptz,
  scope text,
  -- Who the user is signed in as on the other side, e.g. their email there.
  account_label text,
  -- Set while one request refreshes the tokens, so others wait for it rather
  -- than spending the same single-use refresh token.
  refresh_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

create trigger integration_connections_set_updated_at
  before update on public.integration_connections
  for each row execute function public.set_updated_at();

alter table public.integration_connections enable row level security;

create policy "Users can view their own connections"
  on public.integration_connections for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own connections"
  on public.integration_connections for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own connections"
  on public.integration_connections for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own connections"
  on public.integration_connections for delete
  to authenticated
  using ((select auth.uid()) = user_id);
