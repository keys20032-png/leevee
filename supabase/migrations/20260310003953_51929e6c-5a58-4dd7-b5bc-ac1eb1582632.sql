
-- Fix: Change all RESTRICTIVE RLS policies to PERMISSIVE
-- PostgreSQL requires at least one PERMISSIVE policy to grant access;
-- RESTRICTIVE-only means zero access for non-superuser roles.

-- ============ chat_messages ============
DROP POLICY IF EXISTS "Users can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages" ON public.chat_messages;

CREATE POLICY "Users can read messages" ON public.chat_messages
  AS PERMISSIVE FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = chat_messages.conversation_id
      AND (c.session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)
  ));

CREATE POLICY "Users can insert messages" ON public.chat_messages
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = chat_messages.conversation_id
      AND (c.session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)
  ));

CREATE POLICY "Users can update messages" ON public.chat_messages
  AS PERMISSIVE FOR UPDATE TO public
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = chat_messages.conversation_id
      AND (c.session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)
  ));

CREATE POLICY "Users can delete messages" ON public.chat_messages
  AS PERMISSIVE FOR DELETE TO public
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = chat_messages.conversation_id
      AND (c.session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)
  ));

-- ============ conversations ============
DROP POLICY IF EXISTS "Users can read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

CREATE POLICY "Users can read own conversations" ON public.conversations
  AS PERMISSIVE FOR SELECT TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can insert conversations" ON public.conversations
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can update own conversations" ON public.conversations
  AS PERMISSIVE FOR UPDATE TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can delete own conversations" ON public.conversations
  AS PERMISSIVE FOR DELETE TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

-- ============ contact_submissions ============
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_submissions;

CREATE POLICY "Allow anonymous inserts" ON public.contact_submissions
  AS PERMISSIVE FOR INSERT TO anon
  WITH CHECK (true);

-- ============ feature_request_votes ============
DROP POLICY IF EXISTS "Users can delete own votes" ON public.feature_request_votes;
DROP POLICY IF EXISTS "Users can read own votes" ON public.feature_request_votes;
DROP POLICY IF EXISTS "Users can insert votes" ON public.feature_request_votes;

CREATE POLICY "Users can read own votes" ON public.feature_request_votes
  AS PERMISSIVE FOR SELECT TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can insert votes" ON public.feature_request_votes
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can delete own votes" ON public.feature_request_votes
  AS PERMISSIVE FOR DELETE TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

-- ============ feature_requests ============
DROP POLICY IF EXISTS "Users can update own feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can read own feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can insert feature requests" ON public.feature_requests;

CREATE POLICY "Users can read own feature requests" ON public.feature_requests
  AS PERMISSIVE FOR SELECT TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can insert feature requests" ON public.feature_requests
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can update own feature requests" ON public.feature_requests
  AS PERMISSIVE FOR UPDATE TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  AS PERMISSIVE FOR SELECT TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  AS PERMISSIVE FOR UPDATE TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

-- ============ push_subscriptions ============
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anon can manage own push subscriptions by session" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions
  AS PERMISSIVE FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anon can manage own push subscriptions by session" ON public.push_subscriptions
  AS PERMISSIVE FOR ALL TO public
  USING ((user_id IS NULL) AND (session_id = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text)));

CREATE POLICY "Users can insert own push subscriptions" ON public.push_subscriptions
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));

-- ============ user_memories ============
DROP POLICY IF EXISTS "Users can insert memories" ON public.user_memories;
DROP POLICY IF EXISTS "Users can read memories" ON public.user_memories;
DROP POLICY IF EXISTS "Users can update memories" ON public.user_memories;
DROP POLICY IF EXISTS "Users can delete memories" ON public.user_memories;

CREATE POLICY "Users can read memories" ON public.user_memories
  AS PERMISSIVE FOR SELECT TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can insert memories" ON public.user_memories
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can update memories" ON public.user_memories
  AS PERMISSIVE FOR UPDATE TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));

CREATE POLICY "Users can delete memories" ON public.user_memories
  AS PERMISSIVE FOR DELETE TO public
  USING ((session_id)::text = ((current_setting('request.headers'::text, true))::jsonb ->> 'x-session-id'::text));
