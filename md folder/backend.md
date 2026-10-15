# Backend Specification — Stud

## 1. Database Choice: Supabase (PostgreSQL)

**Chosen:** Supabase (managed Postgres + Auth + Storage + Edge Functions + Realtime)

**Why over Firebase/Firestore:**
- Your data is deeply relational (Phase → Topic → Resource, Phase → Project Reminder, Application → Company, Share → Milestone). Postgres joins handle this cleanly; Firestore would need denormalization/duplication everywhere.
- Row Level Security (RLS) gives per-user data isolation for free — important since this may later sync across your PC and phone under one account.
- Edge Functions let you call the YouTube oEmbed endpoint (and optionally the YouTube Data API) server-side, so no API keys ever sit in the mobile app bundle.
- Free tier covers a single-user personal-productivity app comfortably.
- Built-in Auth includes LinkedIn as an OAuth provider (needed for the Share feature).

**Local-first layer:** Pair Supabase with on-device Dexie.js database:
- Web/PC & Expo React Native: **Dexie.js** (`StudLocalDatabase` v2 schema, 14 tables)
- Schema incorporates strict `created_at` and `updated_at` timestamps for all tables
- Sync pattern: Write to Dexie locally first → Sync Queue → Push to Supabase Edge Functions when online.

---

## 2. Schema (PostgreSQL / Supabase)

```sql
-- Phases
create table phases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  week_range text,
  description text,
  deliverable text,
  status text check (status in ('not_started','in_progress','completed')) default 'not_started',
  start_date date,
  target_end_date date,
  actual_end_date date,
  sort_order int,
  created_at timestamptz default now()
);

-- Topics
create table topics (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade,
  user_id uuid references auth.users not null,
  title text not null,
  status text check (status in ('not_started','in_progress','done')) default 'not_started',
  time_spent_minutes int default 0,
  notes text,
  skill_area text, -- maps to skills.md taxonomy, used for radar chart
  sort_order int
);

-- Resources (includes YouTube preview fields)
create table resources (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  type text check (type in ('book','video','article','course','youtube','doc')) not null,
  source text check (source in ('preloaded','user_added')) default 'user_added',
  status text check (status in ('bookmarked','in_progress','completed')) default 'bookmarked',
  notes text,
  -- YouTube preview cache
  yt_video_id text,
  yt_thumbnail_url text,
  yt_channel_name text,
  yt_duration_seconds int,
  preview_fetched_at timestamptz,
  added_date timestamptz default now()
);

-- Project Reminders (replaces the old projects/project_artifacts model)
-- Friday, NOVATrix, Resume Analyzer, and Mock Interview are already-built
-- projects; this table only maps them to a roadmap phase/week and reminds
-- the user when it's time to revisit them. No artifact/completeness tracking.
create table project_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  project_name text not null,
  mapped_phase_id uuid references phases(id),
  scheduled_week_label text,
  action_note text,
  external_link text,
  status text check (status in ('upcoming','due_now','done','snoozed')) default 'upcoming',
  reminder_date date,
  notes text
);

-- PRDs (now references a free-text project_name instead of a projects table,
-- since project_name may reference an already-built project not tracked elsewhere)
create table prds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  project_name text not null,
  problem_statement text,
  goals text,
  success_metrics text,
  user_personas text,
  functional_requirements text,
  non_functional_requirements text,
  user_stories jsonb,
  acceptance_criteria text,
  kpis text,
  created_at timestamptz default now(),
  last_edited timestamptz default now()
);

-- Certifications
create table certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  priority text check (priority in ('must_have','good_to_have')),
  status text check (status in ('not_started','in_progress','completed')) default 'not_started',
  date_completed date,
  credential_url text
);

-- Books
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  author text,
  percent_read int default 0,
  rating int,
  notes text,
  status text check (status in ('not_started','reading','finished')) default 'not_started'
);



-- Networking / Referrals CRM
create table networking_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  company text,
  role text,
  status text check (status in
    ('to_reach_out','connected','coffee_chat_done','referral_requested')) default 'to_reach_out',
  linkedin_url text,
  last_contact_date date,
  notes text
);

-- Daily Habits
create table daily_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  streak int default 0,
  last_completed_date date
);

-- Resume Vault
create table resume_vault (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  version_name text not null,
  target_roles text[], -- array of role tags
  file_url text, -- Supabase Storage path
  last_updated timestamptz default now()
);

-- Focus Timer sessions (feeds Analytics; optionally tied to a topic)
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  topic_id uuid references topics(id), -- nullable: a session can run generically, untied to a topic
  duration_minutes int not null,
  started_at timestamptz not null,
  ended_at timestamptz
);

-- Applications (job CRM)
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  company text not null,
  role text,
  status text check (status in
    ('not_applied','applied','oa_screen','interview','offer','rejected')) default 'not_applied',
  applied_date date,
  contact_person text,
  notes text,
  follow_up_date date
);

-- LinkedIn share log
create table linkedin_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  linked_type text check (linked_type in ('phase','project_reminder','cert','milestone')),
  linked_id uuid,
  post_text text,
  image_url text,
  posted_date timestamptz,
  status text check (status in ('draft','posted','skipped')) default 'draft'
);

-- User settings
create table user_settings (
  user_id uuid primary key references auth.users,
  theme text check (theme in ('dark','light','system')) default 'system',
  notifications_enabled boolean default true,
  reminder_frequency text check (reminder_frequency in ('daily','weekly','off')) default 'weekly',
  linkedin_connected boolean default false
);
```

Enable RLS on every table with a policy like:
```sql
create policy "Users manage their own rows"
on resources for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```
(repeat per table)

---

## 3. YouTube Link Preview System

Goal: when you paste a YouTube URL into a resource, the app auto-fetches title, thumbnail, and channel name — no manual entry.

### Option A (recommended, no API key): YouTube oEmbed
```
GET https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json
```
Returns: `title`, `author_name` (channel), `thumbnail_url`. No API key, no quota limits, no server secret to manage. This alone covers "preview with thumbnail" fully.

### Option B (richer data, needs API key): YouTube Data API v3
```
GET https://www.googleapis.com/youtube/v3/videos?id=VIDEO_ID&part=snippet,contentDetails&key=YOUR_KEY
```
Adds: exact duration, view count, publish date. Requires a Google Cloud API key — **must be called from a Supabase Edge Function**, never from the client, since a client-side key in an APK/web bundle can be extracted and abused.

### Recommended approach
- Use **oEmbed by default** (zero setup, sufficient for previews).
- Wrap it in a Supabase Edge Function `fetch-youtube-preview(url)` anyway, so:
  - You can cache results in the `resources` table (`preview_fetched_at`) and avoid re-fetching every render.
  - You have a single upgrade path to Option B later without changing client code.

### Edge Function pseudocode
```ts
// supabase/functions/fetch-youtube-preview/index.ts
serve(async (req) => {
  const { url } = await req.json();
  const videoId = extractYouTubeId(url);
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  );
  const data = await res.json();
  return new Response(JSON.stringify({
    yt_video_id: videoId,
    yt_thumbnail_url: data.thumbnail_url,
    yt_channel_name: data.author_name,
    title: data.title
  }));
});
```

### Client flow
1. User pastes a YouTube URL in "Add Resource" → type auto-detected as `youtube`.
2. App calls the Edge Function → gets thumbnail/title/channel.
3. Preview card renders immediately (thumbnail + title + channel), saved to `resources` row.
4. Resource Library and Topic detail views show the thumbnail as a preview card (click → opens YouTube).

---


## 5. API Layer

Use Supabase's auto-generated REST/PostgREST + JS client directly from the frontend for CRUD — no custom backend server needed for basic operations:

```js
// Add a resource
await supabase.from('resources').insert({ topic_id, title, url, type: 'youtube', ... });

// Fetch resources for a topic
await supabase.from('resources').select('*').eq('topic_id', topicId);
```

Custom Edge Functions needed for:
- `fetch-youtube-preview` (§3 above)
- `linkedin-share-post` (calls LinkedIn Share API with the stored OAuth token, keeps `w_member_social` token server-side)
- `compute-skill-radar` (optional — can also be computed client-side from topic completion + skill_area tags)

---

## 6. Authentication

- Supabase Auth, single user (you), email/password or magic link is enough — no need for social login except LinkedIn's OAuth being used specifically for the Share feature (separate token, stored in `user_settings`/secure storage, not used for app login).

---

## 7. Sync & Offline Strategy

1. All writes go to local store first (IndexedDB/SQLite) → instant UI update.
2. Background sync queue pushes changes to Supabase when online.
3. Pull latest on app foreground/reconnect.
4. Conflict rule: last-write-wins by `updated_at` timestamp (acceptable for single-user).
5. YouTube preview data is cached locally after first fetch — never re-fetched unless the resource URL changes.

---

## 8. Hosting

- Supabase project (free tier) for DB + Auth + Edge Functions + Storage (for any screenshots attached to case studies/LinkedIn posts).
- Frontend: deploy web build to Vercel/Netlify (free tier); Android build via Expo EAS Build → APK for sideload or Play Store later.
