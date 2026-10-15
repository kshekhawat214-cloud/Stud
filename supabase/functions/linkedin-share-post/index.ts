// ============================================================
// Supabase Edge Function: linkedin-share-post
// Claude Sonnet 4.6 — Backend Owner
// rules.md §8: never auto-post, one prompt per milestone,
//   user must confirm, OAuth token stays server-side only
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ShareRequest {
  user_id: string;
  post_text: string;
  image_url?: string;
  linked_type: 'phase' | 'project_reminder' | 'cert' | 'milestone';
  linked_id: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth: require valid Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify JWT and extract user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid JWT' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as ShareRequest;
    const { post_text, image_url, linked_type, linked_id } = body;

    // Validate required fields
    if (!post_text || !linked_type || !linked_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: post_text, linked_type, linked_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // rules.md §8: Verify LinkedIn is connected for this user
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('linkedin_connected')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.linkedin_connected) {
      return new Response(
        JSON.stringify({
          error: 'LinkedIn not connected. Please connect LinkedIn in Settings first.',
          code: 'LINKEDIN_NOT_CONNECTED',
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // rules.md §8: Check if this milestone was already posted or skipped (unique constraint)
    const { data: existingShare } = await supabaseAdmin
      .from('linkedin_shares')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('linked_type', linked_type)
      .eq('linked_id', linked_id)
      .single();

    if (existingShare?.status === 'posted') {
      return new Response(
        JSON.stringify({ error: 'This milestone has already been shared on LinkedIn.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve LinkedIn OAuth token (stored server-side per backend.md §5)
    // Token is stored in Supabase Vault or Edge Function secrets — never sent to client
    const linkedInAccessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');

    if (!linkedInAccessToken) {
      return new Response(
        JSON.stringify({
          error: 'LinkedIn OAuth token not configured on server. Contact support.',
          code: 'LINKEDIN_TOKEN_MISSING',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build LinkedIn UGC Post payload
    // rules.md §8: user-edited post_text is used verbatim (never auto-generated without user seeing it)
    const ugcPayload: Record<string, unknown> = {
      author: `urn:li:person:${user.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: post_text },
          shareMediaCategory: image_url ? 'IMAGE' : 'NONE',
          ...(image_url ? {
            media: [{
              status: 'READY',
              description: { text: 'Shared from Stud AI PM Journey Tracker' },
              originalUrl: image_url,
            }],
          } : {}),
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const linkedInRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedInAccessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(ugcPayload),
    });

    const linkedInData = await linkedInRes.json();

    if (!linkedInRes.ok) {
      console.error('[linkedin-share-post] LinkedIn API error:', linkedInData);
      return new Response(
        JSON.stringify({ error: 'LinkedIn API rejected the post', details: linkedInData }),
        { status: linkedInRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record successful share in linkedin_shares table
    const shareRecord = {
      user_id: user.id,
      linked_type,
      linked_id,
      post_text,
      image_url: image_url ?? null,
      posted_date: new Date().toISOString(),
      status: 'posted' as const,
    };

    const { error: upsertError } = await supabaseAdmin
      .from('linkedin_shares')
      .upsert(shareRecord, { onConflict: 'user_id,linked_type,linked_id' });

    if (upsertError) {
      console.error('[linkedin-share-post] Failed to record share:', upsertError);
      // Post succeeded on LinkedIn — don't fail the response, just log
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully posted to LinkedIn!',
        linkedin_post_id: linkedInData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[linkedin-share-post] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
