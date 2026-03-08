
-- Conversations table (session-based, no auth required)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  mode TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table with reaction support
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  uploaded_image TEXT,
  reaction TEXT CHECK (reaction IN ('thumbs_up', 'thumbs_down', NULL)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_conversations_session ON public.conversations(session_id);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations (session-based access)
CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (true);

-- RLS policies for chat_messages
CREATE POLICY "Users can read messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update messages" ON public.chat_messages
  FOR UPDATE USING (true);
