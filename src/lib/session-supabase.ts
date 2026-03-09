import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SESSION_KEY = "leevee_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Returns a Supabase client configured with the user's session ID as a request
 * header (`x-session-id`). This allows RLS policies to validate ownership by
 * reading `current_setting('request.headers')::jsonb->>'x-session-id'` instead
 * of relying on `USING (true)` which would expose all rows to every user.
 *
 * IMPORTANT: Use this client (not the default one) for any table that is
 * scoped by session_id: conversations, chat_messages, user_memories,
 * push_subscriptions, feature_requests, feature_request_votes.
 */
export function getSessionSupabase() {
  const sessionId = getSessionId();
  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storage: typeof window !== "undefined" ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          "x-session-id": sessionId,
        },
      },
    }
  );
}
