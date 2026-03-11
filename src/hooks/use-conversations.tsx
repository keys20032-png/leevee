import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Conversation = {
  id: string;
  session_id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  images: string[];
  uploaded_image: string | null;
  reaction: "thumbs_up" | "thumbs_down" | null;
  created_at: string;
};

export type UserMemory = {
  id: string;
  session_id: string;
  key: string;
  value: string;
  source: string;
  created_at: string;
  updated_at: string;
};

const SESSION_KEY = "leevee_session_id";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [trashedConversations, setTrashedConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const sessionId = getSessionId();

  // Set the session ID as a global header for RLS policies
  useEffect(() => {
    supabase.headers = { ...supabase.headers, 'x-session-id': sessionId };
  }, [sessionId]);

  // Load conversations list (exclude soft-deleted)
  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data as Conversation[]);
    setLoadingConversations(false);
  }, [sessionId]);

  // Load trashed conversations
  const loadTrash = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50);
    if (data) setTrashedConversations(data as Conversation[]);
  }, [sessionId]);

  // Load memories
  const loadMemories = useCallback(async () => {
    const { data } = await supabase
      .from("user_memories")
      .select("*")
      .eq("session_id", sessionId)
      .order("updated_at", { ascending: false });
    if (data) setMemories(data as UserMemory[]);
  }, [sessionId]);

  useEffect(() => {
    loadConversations();
    loadMemories();
  }, [loadConversations, loadMemories]);

  // Create new conversation
  const createConversation = useCallback(async (mode: string, firstMessage?: string): Promise<string> => {
    const title = firstMessage
      ? firstMessage.slice(0, 60) + (firstMessage.length > 60 ? "…" : "")
      : "New Chat";
    const { data, error } = await supabase
      .from("conversations")
      .insert({ session_id: sessionId, title, mode })
      .select("id")
      .single();
    if (error || !data) throw new Error("Failed to create conversation");
    const id = (data as any).id as string;
    setActiveConversationId(id);
    loadConversations();
    return id;
  }, [sessionId, loadConversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<ChatMessage[]> => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    return (data || []) as ChatMessage[];
  }, []);

  // Save a message
  const saveMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    images?: string[],
    uploadedImage?: string
  ): Promise<string> => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        images: images || [],
        uploaded_image: uploadedImage || null,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error("Failed to save message");
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
    return (data as any).id as string;
  }, []);

  // Update message content (for streaming)
  const updateMessageContent = useCallback(async (messageId: string, content: string) => {
    await supabase
      .from("chat_messages")
      .update({ content })
      .eq("id", messageId);
  }, []);

  // Set reaction on a message
  const setReaction = useCallback(async (messageId: string, reaction: "thumbs_up" | "thumbs_down" | null) => {
    await supabase
      .from("chat_messages")
      .update({ reaction })
      .eq("id", messageId);
  }, []);

  // Soft-delete a conversation (move to trash)
  const deleteConversation = useCallback(async (conversationId: string) => {
    await supabase
      .from("conversations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", conversationId);
    if (activeConversationId === conversationId) setActiveConversationId(null);
    loadConversations();
  }, [activeConversationId, loadConversations]);

  // Permanently delete a conversation
  const permanentlyDelete = useCallback(async (conversationId: string) => {
    await supabase.from("chat_messages").delete().eq("conversation_id", conversationId);
    await supabase.from("conversations").delete().eq("id", conversationId);
    loadTrash();
  }, [loadTrash]);

  // Restore a trashed conversation
  const restoreConversation = useCallback(async (conversationId: string) => {
    await supabase
      .from("conversations")
      .update({ deleted_at: null })
      .eq("id", conversationId);
    loadConversations();
    loadTrash();
  }, [loadConversations, loadTrash]);

  // Update conversation title
  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    await supabase.from("conversations").update({ title }).eq("id", conversationId);
    loadConversations();
  }, [loadConversations]);

  // ── Memory CRUD ──
  const addMemory = useCallback(async (key: string, value: string, source = "manual") => {
    await supabase
      .from("user_memories")
      .upsert({ session_id: sessionId, key, value, source, updated_at: new Date().toISOString() }, { onConflict: "session_id,key" });
    loadMemories();
  }, [sessionId, loadMemories]);

  const deleteMemory = useCallback(async (id: string) => {
    await supabase.from("user_memories").delete().eq("id", id);
    loadMemories();
  }, [loadMemories]);

  const updateMemory = useCallback(async (id: string, value: string) => {
    await supabase.from("user_memories").update({ value, updated_at: new Date().toISOString() }).eq("id", id);
    loadMemories();
  }, [loadMemories]);

  // Export all data as JSON
  const exportAllData = useCallback(async () => {
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .in("conversation_id", (convos || []).map((c: any) => c.id))
      .order("created_at", { ascending: true });

    const { data: mems } = await supabase
      .from("user_memories")
      .select("*")
      .eq("session_id", sessionId);

    const exportData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      session_id: sessionId,
      conversations: convos || [],
      messages: msgs || [],
      memories: mems || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leevee-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [sessionId]);

  // Generate a sync link (share session ID)
  const getSyncCode = useCallback(() => sessionId, [sessionId]);

  // Import session from sync code
  const importSession = useCallback((newSessionId: string) => {
    localStorage.setItem(SESSION_KEY, newSessionId);
    window.location.reload();
  }, []);

  return {
    conversations,
    trashedConversations,
    activeConversationId,
    setActiveConversationId,
    loadingConversations,
    sessionId,
    createConversation,
    loadMessages,
    saveMessage,
    updateMessageContent,
    setReaction,
    deleteConversation,
    permanentlyDelete,
    restoreConversation,
    updateTitle,
    loadConversations,
    loadTrash,
    memories,
    addMemory,
    deleteMemory,
    updateMemory,
    loadMemories,
    exportAllData,
    getSyncCode,
    importSession,
  };
}
