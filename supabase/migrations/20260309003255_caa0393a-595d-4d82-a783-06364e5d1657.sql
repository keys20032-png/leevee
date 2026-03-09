
-- ================================================================
-- FIX: Prevent session_id leakage via publicly-readable tables
-- that expose the same session IDs used to guard private chat data.
-- ================================================================

-- ── 1. PUBLIC VIEW: feature_requests (strips session_id) ─────────
-- Runs as security definer (postgres owner) so it bypasses the
-- base-table RLS and is always readable by anon/authenticated.
-- session_id is intentionally excluded.
CREATE OR REPLACE VIEW public.feature_requests_public AS
  SELECT
    id,
    title,
    description,
    category,
    status,
    vote_count,
    created_at,
    updated_at
  FROM public.feature_requests
  WHERE status = 'open';

-- Grant anon + authenticated read-only access to the view
GRANT SELECT ON public.feature_requests_public TO anon, authenticated;

-- ── 2. Restrict direct SELECT on the base table to own rows ──────
-- Drops the open "USING (true)" SELECT policy so strangers cannot
-- enumerate other users' session_id values directly.
DROP POLICY IF EXISTS "Anyone can read feature requests" ON public.feature_requests;

CREATE POLICY "Users can read own feature requests" ON public.feature_requests
  FOR SELECT USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

-- ── 3. Scope vote SELECT to the requesting session only ──────────
-- The previous "Anyone can read votes" exposed all session_ids in
-- the votes table. Replace with a session-scoped policy so users
-- can only see their own votes (sufficient to render voted state).
DROP POLICY IF EXISTS "Anyone can read votes" ON public.feature_request_votes;

CREATE POLICY "Users can read own votes" ON public.feature_request_votes
  FOR SELECT USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );
