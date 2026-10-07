-- The order a user arranges their rituals in. Lower comes first, in the
-- Rituals list and on the home page alike.

-- New rituals land at the end: the default is a millisecond timestamp, which
-- sorts after the small indexes that reordering writes.
alter table public.rituals
  add column position bigint not null
    default (extract(epoch from clock_timestamp()) * 1000)::bigint;

-- Keep existing rituals in the order they were created.
update public.rituals r
set position = ordered.rn
from (
  select id, row_number() over (partition by user_id order by created_at) as rn
  from public.rituals
) ordered
where r.id = ordered.id;

create index rituals_user_id_position_idx on public.rituals (user_id, position);

-- Saves a new order in one statement: each id takes its index in the array.
-- Runs as the caller, so RLS keeps it to their own rituals.
create function public.reorder_rituals(ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.rituals r
  set position = o.ord
  from unnest(ids) with ordinality as o(id, ord)
  where r.id = o.id;
$$;
