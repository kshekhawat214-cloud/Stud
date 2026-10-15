# Workflows — Stud

Step-by-step interaction flows for every core feature. Antigravity should implement each as a concrete UI flow, not just a data operation.

---

## 1. First Launch / Onboarding
1. User opens app → prompted to sign in (Supabase Auth: email/password or magic link).
2. On first successful login, app seeds default data:
   - 10 Phases + all Topics (from the original roadmap) with `skill_area` tags from `skills.md`
   - Preloaded resources (books, YouTube channels, courses) tagged to their topics
   - Certification list, seeded with the roadmap's cert list
   - Applications tracker seeded with target companies
   - `project_reminders` seeded with the default mapping table from `design.md` §4.3 (Friday/NOVATrix/Resume Analyzer/Mock Interview → their respective phases)
3. Redirect to Dashboard.

---

## 2. Daily Use Flow
1. Open app → Dashboard shows current phase, this week's focus topics, streak.
2. User taps a topic → detail panel opens with resources, notes, timer.
3. User taps "Start" on timer while studying → timer runs in background/foreground.
4. User stops timer → `time_spent_minutes` accumulates on the topic.
5. User marks topic "Done" → checkbox flips, phase progress bar recalculates, skill radar recalculates.
6. If this was the last topic in the phase → prompt: "Mark Phase deliverable complete?" → if yes, trigger LinkedIn Share modal (see Workflow 7).

---

## 3. Adding a Resource (including YouTube)
1. User taps "+ Add Resource" from Resource Library or a Topic detail panel.
2. Form: Title (optional if URL detected), URL, Type (auto-detect: if URL matches `youtube.com`/`youtu.be` → type = `youtube`), Topic tag.
3. If type = `youtube`:
   - On URL paste (debounced), call `fetch-youtube-preview` Edge Function.
   - Preview card renders inline in the form: thumbnail, title, channel name — before saving.
   - User confirms/edits title if desired, taps Save.
4. Resource saved to `resources` table, appears in both the Resource Library and the parent Topic's resource list, with the thumbnail preview shown as a card.
5. If not YouTube, save with generic type icon (book/article/course).

---

## 4. Marking a Resource Complete
1. From Resource Library or Topic detail, user taps status pill on a resource card.
2. Cycles: Bookmarked → In Progress → Completed.
3. No cascading effect on topic status automatically — topic completion is a separate, deliberate user action (user might finish all resources but still want to mark the topic complete manually after doing the deliverable).

---

## 5. Project Reminder Workflow (simplified — no portfolio tracking)
1. Dashboard checks daily whether the current date falls within any `project_reminders.mapped_phase_id`'s week range.
2. If yes → that reminder's `status` flips to `due_now`, a Dashboard banner appears ("🔔 This week: revisit Friday AI Assistant — upgrade with AI Agents"), and a local notification fires once.
3. User opens the Project Reminder Map screen → sees the row, reads the `action_note`, optionally opens the `external_link` (their existing repo/doc for that project — this app does not store the project's actual work).
4. User marks the reminder `done` (task addressed) or `snoozed` (re-surface in a week, per `rules.md` §13).
5. No artifact checklist, no completeness %, no case-study builder lives on this screen — if the user wants to write a case study or PRD for one of these projects, they go to the PRD Builder (below) directly.

---

## 6. PRD Builder Workflow
1. User selects "New PRD" → types/selects a project name (free text or picks from existing project names already used in `project_reminders`/prior PRDs — no dependency on a projects table).
2. Form presented section-by-section (Problem Statement → Goals → Success Metrics → Personas → Functional Reqs → Non-functional Reqs → User Stories → Acceptance Criteria → KPIs).
3. Autosave on each field blur (debounced).
4. "Export" button → generates Markdown or PDF from the filled template.
5. Saved PRD appears in the PRD list view, tagged by `project_name` for easy filtering — it exists independently, not nested under a project record.

---

## 7. LinkedIn Share Workflow
**Trigger events:** phase completed, certification completed, milestone reached (25/50/75/100% roadmap progress, streak milestones e.g. 7/30/100 days). Project Reminders being marked `done` are NOT a share trigger (they're already-built projects, not new accomplishments) — only Phase/Cert/Milestone events fire the share modal.

1. Trigger event fires → modal: "🎉 Share this milestone on LinkedIn?"
2. App auto-generates a draft post (template varies by trigger type — phase completion, cert completion, etc.).
3. User edits text freely; optionally attaches an auto-captured screenshot of the relevant dashboard/case study.
4. User taps "Post Now" → calls `linkedin-share-post` Edge Function → posts via LinkedIn Share API using stored OAuth token.
5. On success: entry saved to `linkedin_shares` with status `posted`; a "Shared ✓" badge appears on the source item (phase/cert/milestone card) to prevent duplicate prompts for the same milestone.
6. User can dismiss without posting → status `skipped`, no re-prompt for that specific milestone (but future new milestones still prompt normally).
7. Manual access: Settings → LinkedIn Share Center shows history + lets user post retroactively for any completed-but-unshared item.

**First-time LinkedIn connection:**
1. Settings → "Connect LinkedIn" → OAuth redirect (OpenID Connect: `openid`, `profile`, `email`, `w_member_social`).
2. On success, token stored securely (never exposed client-side beyond the Edge Function boundary); `linkedin_connected = true` in `user_settings`.

---

## 8. Certifications Workflow
1. User opens Certifications Tracker.
2. Taps a cert row → status dropdown (Not Started/In Progress/Completed).
3. On "Completed" → date picker appears, credential URL field appears, save.
4. Skill radar for the cert's tagged `skill_area` gets a small score boost (see `skills.md` §4).
5. Optionally triggers LinkedIn Share workflow (cert completion is a trigger event).

---

## 9. Interview Prep Workflow (Audio + AI Feedback)
1. User opens Interview Prep → browses framework cards or question bank by category.
2. Taps a framework card → flips to show user's own notes on applying it (editable).
3. Taps a question → detail view with a text transcript field and a recessed **Audio Record** button.
4. User either types an answer directly into the transcript field, or taps Record → speaks → taps Stop → audio uploads to Supabase Storage (`audio_recording_path` saved).
5. If audio was recorded and no transcript exists yet, user taps "Transcribe" → calls `transcribe-interview-answer` Edge Function → `user_transcript` populated (editable after).
6. User taps "Get Feedback" (manual action, never automatic) → calls `generate-interview-feedback` Edge Function → `ai_feedback` populates the AI Feedback Panel.
7. User toggles "Practiced" once satisfied with the answer.
8. Progress bar updates: "X of Y questions practiced."

---

## 10. Applications Tracker Workflow
1. User opens Kanban board (Not Applied → Applied → OA/Screen → Interview → Offer/Rejected).
2. Drags a company card between columns as status changes, or taps card → status dropdown.
3. Card detail: role, contact person, notes, follow-up date.
4. If `follow_up_date` is set and reached → local notification reminder fires: "Follow up with {company}."

---

## 11. Weekly Review Workflow (auto-prompted)
1. Every 7 days (or user-configured cadence), app surfaces a "Weekly Review" card on Dashboard.
2. Shows: topics completed this week, hours logged, resources completed, skill radar delta vs last week.
3. Highlights weakest skill area (per `skills.md` §3 gap analysis rule) with a suggestion to prioritize it next week.
4. User can dismiss or tap "Plan next week" → jumps to Roadmap screen filtered to upcoming topics.

---

## 12. Data Export/Import Workflow
1. Settings → "Export Data" → generates a single JSON file of all tables for the user, downloaded/saved to device.
2. "Import Data" → file picker → validates schema → merges or overwrites (user chooses) into local + remote store.

---

## 13. Editing the Roadmap Itself
1. Settings (or a dedicated "Edit Roadmap" mode on the Roadmap screen) → user can add a new Phase/Topic, reorder via drag, delete, or re-tag a topic's `skill_area`.
2. Changes persist immediately to local store and sync to Supabase — the roadmap is living data, not a fixed asset.

---

## 14. Networking & Referrals Workflow
1. User opens Networking CRM → taps "+ Add Contact" → fills name, company, role, LinkedIn URL, notes.
2. Status starts at `to_reach_out`; user manually advances it (Connected → Coffee Chat Done → Referral Requested) as the relationship progresses — never auto-advanced.
3. `last_contact_date` updates whenever the user logs a new interaction note.
4. If a `connected`/`coffee_chat_done` contact goes 30+ days without contact, a "reach back out" nudge appears on that contact's card (per `rules.md` §14).

---

## 15. Daily Habits Workflow
1. Dashboard shows the Daily Habits widget with each habit as a liquid-glass checkbox.
2. User taps a habit's checkbox → `last_completed_date` set to today, that habit's `streak` increments (if yesterday was also completed) or resets to 1 (if a day was missed).
3. Each habit's streak is independent (see `rules.md` §2b) — missing one habit doesn't reset another's streak or the overall roadmap streak by itself.
4. User can add/remove habits from Settings or directly on the widget ("+ Add Habit").

---

---

## 17. Responsive Layout & First-Run Seeding Workflow
1. App initializes → `seedData()` verifies `daily_habits` and `project_reminders` tables. If empty, default habits (AI newsletter, case study practice, outreach) and project reminders are inserted automatically.
2. Responsive layout engine (`useResponsive`) evaluates window width:
   - On Desktop (`>= 1024px`): Persistent 240px sidebar on left, 3-column dashboard grid.
   - On Tablet (`768px - 1023px`): Persistent 240px sidebar on left, 2-column dashboard grid.
   - On Mobile (`< 768px`): Header hamburger toggle controls slide-over drawer sidebar with dark backdrop. Tapping any item auto-closes the drawer.
3. Floating Focus Timer component renders globally across all screens — appearing only when a focus session has been initiated.
