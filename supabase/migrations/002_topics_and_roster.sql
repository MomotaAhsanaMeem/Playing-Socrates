-- =============================================================================
-- Playing Socrates -- Migration 002: Topics, Test Sets, and Atomic Roster Counter
-- Spec §5 / TOPICS.md §4 & §5
-- =============================================================================

-- Add topic, test_set, and roster_n to participants
alter table participants
  add column if not exists topic text check (
    topic is null or topic in ('procrastination', 'multitasking', 'sleep', 'impulse_buying', 'password_safety')
  ),
  add column if not exists test_set text check (
    test_set is null or test_set in ('A', 'B')
  ),
  add column if not exists roster_n integer;

-- Create counters table for atomic increment
create table if not exists counters (
  id    text primary key,
  value bigint not null default 0
);

-- Initialize roster counter if not present
insert into counters (id, value)
values ('roster', 0)
on conflict (id) do nothing;

-- Atomic counter function: UPDATE ... RETURNING
create or replace function next_roster_counter()
returns bigint
language plpgsql
security definer
as $$
declare
  next_val bigint;
begin
  update counters
  set value = value + 1
  where id = 'roster'
  returning value into next_val;

  if next_val is null then
    insert into counters (id, value)
    values ('roster', 1)
    on conflict (id) do update
      set value = counters.value + 1
    returning value into next_val;
  end if;

  return next_val;
end;
$$;

-- Allow executing function from service role and public API
grant execute on function next_roster_counter() to service_role;
grant execute on function next_roster_counter() to postgres;
grant execute on function next_roster_counter() to anon;
grant execute on function next_roster_counter() to authenticated;

-- Enable RLS on counters
alter table counters enable row level security;
create policy "deny_all" on counters for all using (false);
