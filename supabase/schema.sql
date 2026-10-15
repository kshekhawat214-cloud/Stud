-- ============================================================
-- Stud — AI PM Journey Tracker
-- Supabase PostgreSQL Production Schema
-- Claude Sonnet 4.6 — Backend Owner
-- Covers: Tables, Constraints, Triggers, Indexes, RLS Policies
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- UTILITY: Auto-update updated_at trigger function
-- Applied to every mutable table below
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. PHASES
-- ============================================================
create table if not exists public.phases (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete cascade not null,
  title            text not null,
  week_range       text,
  description      text,
  deliverable      text,
  status           text check (status in ('not_started','in_progress','completed')) default 'not_started' not null,
  start_date       date,
  target_end_date  date,
  actual_end_date  date,
  sort_order       int not null default 0,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null,
  constraint phases_date_order check (target_end_date is null or start_date is null or target_end_date >= start_date)
);

create index if not exists idx_phases_user_id       on public.phases(user_id);
create index if not exists idx_phases_status         on public.phases(status);
create index if not exists idx_phases_sort_order     on public.phases(user_id, sort_order);

drop trigger if exists set_phases_updated_at on public.phases;
create trigger set_phases_updated_at
  before update on public.phases
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 2. TOPICS
-- ============================================================
create table if not exists public.topics (
  id                  uuid primary key default gen_random_uuid(),
  phase_id            uuid references public.phases(id) on delete cascade not null,
  user_id             uuid references auth.users on delete cascade not null,
  title               text not null,
  status              text check (status in ('not_started','in_progress','done')) default 'not_started' not null,
  time_spent_minutes  int default 0 not null check (time_spent_minutes >= 0),
  notes               text,
  skill_area          text check (skill_area in (
    'pm_fundamentals',
    'agile_execution',
    'ai_llm',
    'product_analytics',
    'product_docs',
    'product_design',
    'business_strategy',
    'portfolio_storytelling',
    'interview_readiness'
  )) not null,
  sort_order          int default 0 not null,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create index if not exists idx_topics_phase_id    on public.topics(phase_id, user_id);
create index if not exists idx_topics_user_id     on public.topics(user_id);
create index if not exists idx_topics_status      on public.topics(status);
create index if not exists idx_topics_skill_area  on public.topics(skill_area);

drop trigger if exists set_topics_updated_at on public.topics;
create trigger set_topics_updated_at
  before update on public.topics
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 3. RESOURCES (includes YouTube preview cache fields)
-- ============================================================
create table if not exists public.resources (
  id                  uuid primary key default gen_random_uuid(),
  topic_id            uuid references public.topics(id) on delete cascade not null,
  user_id             uuid references auth.users on delete cascade not null,
  title               text not null,
  url                 text not null,
  type                text check (type in ('book','video','article','course','youtube','doc')) not null,
  source              text check (source in ('preloaded','user_added')) default 'user_added' not null,
  status              text check (status in ('bookmarked','in_progress','completed')) default 'bookmarked' not null,
  notes               text,
  -- YouTube preview cache (backend.md §3)
  yt_video_id         text,
  yt_thumbnail_url    text,
  yt_channel_name     text,
  yt_duration_seconds int,
  preview_fetched_at  timestamptz,
  added_date          timestamptz default now() not null,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create index if not exists idx_resources_topic_id   on public.resources(topic_id, user_id);
create index if not exists idx_resources_type        on public.resources(type);
create index if not exists idx_resources_status      on public.resources(status);

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
  before update on public.resources
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 4. PROJECT REMINDERS
-- rules.md §1, §13: Friday AI, NOVATrix, Resume Analyzer, Mock Interview
-- Status auto-transitions date-driven, never auto-set to done
-- ============================================================
create table if not exists public.project_reminders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users on delete cascade not null,
  project_name          text not null,
  mapped_phase_id       uuid references public.phases(id) on delete set null,
  scheduled_week_label  text,
  action_note           text,
  external_link         text,
  status                text check (status in ('upcoming','due_now','done','snoozed')) default 'upcoming' not null,
  reminder_date         date,
  notes                 text,
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

create index if not exists idx_project_reminders_user_id  on public.project_reminders(user_id, status);
create index if not exists idx_project_reminders_date     on public.project_reminders(reminder_date);

drop trigger if exists set_project_reminders_updated_at on public.project_reminders;
create trigger set_project_reminders_updated_at
  before update on public.project_reminders
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 5. PRDS
-- ============================================================
create table if not exists public.prds (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users on delete cascade not null,
  project_name              text not null,
  problem_statement         text,
  goals                     text,
  success_metrics           text,
  user_personas             text,
  functional_requirements   text,
  non_functional_requirements text,
  user_stories              jsonb,
  acceptance_criteria       text,
  kpis                      text,
  created_at                timestamptz default now() not null,
  last_edited               timestamptz default now() not null,
  updated_at                timestamptz default now() not null
);

create index if not exists idx_prds_user_id     on public.prds(user_id);
create index if not exists idx_prds_updated_at  on public.prds(user_id, updated_at desc);

drop trigger if exists set_prds_updated_at on public.prds;
create trigger set_prds_updated_at
  before update on public.prds
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 6. CERTIFICATIONS
-- rules.md §7: date_completed MUST be set when status = 'completed'
-- ============================================================
create table if not exists public.certifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  name            text not null,
  priority        text check (priority in ('must_have','good_to_have')) default 'must_have' not null,
  status          text check (status in ('not_started','in_progress','completed')) default 'not_started' not null,
  date_completed  date,
  credential_url  text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  -- rules.md §7 enforced at DB level
  constraint certifications_completed_requires_date
    check (status <> 'completed' or date_completed is not null)
);

create index if not exists idx_certifications_user_id  on public.certifications(user_id, status);
create index if not exists idx_certifications_priority on public.certifications(priority);

drop trigger if exists set_certifications_updated_at on public.certifications;
create trigger set_certifications_updated_at
  before update on public.certifications
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 7. BOOKS
-- ============================================================
create table if not exists public.books (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  title        text not null,
  author       text,
  percent_read int default 0 not null check (percent_read >= 0 and percent_read <= 100),
  rating       int check (rating >= 1 and rating <= 5),
  notes        text,
  status       text check (status in ('not_started','reading','finished')) default 'not_started' not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index if not exists idx_books_user_id  on public.books(user_id, status);

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
  before update on public.books
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 8. NETWORKING CONTACTS
-- rules.md §14: 30-day stale nudge for connected/coffee_chat_done
-- ============================================================
create table if not exists public.networking_contacts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users on delete cascade not null,
  name              text not null,
  company           text,
  role              text,
  status            text check (status in (
    'to_reach_out','connected','coffee_chat_done','referral_requested'
  )) default 'to_reach_out' not null,
  linkedin_url      text,
  last_contact_date date,
  notes             text,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

create index if not exists idx_networking_user_id           on public.networking_contacts(user_id, status);
create index if not exists idx_networking_last_contact_date on public.networking_contacts(last_contact_date);

drop trigger if exists set_networking_contacts_updated_at on public.networking_contacts;
create trigger set_networking_contacts_updated_at
  before update on public.networking_contacts
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 9. DAILY HABITS
-- rules.md §2b: independent per-habit streak counter
-- ============================================================
create table if not exists public.daily_habits (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users on delete cascade not null,
  title                text not null,
  streak               int default 0 not null check (streak >= 0),
  last_completed_date  date,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

create index if not exists idx_daily_habits_user_id on public.daily_habits(user_id);

drop trigger if exists set_daily_habits_updated_at on public.daily_habits;
create trigger set_daily_habits_updated_at
  before update on public.daily_habits
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 10. RESUME VAULT
-- rules.md §15: multiple resume versions, no single "active" flag
-- ============================================================
create table if not exists public.resume_vault (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  version_name  text not null,
  target_roles  text[],
  file_url      text,  -- Supabase Storage path: {user_id}/resume-vault/{filename}
  last_updated  timestamptz default now() not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index if not exists idx_resume_vault_user_id on public.resume_vault(user_id);

drop trigger if exists set_resume_vault_updated_at on public.resume_vault;
create trigger set_resume_vault_updated_at
  before update on public.resume_vault
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 11. FOCUS SESSIONS
-- rules.md §3: optional topic_id; ended_at required to log time
-- ============================================================
create table if not exists public.focus_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete cascade not null,
  topic_id         uuid references public.topics(id) on delete set null,
  duration_minutes int not null check (duration_minutes > 0),
  started_at       timestamptz not null,
  ended_at         timestamptz,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index if not exists idx_focus_sessions_user_id     on public.focus_sessions(user_id);
create index if not exists idx_focus_sessions_started_at  on public.focus_sessions(user_id, started_at desc);
create index if not exists idx_focus_sessions_topic_id    on public.focus_sessions(topic_id);

drop trigger if exists set_focus_sessions_updated_at on public.focus_sessions;
create trigger set_focus_sessions_updated_at
  before update on public.focus_sessions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 12. APPLICATIONS
-- rules.md §9: freeform status transitions, follow_up_date badge
-- ============================================================
create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  company         text not null,
  role            text,
  status          text check (status in (
    'not_applied','applied','oa_screen','interview','offer','rejected'
  )) default 'not_applied' not null,
  applied_date    date,
  contact_person  text,
  notes           text,
  follow_up_date  date,
  resume_id       uuid references public.resume_vault(id) on delete set null,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create index if not exists idx_applications_user_id       on public.applications(user_id, status);
create index if not exists idx_applications_follow_up     on public.applications(follow_up_date);

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 13. LINKEDIN SHARES
-- rules.md §8: never auto-post; prompt once per milestone; skipped = never re-prompt
-- ============================================================
create table if not exists public.linkedin_shares (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  linked_type  text check (linked_type in ('phase','project_reminder','cert','milestone')),
  linked_id    uuid,
  post_text    text,
  image_url    text,
  posted_date  timestamptz,
  status       text check (status in ('draft','posted','skipped')) default 'draft' not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  -- rules.md §8: one prompt per milestone instance — unique on (user_id, linked_type, linked_id)
  constraint linkedin_shares_unique_milestone unique (user_id, linked_type, linked_id)
);

create index if not exists idx_linkedin_shares_user_id   on public.linkedin_shares(user_id, status);
create index if not exists idx_linkedin_shares_linked_id on public.linkedin_shares(linked_id);

drop trigger if exists set_linkedin_shares_updated_at on public.linkedin_shares;
create trigger set_linkedin_shares_updated_at
  before update on public.linkedin_shares
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 14. USER SETTINGS
-- rules.md §12: theme hardcoded to 'dark' in v1 (column retained for future)
-- ============================================================
create table if not exists public.user_settings (
  user_id               uuid primary key references auth.users on delete cascade,
  theme                 text check (theme in ('dark','light','system')) default 'dark' not null,
  notifications_enabled boolean default true not null,
  reminder_frequency    text check (reminder_frequency in ('daily','weekly','off')) default 'weekly' not null,
  linkedin_connected    boolean default false not null,
  updated_at            timestamptz default now() not null
);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — Enable on all tables
-- ============================================================
alter table public.phases              enable row level security;
alter table public.topics              enable row level security;
alter table public.resources           enable row level security;
alter table public.project_reminders   enable row level security;
alter table public.prds                enable row level security;
alter table public.certifications      enable row level security;
alter table public.books               enable row level security;
alter table public.networking_contacts enable row level security;
alter table public.daily_habits        enable row level security;
alter table public.resume_vault        enable row level security;
alter table public.focus_sessions      enable row level security;
alter table public.applications        enable row level security;
alter table public.linkedin_shares     enable row level security;
alter table public.user_settings       enable row level security;

-- ============================================================
-- RLS POLICIES — Owner-only access on all 14 tables
-- Each table gets: SELECT, INSERT, UPDATE, DELETE all scoped to auth.uid() = user_id
-- user_settings uses user_id as PK (not a separate user_id column)
-- ============================================================

-- Helper: drop existing policies before recreating (idempotent migration)
do $$ begin
  -- phases
  drop policy if exists "owner_phases" on public.phases;
  -- topics
  drop policy if exists "owner_topics" on public.topics;
  -- resources
  drop policy if exists "owner_resources" on public.resources;
  -- project_reminders
  drop policy if exists "owner_project_reminders" on public.project_reminders;
  -- prds
  drop policy if exists "owner_prds" on public.prds;
  -- certifications
  drop policy if exists "owner_certifications" on public.certifications;
  -- books
  drop policy if exists "owner_books" on public.books;
  -- networking_contacts
  drop policy if exists "owner_networking_contacts" on public.networking_contacts;
  -- daily_habits
  drop policy if exists "owner_daily_habits" on public.daily_habits;
  -- resume_vault
  drop policy if exists "owner_resume_vault" on public.resume_vault;
  -- focus_sessions
  drop policy if exists "owner_focus_sessions" on public.focus_sessions;
  -- applications
  drop policy if exists "owner_applications" on public.applications;
  -- linkedin_shares
  drop policy if exists "owner_linkedin_shares" on public.linkedin_shares;
  -- user_settings
  drop policy if exists "owner_user_settings" on public.user_settings;
  -- Old generic policy name cleanup
  drop policy if exists "Users manage their own rows" on public.phases;
  drop policy if exists "Users manage their own rows" on public.topics;
  drop policy if exists "Users manage their own rows" on public.resources;
  drop policy if exists "Users manage their own rows" on public.project_reminders;
  drop policy if exists "Users manage their own rows" on public.prds;
  drop policy if exists "Users manage their own rows" on public.certifications;
  drop policy if exists "Users manage their own rows" on public.books;
  drop policy if exists "Users manage their own rows" on public.networking_contacts;
  drop policy if exists "Users manage their own rows" on public.daily_habits;
  drop policy if exists "Users manage their own rows" on public.resume_vault;
  drop policy if exists "Users manage their own rows" on public.focus_sessions;
  drop policy if exists "Users manage their own rows" on public.applications;
  drop policy if exists "Users manage their own rows" on public.linkedin_shares;
  drop policy if exists "Users manage their own rows" on public.user_settings;
end $$;

create policy "owner_phases"
  on public.phases for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_topics"
  on public.topics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_resources"
  on public.resources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_project_reminders"
  on public.project_reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_prds"
  on public.prds for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_certifications"
  on public.certifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_books"
  on public.books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_networking_contacts"
  on public.networking_contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_daily_habits"
  on public.daily_habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_resume_vault"
  on public.resume_vault for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_focus_sessions"
  on public.focus_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_applications"
  on public.applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_linkedin_shares"
  on public.linkedin_shares for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_settings: PK is user_id itself
create policy "owner_user_settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
