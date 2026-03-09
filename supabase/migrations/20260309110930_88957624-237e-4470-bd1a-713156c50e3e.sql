
-- Fix feature_requests INSERT policy: validate session_id matches header
DROP POLICY IF EXISTS "Users can insert feature requests" ON public.feature_requests;
CREATE POLICY "Users can insert feature requests"
ON public.feature_requests
FOR INSERT
TO public
WITH CHECK (
  (session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)
);

-- Fix feature_request_votes INSERT policy: validate session_id matches header
DROP POLICY IF EXISTS "Users can insert votes" ON public.feature_request_votes;
CREATE POLICY "Users can insert votes"
ON public.feature_request_votes
FOR INSERT
TO public
WITH CHECK (
  (session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)
);

-- Create daily_usage table for server-side rate limiting
CREATE TABLE IF NOT EXISTS public.daily_usage (
  session_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  message_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, usage_date)
);

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Only service role should access this table (from edge functions)
-- No public policies needed since edge functions use service role key
