// ============================================================
// Local Dexie Database — Stud AI PM Journey Tracker
// Claude Sonnet 4.6 — Backend Owner
// All 14 tables registered with correct indexes
// Interfaces mirror schema.sql exactly
// ============================================================

import Dexie, { Table } from 'dexie';

// ============================================================
// Row Interfaces — one per table
// ============================================================

export interface PhaseRow {
  id: string;
  user_id: string;
  title: string;
  week_range?: string;
  description?: string;
  deliverable?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  start_date?: string;
  target_end_date?: string;
  actual_end_date?: string;
  sort_order: number;
  created_at?: string;
  updated_at: string;
}

export interface TopicRow {
  id: string;
  phase_id: string;
  user_id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'done';
  time_spent_minutes: number;
  notes?: string;
  skill_area:
    | 'pm_fundamentals'
    | 'agile_execution'
    | 'ai_llm'
    | 'product_analytics'
    | 'product_docs'
    | 'product_design'
    | 'business_strategy'
    | 'portfolio_storytelling'
    | 'interview_readiness';
  sort_order: number;
  created_at?: string;
  updated_at: string;
}

export interface ResourceRow {
  id: string;
  topic_id: string;
  user_id: string;
  title: string;
  url: string;
  type: 'book' | 'video' | 'article' | 'course' | 'youtube' | 'doc';
  source: 'preloaded' | 'user_added';
  status: 'bookmarked' | 'in_progress' | 'completed';
  notes?: string;
  yt_video_id?: string;
  yt_thumbnail_url?: string;
  yt_channel_name?: string;
  yt_duration_seconds?: number;
  preview_fetched_at?: string;
  added_date?: string;
  created_at?: string;
  updated_at: string;
}

export interface ProjectReminderRow {
  id: string;
  user_id: string;
  project_name: string;
  mapped_phase_id?: string;
  scheduled_week_label?: string;
  action_note?: string;
  external_link?: string;
  status: 'upcoming' | 'due_now' | 'done' | 'snoozed';
  reminder_date?: string;
  notes?: string;
  created_at?: string;
  updated_at: string;
}

export interface PrdRow {
  id: string;
  user_id: string;
  project_name: string;
  problem_statement?: string;
  goals?: string;
  success_metrics?: string;
  user_personas?: string;
  functional_requirements?: string;
  non_functional_requirements?: string;
  user_stories?: Record<string, unknown>;
  acceptance_criteria?: string;
  kpis?: string;
  created_at?: string;
  last_edited?: string;
  updated_at: string;
}

export interface CertRow {
  id: string;
  user_id: string;
  name: string;
  priority: 'must_have' | 'good_to_have';
  status: 'not_started' | 'in_progress' | 'completed';
  date_completed?: string;   // required when status = 'completed' (rules.md §7)
  credential_url?: string;
  created_at?: string;
  updated_at: string;
}

export interface BookRow {
  id: string;
  user_id: string;
  title: string;
  author?: string;
  percent_read: number;       // 0–100
  rating?: number;            // 1–5
  notes?: string;
  status: 'not_started' | 'reading' | 'finished';
  created_at?: string;
  updated_at: string;
}

export interface NetworkingContactRow {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  role?: string;
  status: 'to_reach_out' | 'connected' | 'coffee_chat_done' | 'referral_requested';
  linkedin_url?: string;
  last_contact_date?: string;  // rules.md §14: 30-day stale nudge
  notes?: string;
  created_at?: string;
  updated_at: string;
}

export interface DailyHabitRow {
  id: string;
  user_id: string;
  title: string;
  streak: number;              // rules.md §2b: independent per-habit streak
  last_completed_date?: string;
  created_at?: string;
  updated_at: string;
}

export interface ResumeVaultRow {
  id: string;
  user_id: string;
  version_name: string;
  target_roles?: string[];
  file_url?: string;           // Supabase Storage path
  last_updated?: string;
  created_at?: string;
  updated_at: string;
}

export interface FocusSessionRow {
  id: string;
  user_id: string;
  topic_id?: string;           // nullable — rules.md §3
  duration_minutes: number;
  started_at: string;
  ended_at?: string;
  created_at?: string;
  updated_at: string;
}

export interface ApplicationRow {
  id: string;
  user_id: string;
  company: string;
  role?: string;
  status: 'not_applied' | 'applied' | 'oa_screen' | 'interview' | 'offer' | 'rejected';
  applied_date?: string;
  contact_person?: string;
  notes?: string;
  follow_up_date?: string;     // rules.md §9: past date triggers badge
  resume_id?: string;          // FK to resume_vault
  created_at?: string;
  updated_at: string;
}

export interface LinkedInShareRow {
  id: string;
  user_id: string;
  linked_type?: 'phase' | 'project_reminder' | 'cert' | 'milestone';
  linked_id?: string;
  post_text?: string;
  image_url?: string;
  posted_date?: string;
  status: 'draft' | 'posted' | 'skipped';   // rules.md §8: skipped = never re-prompt
  created_at?: string;
  updated_at: string;
}

export interface UserSettingsRow {
  user_id: string;             // PK — one row per user
  theme: 'dark' | 'light' | 'system';   // rules.md §12: hardcoded 'dark' in v1
  notifications_enabled: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'off';
  linkedin_connected: boolean;
  updated_at: string;
}

export interface UserProfileRow {
  user_id: string;             // PK — matches auth user id
  display_name: string;
  target_role: string;         // matches RoleDefinition.id from roles.ts
  goal: 'job' | 'internship' | 'freelance' | 'upskill';
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  onboarding_complete: boolean;
  // LeetCode integration
  leetcode_username?: string;
  lc_easy_solved?: number;
  lc_medium_solved?: number;
  lc_hard_solved?: number;
  lc_total_solved?: number;
  lc_ranking?: number;
  lc_last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CodingProblemRow {
  id: string;                  // e.g. 'lc_1_two_sum'
  title: string;
  slug: string;                // leetcode.com/problems/<slug>
  category: string;            // e.g. 'arrays', 'dynamic_programming', 'sql'
  difficulty: 'easy' | 'medium' | 'hard';
  role_tags: string;           // comma-separated role ids e.g. 'software_engineer,ml_engineer'
  description: string;        // 1-line problem summary
  sort_order: number;
}

export interface ProblemAttemptRow {
  id: string;                  // userId_problemId
  user_id: string;
  problem_id: string;          // FK → CodingProblemRow.id
  status: 'solved' | 'attempted' | 'skipped' | 'unsolved';
  notes?: string;              // personal solution approach notes
  attempted_at?: string;
  solved_at?: string;
  updated_at: string;
}

export interface SyncQueueRow {
  id?: number;                 // auto-increment PK
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  retry_count: number;         // tracks exponential backoff attempts
  created_at: string;
}

// ============================================================
// Dexie Database Class — All 14 tables registered
// ============================================================
class StudDatabase extends Dexie {
  phases!: Table<PhaseRow>;
  topics!: Table<TopicRow>;
  resources!: Table<ResourceRow>;
  project_reminders!: Table<ProjectReminderRow>;
  prds!: Table<PrdRow>;
  certifications!: Table<CertRow>;
  books!: Table<BookRow>;
  networking_contacts!: Table<NetworkingContactRow>;
  daily_habits!: Table<DailyHabitRow>;
  resume_vault!: Table<ResumeVaultRow>;
  focus_sessions!: Table<FocusSessionRow>;
  applications!: Table<ApplicationRow>;
  linkedin_shares!: Table<LinkedInShareRow>;
  user_settings!: Table<UserSettingsRow>;
  user_profiles!: Table<UserProfileRow>;
  coding_problems!: Table<CodingProblemRow>;
  problem_attempts!: Table<ProblemAttemptRow>;
  sync_queue!: Table<SyncQueueRow>;

  constructor() {
    super('StudLocalDatabase');

    this.version(2).stores({
      // Core roadmap
      phases:               'id, user_id, status, sort_order, updated_at',
      topics:               'id, phase_id, user_id, status, skill_area, sort_order, updated_at',
      resources:            'id, topic_id, user_id, type, status, updated_at',
      project_reminders:    'id, user_id, status, mapped_phase_id, reminder_date, updated_at',
      // PM tools
      prds:                 'id, user_id, updated_at',
      certifications:       'id, user_id, status, priority, updated_at',
      books:                'id, user_id, status, updated_at',
      // Career
      networking_contacts:  'id, user_id, status, last_contact_date, updated_at',
      resume_vault:         'id, user_id, updated_at',
      applications:         'id, user_id, status, follow_up_date, resume_id, updated_at',
      // Productivity & Analytics
      daily_habits:         'id, user_id, streak, updated_at',
      focus_sessions:       'id, user_id, topic_id, started_at, updated_at',
      // Social
      linkedin_shares:      'id, user_id, status, linked_id, updated_at',
      // Settings
      user_settings:        'user_id',
      // Sync infrastructure
      sync_queue:           '++id, table_name, record_id, action, created_at',
    });

    // Version 3 — adds user_profiles for multi-role onboarding
    this.version(3).stores({
      phases:               'id, user_id, status, sort_order, updated_at',
      topics:               'id, phase_id, user_id, status, skill_area, sort_order, updated_at',
      resources:            'id, topic_id, user_id, type, status, updated_at',
      project_reminders:    'id, user_id, status, mapped_phase_id, reminder_date, updated_at',
      prds:                 'id, user_id, updated_at',
      certifications:       'id, user_id, status, priority, updated_at',
      books:                'id, user_id, status, updated_at',
      networking_contacts:  'id, user_id, status, last_contact_date, updated_at',
      resume_vault:         'id, user_id, updated_at',
      applications:         'id, user_id, status, follow_up_date, resume_id, updated_at',
      daily_habits:         'id, user_id, streak, updated_at',
      focus_sessions:       'id, user_id, topic_id, started_at, updated_at',
      linkedin_shares:      'id, user_id, status, linked_id, updated_at',
      user_settings:        'user_id',
      sync_queue:           '++id, table_name, record_id, action, created_at',
      // NEW in v3
      user_profiles:        'user_id, target_role, onboarding_complete, updated_at',
    });

    // Version 4 — adds Coding Practice Hub tables
    this.version(4).stores({
      phases:               'id, user_id, status, sort_order, updated_at',
      topics:               'id, phase_id, user_id, status, skill_area, sort_order, updated_at',
      resources:            'id, topic_id, user_id, type, status, updated_at',
      project_reminders:    'id, user_id, status, mapped_phase_id, reminder_date, updated_at',
      prds:                 'id, user_id, updated_at',
      certifications:       'id, user_id, status, priority, updated_at',
      books:                'id, user_id, status, updated_at',
      networking_contacts:  'id, user_id, status, last_contact_date, updated_at',
      resume_vault:         'id, user_id, updated_at',
      applications:         'id, user_id, status, follow_up_date, resume_id, updated_at',
      daily_habits:         'id, user_id, streak, updated_at',
      focus_sessions:       'id, user_id, topic_id, started_at, updated_at',
      linkedin_shares:      'id, user_id, status, linked_id, updated_at',
      user_settings:        'user_id',
      sync_queue:           '++id, table_name, record_id, action, created_at',
      user_profiles:        'user_id, target_role, onboarding_complete, updated_at',
      // NEW in v4
      coding_problems:      'id, category, difficulty, sort_order',
      problem_attempts:     'id, user_id, problem_id, status, updated_at',
    });
  }
}

export const localDb = new StudDatabase();
