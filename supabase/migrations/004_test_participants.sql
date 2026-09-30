-- =============================================================================
-- Playing Socrates -- Migration 004: Add is_test and completed flags
-- =============================================================================

alter table participants
  add column if not exists is_test boolean not null default false,
  add column if not exists completed boolean not null default false;

create index if not exists idx_participants_is_test on participants (is_test);
