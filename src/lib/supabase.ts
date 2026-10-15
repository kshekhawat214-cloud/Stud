// ============================================================
// Supabase Client — Stud AI PM Journey Tracker
// Claude Sonnet 4.6 — Backend Owner
// - Typed with Database interface covering all 14 tables
// - Native AsyncStorage session persistence (no broken Platform import)
// - Reads credentials from env vars (never hardcoded)
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// Database TypeScript Types — mirrors schema.sql exactly
// ============================================================
export interface Database {
  public: {
    Tables: {
      phases: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          week_range: string | null;
          description: string | null;
          deliverable: string | null;
          status: 'not_started' | 'in_progress' | 'completed';
          start_date: string | null;
          target_end_date: string | null;
          actual_end_date: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['phases']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['phases']['Insert']>;
      };
      topics: {
        Row: {
          id: string;
          phase_id: string;
          user_id: string;
          title: string;
          status: 'not_started' | 'in_progress' | 'done';
          time_spent_minutes: number;
          notes: string | null;
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
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
      };
      resources: {
        Row: {
          id: string;
          topic_id: string;
          user_id: string;
          title: string;
          url: string;
          type: 'book' | 'video' | 'article' | 'course' | 'youtube' | 'doc';
          source: 'preloaded' | 'user_added';
          status: 'bookmarked' | 'in_progress' | 'completed';
          notes: string | null;
          yt_video_id: string | null;
          yt_thumbnail_url: string | null;
          yt_channel_name: string | null;
          yt_duration_seconds: number | null;
          preview_fetched_at: string | null;
          added_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'id' | 'created_at' | 'updated_at' | 'added_date'> & { id?: string; added_date?: string };
        Update: Partial<Database['public']['Tables']['resources']['Insert']>;
      };
      project_reminders: {
        Row: {
          id: string;
          user_id: string;
          project_name: string;
          mapped_phase_id: string | null;
          scheduled_week_label: string | null;
          action_note: string | null;
          external_link: string | null;
          status: 'upcoming' | 'due_now' | 'done' | 'snoozed';
          reminder_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_reminders']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['project_reminders']['Insert']>;
      };
      prds: {
        Row: {
          id: string;
          user_id: string;
          project_name: string;
          problem_statement: string | null;
          goals: string | null;
          success_metrics: string | null;
          user_personas: string | null;
          functional_requirements: string | null;
          non_functional_requirements: string | null;
          user_stories: Record<string, unknown> | null;
          acceptance_criteria: string | null;
          kpis: string | null;
          created_at: string;
          last_edited: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prds']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_edited'> & { id?: string; last_edited?: string };
        Update: Partial<Database['public']['Tables']['prds']['Insert']>;
      };
      certifications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          priority: 'must_have' | 'good_to_have';
          status: 'not_started' | 'in_progress' | 'completed';
          date_completed: string | null;
          credential_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['certifications']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['certifications']['Insert']>;
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string | null;
          percent_read: number;
          rating: number | null;
          notes: string | null;
          status: 'not_started' | 'reading' | 'finished';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['books']['Insert']>;
      };
      networking_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          role: string | null;
          status: 'to_reach_out' | 'connected' | 'coffee_chat_done' | 'referral_requested';
          linkedin_url: string | null;
          last_contact_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['networking_contacts']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['networking_contacts']['Insert']>;
      };
      daily_habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          streak: number;
          last_completed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_habits']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['daily_habits']['Insert']>;
      };
      resume_vault: {
        Row: {
          id: string;
          user_id: string;
          version_name: string;
          target_roles: string[] | null;
          file_url: string | null;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['resume_vault']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_updated'> & { id?: string; last_updated?: string };
        Update: Partial<Database['public']['Tables']['resume_vault']['Insert']>;
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string | null;
          duration_minutes: number;
          started_at: string;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['focus_sessions']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['focus_sessions']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          role: string | null;
          status: 'not_applied' | 'applied' | 'oa_screen' | 'interview' | 'offer' | 'rejected';
          applied_date: string | null;
          contact_person: string | null;
          notes: string | null;
          follow_up_date: string | null;
          resume_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
      };
      linkedin_shares: {
        Row: {
          id: string;
          user_id: string;
          linked_type: 'phase' | 'project_reminder' | 'cert' | 'milestone' | null;
          linked_id: string | null;
          post_text: string | null;
          image_url: string | null;
          posted_date: string | null;
          status: 'draft' | 'posted' | 'skipped';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['linkedin_shares']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['linkedin_shares']['Insert']>;
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: 'dark' | 'light' | 'system';
          notifications_enabled: boolean;
          reminder_frequency: 'daily' | 'weekly' | 'off';
          linkedin_connected: boolean;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_settings']['Row']> & { user_id: string };
        Update: Partial<Omit<Database['public']['Tables']['user_settings']['Row'], 'user_id'>>;
      };
    };
  };
}

// ============================================================
// Supabase Client Initialization
// ============================================================
const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  '';

const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
    'The app will operate in offline-only mode until these are configured in .env'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder_anon_key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,       // Parse #access_token=... from OAuth redirects
      storage: AsyncStorage,
    },
    global: {
      headers: {
        'x-application-name': 'stud-ai-pm-tracker',
      },
    },
  }
);
