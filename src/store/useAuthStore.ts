import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { seedData } from '@/database/seedData';
import { localDb, UserProfileRow } from '@/database/db';
import { Platform } from 'react-native';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider: 'google' | 'linkedin' | 'email' | 'guest';
}

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  onboardingComplete: boolean;
  userProfile: UserProfileRow | null;

  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: any; message?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error: any; message?: string }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithLinkedIn: () => Promise<{ error: any }>;
  signInWithGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (profile: Omit<UserProfileRow, 'created_at' | 'updated_at'>) => Promise<void>;
  resetRole: () => Promise<void>;
}

// -------------------------------------------------------
// Helper: load local profile & decide if onboarding done
// -------------------------------------------------------
async function loadProfileState(userId: string): Promise<{
  onboardingComplete: boolean;
  userProfile: UserProfileRow | null;
}> {
  try {
    const profile = await localDb.user_profiles.get(userId);
    return {
      onboardingComplete: profile?.onboarding_complete === true,
      userProfile: profile ?? null,
    };
  } catch {
    return { onboardingComplete: false, userProfile: null };
  }
}

// -------------------------------------------------------
// Helper: map Supabase user → UserProfile
// -------------------------------------------------------
function mapSupabaseUser(u: any, providerHint?: string): UserProfile {
  const meta = u.user_metadata || {};
  const providerName = providerHint ?? u.app_metadata?.provider ?? 'email';
  return {
    id: u.id,
    email: u.email,
    name: meta.full_name || meta.name || u.email?.split('@')[0] || 'Candidate',
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    provider: providerName.includes('google')
      ? 'google'
      : providerName.includes('linkedin')
      ? 'linkedin'
      : 'email',
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  onboardingComplete: false,
  userProfile: null,

  // -------------------------------------------------------
  // Initialize auth on app mount
  // -------------------------------------------------------
  initializeAuth: async () => {
    try {
      // Listen for OAuth redirects and session changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const u = session.user;
          const mapped = mapSupabaseUser(u);
          const { onboardingComplete, userProfile } = await loadProfileState(u.id);
          set({ session, user: mapped, onboardingComplete, userProfile, isLoading: false });
          // Seed only if onboarding is already complete (role already chosen)
          if (onboardingComplete && userProfile) {
            await seedData(u.id, userProfile.target_role);
          }
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, onboardingComplete: false, userProfile: null, isLoading: false });
        }
      });

      // Initial session check
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = session.user;
        const mapped = mapSupabaseUser(u);
        const { onboardingComplete, userProfile } = await loadProfileState(u.id);
        set({ session, user: mapped, onboardingComplete, userProfile, isLoading: false });
        if (onboardingComplete && userProfile) {
          await seedData(u.id, userProfile.target_role);
        }
      } else {
        set({ user: null, session: null, isLoading: false });
      }
    } catch (e) {
      console.warn('Auth init error:', e);
      set({ user: null, session: null, isLoading: false });
    }
  },

  // -------------------------------------------------------
  // Email sign in
  // -------------------------------------------------------
  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { set({ isLoading: false }); return { error }; }

      if (data.session?.user || data.user) {
        const u = data.session?.user || data.user!;
        const mapped = mapSupabaseUser(u, 'email');
        const { onboardingComplete, userProfile } = await loadProfileState(u.id);
        set({ session: data.session || null, user: mapped, onboardingComplete, userProfile, isLoading: false });
        if (onboardingComplete && userProfile) {
          await seedData(u.id, userProfile.target_role);
        }
        return { error: null };
      }

      set({ isLoading: false });
      return { error: { message: 'Failed to sign in. Please try again.' } };
    } catch (err: any) {
      set({ isLoading: false });
      return { error: { message: err.message || 'Authentication error.' } };
    }
  },

  // -------------------------------------------------------
  // Email sign up
  // -------------------------------------------------------
  signUpWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { set({ isLoading: false }); return { error }; }

      if (data.user || data.session) {
        const u = data.session?.user || data.user!;
        const mapped = mapSupabaseUser(u, 'email');
        // New sign up → onboarding not complete
        set({ session: data.session || null, user: mapped, onboardingComplete: false, userProfile: null, isLoading: false });
        return { error: null };
      }

      set({ isLoading: false });
      return { error: { message: 'Sign up failed.' } };
    } catch (err: any) {
      set({ isLoading: false });
      return { error: { message: err.message || 'Sign up error.' } };
    }
  },

  // -------------------------------------------------------
  // Google OAuth
  // -------------------------------------------------------
  signInWithGoogle: async () => {
    set({ isLoading: true });
    const redirectUrl = Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? window.location.origin : undefined)
      : 'stud://auth/callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) { set({ isLoading: false }); }
    return { error };
  },

  // -------------------------------------------------------
  // LinkedIn OAuth
  // -------------------------------------------------------
  signInWithLinkedIn: async () => {
    set({ isLoading: true });
    const redirectUrl = Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? window.location.origin : undefined)
      : 'stud://auth/callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: redirectUrl },
    });

    if (error) { set({ isLoading: false }); }
    return { error };
  },

  // -------------------------------------------------------
  // Guest mode
  // -------------------------------------------------------
  signInWithGuest: async () => {
    const guestId = 'guest_user_01';
    const { onboardingComplete, userProfile } = await loadProfileState(guestId);
    set({
      user: {
        id: guestId,
        email: 'guest@stud.ai',
        name: 'Guest',
        provider: 'guest',
      },
      onboardingComplete,
      userProfile,
      isLoading: false,
    });
    if (onboardingComplete && userProfile) {
      await seedData(guestId, userProfile.target_role);
    }
  },

  // -------------------------------------------------------
  // Complete onboarding — saves profile, seeds role data
  // -------------------------------------------------------
  completeOnboarding: async (profileData) => {
    const now = new Date().toISOString();
    const profile: UserProfileRow = {
      ...profileData,
      onboarding_complete: true,
      created_at: now,
      updated_at: now,
    };

    // Clear any existing role data before seeding fresh
    const userId = profileData.user_id;
    await localDb.phases.where('user_id').equals(userId).delete();
    await localDb.topics.where('user_id').equals(userId).delete();
    await localDb.resources.where('user_id').equals(userId).delete();
    await localDb.certifications.where('user_id').equals(userId).delete();
    await localDb.daily_habits.where('user_id').equals(userId).delete();
    await localDb.project_reminders.where('user_id').equals(userId).delete();
    await localDb.applications.where('user_id').equals(userId).delete();

    await localDb.user_profiles.put(profile);
    await seedData(userId, profileData.target_role);

    set({ onboardingComplete: true, userProfile: profile });
  },

  // -------------------------------------------------------
  // Reset role — clears profile so onboarding re-appears
  // Does NOT sign out. Same auth session, fresh onboarding.
  // -------------------------------------------------------
  resetRole: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    await localDb.user_profiles.delete(userId);
    set({ onboardingComplete: false, userProfile: null });
  },

  // -------------------------------------------------------
  // Sign out
  // -------------------------------------------------------
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    set({ user: null, session: null, onboardingComplete: false, userProfile: null, isLoading: false });
  },
}));
