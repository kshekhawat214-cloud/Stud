# Rules — Stud

Business logic, calculation, and validation rules Antigravity must implement consistently across the app. These rules are the source of truth when `design.md`, `workflow.md`, or `skills.md` are ambiguous about "how a number gets computed" or "what's allowed."

---

## 1. Progress Calculation Rules

- **Topic progress:** binary — `not_started`, `in_progress`, `done`. Only `done` counts toward completion percentages.
- **Phase progress %:** `(topics done in phase / total topics in phase) × 100`, rounded to nearest whole number.
- **Overall roadmap progress %:** `(total topics done across all phases / total topics across all phases) × 100`. NOT a simple average of phase percentages, since phases can have different topic counts.
- **Phase status auto-transition:**
  - `not_started` → `in_progress` automatically the moment any topic in that phase is marked `in_progress` or `done`.
  - `in_progress` → `completed` only when ALL topics are `done` AND the phase's deliverable has been explicitly marked complete by the user (deliverable completion is a manual, deliberate action — never auto-set).
- **Project Reminder status (replaces old project completeness %):** no percentage is calculated. Status is purely date/user-driven:
  - `upcoming` → `due_now` automatically when the current date falls within the `mapped_phase_id`'s week range.
  - `due_now` → `done` or `snoozed` only by explicit user action (never auto-set to done).
  - `snoozed` reminders re-surface once per week until marked `done`, so they don't get silently forgotten.

---

## 2. Streak Rules

There are **two separate streak counters** — do not merge them:

**a) Overall roadmap streak** (shown on Dashboard hero element)
- A "day" counts as active if the user logged ≥1 of: topic status change, a focus timer session ≥5 minutes, resource status change, or PRD edit.
- Increments once per calendar day (user's local timezone), not per session.
- Missing a day resets this streak to 0 the following day (no "streak freeze" in v1).
- Milestones (7, 30, 100 days) are LinkedIn Share trigger events per `workflow.md` §7.

**b) Per-habit streak** (on each `daily_habits` row)
- Each habit tracks its own independent `streak` count, incremented when that specific habit is checked off on a given day.
- A habit streak resets to 0 only for that habit if a day is missed — it does not affect the overall roadmap streak or any other habit's streak.
- Completing a habit still counts toward that day's overall roadmap streak activity (per rule 2a), but a missed habit does not break the overall streak on its own if other activity happened that day.

## 3. Focus Timer Rules

- A focus session may optionally be tied to a `topic_id`. If tied, its duration adds to that topic's `time_spent_minutes` on completion.
- If run untied (no topic selected), the session still counts toward the day's overall streak activity and toward total hours shown in Analytics, just not toward any specific topic's time.
- A session only counts once `ended_at` is set (abandoning a timer mid-session without stopping it does not log partial time).

---

## 4. Skill Radar Score Rules

- Per `skills.md` §1: `skill_area score = (topics done in that area / total topics tagged with that area) × 100`.
- Certification completion adds a flat **+5%** to its mapped skill area, capped so the total never exceeds 100%.
- Score recalculates immediately on any topic/cert status change — never batch-computed or delayed.
- If a skill area has zero tagged topics (shouldn't happen post-seed, but possible after manual roadmap edits), exclude it from the radar chart rather than showing a misleading 0%.

---

## 5. Gap Analysis / Weakest Area Rule

Per `skills.md` §3:
```
weakest = skill area with lowest score
if weakest.score < 40%  → severity = "priority" (red)
if 40% ≤ weakest.score < 70% → severity = "needs_attention" (amber)
if weakest.score ≥ 70% → no callout shown, all areas considered healthy
```
Only ONE weakest-area callout is shown at a time (the single lowest score), not a full ranked list, to avoid overwhelming the dashboard.

---

## 6. Resource Rules

- A resource must belong to exactly one topic (no multi-topic tagging in v1 — keep the model simple).
- `type` is auto-detected from URL where possible:
  - Contains `youtube.com` or `youtu.be` → `youtube`
  - Contains known ebook/PDF patterns → `book` (else user picks manually)
  - Otherwise defaults to `article`, user can override before saving.
- YouTube preview data (`yt_thumbnail_url`, `yt_channel_name`, `yt_video_id`) is fetched once on creation and cached — never re-fetched automatically. Only re-fetch if the user explicitly edits the URL field.
- Deleting a topic cascades to delete its resources (per `backend.md` `on delete cascade`) — app must show a confirmation dialog before this ("This will also delete N resources. Continue?").

---

## 7. Certification Rules

- Marking a cert `completed` requires a `date_completed` value — cannot save as completed with an empty date (validation error shown inline).
- `credential_url` is optional at any status.
- Cert completion is a LinkedIn Share trigger event (see `workflow.md` §7) — fires once per cert, never re-prompts for the same cert.

---

## 8. LinkedIn Share Rules

- Never auto-post without explicit user confirmation on each individual post — no fully automated posting, ever.
- A given milestone (phase/project/cert/streak-threshold) can only trigger the share prompt **once**. If the user dismisses/skips, it is marked `skipped` and never re-prompted for that exact milestone instance.
- If `linkedin_connected = false` in `user_settings`, the share modal instead shows a "Connect LinkedIn to share" CTA rather than a broken post button.
- Post text is always user-editable before sending — the auto-generated draft is a starting point, never sent verbatim without the user seeing it.

---

## 9. Applications Tracker Rules

- Status transitions are freeform (user can move a card to any column at any time, including backward — real hiring processes aren't strictly linear).
- `follow_up_date` in the past on app load triggers a notification badge on the Applications Tracker nav icon (not just a silent overdue state).
- Rejected/Offer are terminal-ish states visually (grayed card) but remain editable — user might get reconsidered or reapply later.

---

## 10. Data Sync & Conflict Rules

- All writes apply to local store immediately (optimistic UI) before confirming against Supabase.
- Sync conflict resolution: last-write-wins based on `updated_at` timestamp — no manual merge UI in v1.
- If offline, all actions queue locally and sync automatically on reconnect; user is shown a subtle "Offline — changes will sync" indicator, never a blocking error.

---

## 11. Roadmap Editing Rules

- Users may add/remove/reorder Phases and Topics at any time — the roadmap is not a fixed, read-only asset.
- Deleting a Phase requires confirmation and cascades to delete its Topics and their Resources (multi-level cascade warning: "This will delete N topics and M resources").
- Every newly created Topic MUST have a `skill_area` assigned at creation (dropdown, not optional) — enforced by form validation, not just convention, to keep the skill radar meaningful (per `skills.md` §5).

---

## 12. Theme Rule

- **Current spec:** The app ships with the AI PM Pathfinder High-Contrast Light Mode SaaS aesthetic (Canvas `#F4F7F9`, Deep Teal `#0D6E6E`, Pure White cards `#FFFFFF`). All components must consume colours strictly from `@/theme/tokens`.

---

## 18. Production Handlers Rule

- **Zero Dead Buttons:** Every button, card, modal action, and icon in production must be bound to a functional `onPress` or `onClick` handler. Empty stubs (`() => {}`) are strictly prohibited in production builds.
- **First-Run Experience:** If the database has 0 records on initial mount, `seedData()` populates default daily habits and project reminders to prevent blank screen syndrome.

## 13. Project Reminder Rules

- Friday, NOVATrix, Resume Analyzer, and Mock Interview are already-built projects — the app never computes a completeness % or tracks artifacts for them (see `design.md` §4.3).
- A single project may have multiple `project_reminders` rows if it's revisited in more than one phase (e.g., Friday appears in both Phase 1 and Phase 3) — each row is tracked independently.
- `status` auto-flips `upcoming` → `due_now` based on the current date vs. the mapped phase's week range (see rule 1 above); it never auto-flips to `done`.
- A `due_now` reminder surfaces on the Dashboard banner every time the app opens until the user marks it `done` or `snoozed`.

## 14. Networking CRM Rules

- If `last_contact_date` is more than 30 days in the past for any contact with status `connected` or `coffee_chat_done`, surface a gentle "reach back out" nudge — do not nudge contacts still at `to_reach_out` (no relationship yet to go stale).
- Status is freeform/manual — never auto-advanced (e.g., adding a LinkedIn URL does not auto-set status to `connected`).

## 15. Resume Vault Rules

- Multiple resume versions may exist simultaneously; there is no single "active" resume — the Applications Tracker just lets the user pick one per application when logging it.
- `last_updated` updates automatically whenever `file_url` changes.

## 16. AI Interview Feedback Rules

- `ai_feedback` is only generated after `user_transcript` is non-empty — never fired on an empty or in-progress recording.
- Feedback generation is a manual "Get Feedback" action, not automatic on every keystroke/save, to avoid unnecessary API calls.
- Cap automatic feedback generation at roughly 20 calls/day per `backend.md` §4, to guard against runaway cost; beyond that, show a "daily limit reached, try again tomorrow" message rather than silently failing.

---

## 14. General Validation Rules

- No required field may be saved empty except where explicitly marked optional in `backend.md`'s schema (e.g., `notes`, `credential_url` are always optional).
- Dates: `target_end_date` cannot be earlier than `start_date` (inline validation error, not a silent save).
- URLs: basic format validation (`https://` prefix) before attempting a YouTube preview fetch or generic resource save.
