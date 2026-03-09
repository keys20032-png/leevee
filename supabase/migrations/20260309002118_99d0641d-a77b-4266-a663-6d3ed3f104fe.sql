
-- ============================================================
-- FIX: Replace all USING (true) / WITH CHECK (true) policies
-- with session_id-scoped RLS policies.
-- The client sends 'x-session-id' header; Postgres reads it via
-- current_setting('request.headers', true)::jsonb->>'x-session-id'
-- ============================================================

-- ── CONVERSATIONS ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

-- ── CHAT MESSAGES (scoped via conversations join) ────────────
DROP POLICY IF EXISTS "Users can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages" ON public.chat_messages;

CREATE POLICY "Users can read messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
    )
  );

CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
    )
  );

CREATE POLICY "Users can update messages" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
    )
  );

CREATE POLICY "Users can delete messages" ON public.chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
    )
  );

-- ── USER MEMORIES ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read memories" ON public.user_memories;
DROP POLICY IF EXISTS "Users can insert memories" ON public.user_memories;
DROP POLICY IF EXISTS "Users can update memories" ON public.user_memories;
DROP POLICY IF EXISTS "Users can delete memories" ON public.user_memories;

CREATE POLICY "Users can read memories" ON public.user_memories
  FOR SELECT USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

CREATE POLICY "Users can insert memories" ON public.user_memories
  FOR INSERT WITH CHECK (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

CREATE POLICY "Users can update memories" ON public.user_memories
  FOR UPDATE USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

CREATE POLICY "Users can delete memories" ON public.user_memories
  FOR DELETE USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

-- ── PUSH SUBSCRIPTIONS ───────────────────────────────────────
-- Anon policy: scope to matching session_id (not just user_id IS NULL)
DROP POLICY IF EXISTS "Anon can manage own push subscriptions by session" ON public.push_subscriptions;

CREATE POLICY "Anon can manage own push subscriptions by session" ON public.push_subscriptions
  FOR ALL USING (
    user_id IS NULL
    AND session_id = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

-- ── FEATURE REQUESTS ─────────────────────────────────────────
-- Fix: "Users can update own feature requests" was USING (true)
DROP POLICY IF EXISTS "Users can update own feature requests" ON public.feature_requests;

CREATE POLICY "Users can update own feature requests" ON public.feature_requests
  FOR UPDATE USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );

-- ── FEATURE REQUEST VOTES ────────────────────────────────────
-- Fix: "Users can delete own votes" was USING (true)
DROP POLICY IF EXISTS "Users can delete own votes" ON public.feature_request_votes;

CREATE POLICY "Users can delete own votes" ON public.feature_request_votes
  FOR DELETE USING (
    session_id::text = (current_setting('request.headers', true)::jsonb->>'x-session-id')
  );
