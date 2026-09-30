-- =============================================================================
-- Playing Socrates -- Migration 003: Per-Topic Question Sets (remove test_set)
-- Spec §5 / TOPIC_SETS.md
-- =============================================================================

-- 1. Remove test_set column from participants table
alter table participants drop column if exists test_set;

-- 2. Update test_responses table: relax 'form' constraint to allow 'pretest' / 'posttest'
alter table test_responses drop constraint if exists test_responses_form_check;
alter table test_responses alter column form drop not null;
alter table test_responses add constraint test_responses_form_check check (
  form is null or form in ('pretest', 'posttest', 'pre', 'post', 'A', 'B')
);
