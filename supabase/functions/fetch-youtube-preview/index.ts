// ============================================================
// Supabase Edge Function: fetch-youtube-preview
// Claude Sonnet 4.6 — Backend Owner
// backend.md §3: oEmbed-based preview, no API key required
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface OEmbedResponse {
  title: string;
  author_name: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  type: string;
}

interface PreviewResult {
  yt_video_id: string;
  yt_thumbnail_url: string;
  yt_channel_name: string;
  title: string;
}

/**
 * Extracts YouTube video ID from any standard YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      // https://youtu.be/VIDEO_ID
      return parsed.pathname.slice(1).split('?')[0] || null;
    }

    if (hostname === 'youtube.com') {
      // /watch?v=VIDEO_ID
      const v = parsed.searchParams.get('v');
      if (v) return v;

      // /embed/VIDEO_ID or /shorts/VIDEO_ID
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'embed' || pathParts[0] === 'shorts') {
        return pathParts[1] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as { url: string };

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid url parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'URL is not a recognized YouTube video link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch oEmbed — no API key, no quota, per backend.md §3 Option A
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oEmbedRes = await fetch(oEmbedUrl);

    if (!oEmbedRes.ok) {
      return new Response(
        JSON.stringify({ error: `YouTube oEmbed returned ${oEmbedRes.status}: video may be private or unavailable` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oEmbed = await oEmbedRes.json() as OEmbedResponse;

    // Prefer maxresdefault thumbnail (higher resolution) if available
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const result: PreviewResult = {
      yt_video_id: videoId,
      yt_thumbnail_url: thumbnailUrl,
      yt_channel_name: oEmbed.author_name,
      title: oEmbed.title,
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[fetch-youtube-preview] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
