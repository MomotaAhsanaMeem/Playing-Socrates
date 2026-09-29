-- =============================================================================
-- Playing Socrates -- Initial Schema Migration
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- participants
create table participants (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  consent_at    timestamptz,
  condition     text check (condition in ('direct', 'socratic', 'adaptive')),
  stage         text not null default 'consent'
                  check (stage in (
                    'consent', 'background', 'pretest', 'session',
                    'posttest', 'trust', 'cogload', 'debrief', 'complete'
                  )),
  completed_at  timestamptz,
  background    jsonb,
  user_agent    text
);

-- test_responses
create table test_responses (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  form           text not null check (form in ('A', 'B')),
  item_id        text not null,
  chosen_index   smallint not null,
  is_correct     boolean not null,
  answered_at    timestamptz not null default now()
);

-- test_scores
create table test_scores (
  participant_id uuid primary key references participants(id) on delete cascade,
  pre_score      smallint,
  post_score     smallint,
  learning_gain  smallint generated always as (post_score - pre_score) stored,
  pre_time_s     real,
  post_time_s    real
);

-- messages
create table messages (
  id               uuid primary key default gen_random_uuid(),
  participant_id   uuid not null references participants(id) on delete cascade,
  turn_index       smallint not null,
  role             text not null check (role in ('student', 'ai')),
  content          text not null,
  created_at       timestamptz not null default now(),
  is_planted_error boolean not null default false,
  trust_rating     smallint check (trust_rating between 1 and 7)
);

-- questionnaires
create table questionnaires (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  type           text not null check (type in ('trust', 'load')),
  item_id        text not null,
  value          smallint not null
);

-- scores
create table scores (
  participant_id      uuid primary key references participants(id) on delete cascade,
  trust_score         real,
  load_score          real,
  trust_correct_mean  real,
  trust_planted_mean  real,
  calibration_gap     real
);

-- stage_times
create table stage_times (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  stage          text not null,
  started_at     timestamptz not null default now(),
  ended_at       timestamptz
);

-- RLS
alter table participants   enable row level security;
alter table test_responses enable row level security;
alter table test_scores    enable row level security;
alter table messages       enable row level security;
alter table questionnaires enable row level security;
alter table scores         enable row level security;
alter table stage_times    enable row level security;

create policy "deny_all" on participants   for all using (false);
create policy "deny_all" on test_responses for all using (false);
create policy "deny_all" on test_scores    for all using (false);
create policy "deny_all" on messages       for all using (false);
create policy "deny_all" on questionnaires for all using (false);
create policy "deny_all" on scores         for all using (false);
create policy "deny_all" on stage_times    for all using (false);

-- Indexes
create index on test_responses (participant_id, form);
create index on messages (participant_id, turn_index);
create index on messages (participant_id, is_planted_error);
create index on questionnaires (participant_id, type);
create index on stage_times (participant_id, stage);
