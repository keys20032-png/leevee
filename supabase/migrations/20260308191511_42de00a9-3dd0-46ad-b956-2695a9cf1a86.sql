
-- User memories table for persistent AI memory across conversations
CREATE TABLE public.user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  source text DEFAULT 'auto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast session lookup
CREATE INDEX idx_user_memories_session ON public.user_memories(session_id);

-- Unique constraint to prevent duplicate keys per session
ALTER TABLE public.user_memories ADD CONSTRAINT unique_session_key UNIQUE (session_id, key);

-- Enable RLS
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS policies (open like conversations - session-based, no auth)
CREATE POLICY "Users can read memories" ON public.user_memories FOR SELECT USING (true);
CREATE POLICY "Users can insert memories" ON public.user_memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update memories" ON public.user_memories FOR UPDATE USING (true);
CREATE POLICY "Users can delete memories" ON public.user_memories FOR DELETE USING (true);

-- Add deleted_at column to conversations for soft delete
ALTER TABLE public.conversations ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Add delete policy for chat_messages
CREATE POLICY "Users can delete messages" ON public.chat_messages FOR DELETE USING (true);
