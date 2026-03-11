import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SESSION_KEY = "leevee_session_id";

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function setSessionId(id: string) {
  localStorage.setItem(SESSION_KEY, id);
}

/**
 * Creates a Supabase client with the x-session-id header set for RLS policies.
 * Use this for all session-scoped database operations.
 */
export function createSessionClient() {
  const sessionId = getSessionId();
  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-session-id': sessionId,
        },
      },
    }
  );
}

// Singleton session client
let _sessionClient: ReturnType<typeof createSessionClient> | null = null;
let _lastSessionId: string | null = null;

export function getSessionClient() {
  const currentId = getSessionId();
  if (!_sessionClient || _lastSessionId !== currentId) {
    _sessionClient = createSessionClient();
    _lastSessionId = currentId;
  }
  return _sessionClient;
}

export function resetSessionClient() {
  _sessionClient = null;
  _lastSessionId = null;
}
