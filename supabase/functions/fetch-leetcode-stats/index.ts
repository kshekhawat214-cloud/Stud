// Supabase Edge Function: fetch-leetcode-stats
// CORS proxy for LeetCode's public GraphQL API
// Deployed at: supabase/functions/fetch-leetcode-stats/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

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

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid username parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from LeetCode GraphQL (server-side, no CORS restriction)
    const lcResponse = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (compatible; StudCareerOS/1.0)',
      },
      body: JSON.stringify({
        query: STATS_QUERY,
        variables: { username },
      }),
    });

    if (!lcResponse.ok) {
      return new Response(
        JSON.stringify({ error: `LeetCode API responded with ${lcResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const json = await lcResponse.json();
    const matchedUser = json?.data?.matchedUser;

    if (!matchedUser) {
      return new Response(
        JSON.stringify({ error: `LeetCode user "${username}" not found or profile is private.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and return structured stats
    const allQuestionsCount: { difficulty: string; count: number }[] =
      json?.data?.allQuestionsCount ?? [];
    const acSubs: { difficulty: string; count: number }[] =
      matchedUser.submitStats?.acSubmissionNum ?? [];

    const get = (arr: { difficulty: string; count: number }[], key: string) =>
      arr.find((x: { difficulty: string; count: number }) => x.difficulty === key)?.count ?? 0;

    const stats = {
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

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
