import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Conversation = {
  id: string;
  session_id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
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
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const sessionId = getSessionId();

  // Load conversations list
  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data as Conversation[]);
    setLoadingConversations(false);
  }, [sessionId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
    // Update conversation timestamp
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

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    await supabase.from("conversations").delete().eq("id", conversationId);
    if (activeConversationId === conversationId) setActiveConversationId(null);
    loadConversations();
  }, [activeConversationId, loadConversations]);

  // Update conversation title
  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    await supabase.from("conversations").update({ title }).eq("id", conversationId);
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
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
    updateTitle,
    loadConversations,
  };
}
