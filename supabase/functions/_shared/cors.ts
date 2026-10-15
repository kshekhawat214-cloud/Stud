// ============================================================
// Shared CORS headers for all Stud Edge Functions
// Claude Sonnet 4.6 — Backend Owner
// ============================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
