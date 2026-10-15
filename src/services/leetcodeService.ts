// ============================================================
// LeetCode Stats Service — Stud Career OS
// Fetches public profile stats for a given LeetCode username
// Uses Supabase Edge Function as CORS proxy for web platform
// Mobile (React Native): can call LeetCode directly
// ============================================================

import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  ranking: number;
  acceptanceRate: number;
}

// LeetCode public GraphQL query for user stats
const STATS_QUERY = `
  query userPublicProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
        totalSubmissionNum {
          difficulty
          count
        }
      }
      profile {
        ranking
      }
    }
  }
`;

// -------------------------------------------------------
// Fetch via Supabase Edge Function (works on web — no CORS)
// -------------------------------------------------------
async function fetchViaEdgeFunction(username: string): Promise<LeetCodeStats | null> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-leetcode-stats', {
      body: { username },
    });
    if (error) throw error;
    return data as LeetCodeStats;
  } catch (e) {
    console.warn('[LeetCode] Edge function fetch failed:', e);
    return null;
  }
}

// -------------------------------------------------------
// Fetch directly (works on mobile — no CORS restriction)
// -------------------------------------------------------
async function fetchDirectly(username: string): Promise<LeetCodeStats | null> {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: STATS_QUERY,
        variables: { username },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return parseGraphQLResponse(json, username);
  } catch (e) {
    console.warn('[LeetCode] Direct fetch failed:', e);
    return null;
  }
}

// -------------------------------------------------------
// Parse the GraphQL response into LeetCodeStats
// -------------------------------------------------------
export function parseGraphQLResponse(json: any, username: string): LeetCodeStats | null {
  try {
    const matchedUser = json?.data?.matchedUser;
    if (!matchedUser) return null;

    const allQuestionsCount: { difficulty: string; count: number }[] =
      json?.data?.allQuestionsCount ?? [];

    const acSubs: { difficulty: string; count: number }[] =
      matchedUser.submitStats?.acSubmissionNum ?? [];

    const get = (arr: { difficulty: string; count: number }[], key: string) =>
      arr.find((x) => x.difficulty === key)?.count ?? 0;

    return {
      username,
      totalSolved: get(acSubs, 'All'),
      easySolved: get(acSubs, 'Easy'),
      mediumSolved: get(acSubs, 'Medium'),
      hardSolved: get(acSubs, 'Hard'),
      totalQuestions: get(allQuestionsCount, 'All'),
      easyTotal: get(allQuestionsCount, 'Easy'),
      mediumTotal: get(allQuestionsCount, 'Medium'),
      hardTotal: get(allQuestionsCount, 'Hard'),
      ranking: matchedUser.profile?.ranking ?? 0,
      acceptanceRate: 0,
    };
  } catch {
    return null;
  }
}

// -------------------------------------------------------
// Public API — auto-selects strategy by platform
// -------------------------------------------------------
export async function fetchLeetCodeStats(username: string): Promise<{
  data: LeetCodeStats | null;
  error: string | null;
}> {
  if (!username.trim()) {
    return { data: null, error: 'Please enter your LeetCode username.' };
  }

  let data: LeetCodeStats | null = null;

  if (Platform.OS === 'web') {
    // Web must go through edge function to bypass CORS
    data = await fetchViaEdgeFunction(username.trim());
  } else {
    // Mobile can call directly
    data = await fetchDirectly(username.trim());
  }

  if (!data) {
    return {
      data: null,
      error: `Could not fetch stats for "${username}". Check that the username is correct and public.`,
    };
  }

  return { data, error: null };
}
