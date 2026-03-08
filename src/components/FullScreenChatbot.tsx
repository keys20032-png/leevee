import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Send, Bot, User, Sparkles, ExternalLink, Volume2, VolumeX,
  Mic, MicOff, GraduationCap, PartyPopper, MessageSquare,
  PenTool, ImageIcon, Download, Phone, ChevronDown, Flame, Swords,
  Paperclip, FileText, Pencil, Copy, Check, Plus, Trash2, Search,
  ThumbsUp, ThumbsDown, PanelLeftOpen, PanelLeftClose, Clock,
  Share2, X, ChevronUp, Link2, MoreHorizontal, RotateCcw,
  Brain, Archive, Undo2, HardDrive, Smartphone, DatabaseZap,
  LogIn, UserCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import logo from "@/assets/safehubhelp-ai-logo.png";
import { detectCrisis, detectLethality, detectDistress } from "@/lib/crisis-detection";
import { haptic } from "@/lib/haptics";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { jsPDF } from "jspdf";
import { useConversations, type ChatMessage } from "@/hooks/use-conversations";
import { useAuth } from "@/hooks/use-auth";
import { useDailyLimit } from "@/hooks/use-daily-limit";

type Message = { role: "user" | "assistant"; content: string; images?: string[]; uploadedImage?: string; metrics?: { ttft: number; total: number; mode: string }; dbId?: string; reaction?: "thumbs_up" | "thumbs_down" | null };
type ChatMode = "default" | "vent" | "academic" | "fun" | "creative" | "debate" | "image";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

const MODE_CONFIG: Record<ChatMode, { label: string; icon: typeof MessageSquare; description: string; gradient: string; emoji: string; prompts: string[] }> = {
  default: {
    label: "General",
    icon: MessageSquare,
    description: "Your space to think out loud. I'll help you figure it out.",
    gradient: "from-primary to-accent",
    emoji: "💭",
    prompts: [
      "Help me organize my thoughts",
      "I need advice on something",
      "Write something for me",
      "Break this down simply",
      "Brainstorm with me",
      "Help me make a decision",
    ],
  },
  vent: {
    label: "Vent",
    icon: Flame,
    description: "No filters. No fixing. Just a safe space to let it out.",
    gradient: "from-red-500 to-orange-600",
    emoji: "🫂",
    prompts: [
      "I need to get something off my chest",
      "Today was really rough",
      "I'm overwhelmed and I don't know why",
      "I just need someone to hear me",
      "Everything feels like too much",
      "I'm angry and I need to let it out",
    ],
  },
  academic: {
    label: "Learn",
    icon: GraduationCap,
    description: "No dumb questions here. Let's learn at your pace.",
    gradient: "from-blue-500 to-cyan-500",
    emoji: "🧠",
    prompts: [
      "Explain this like I'm five",
      "Help me study for my exam",
      "I don't understand this concept",
      "Quiz me on what I've learned",
      "Help me write a thesis",
      "Walk me through this step by step",
    ],
  },
  fun: {
    label: "Play",
    icon: PartyPopper,
    description: "Games, laughs, and good vibes. No rules.",
    gradient: "from-yellow-500 to-orange-500",
    emoji: "✨",
    prompts: [
      "Hit me with a mind-blowing fact",
      "Make me laugh",
      "Give me a riddle I can't solve",
      "Let's play a word game",
      "Tell me something weird and true",
      "Invent something absurd",
    ],
  },
  creative: {
    label: "Create",
    icon: PenTool,
    description: "Let's make something that didn't exist before.",
    gradient: "from-purple-500 to-pink-500",
    emoji: "🎨",
    prompts: [
      "Write me a poem about right now",
      "Help me start a short story",
      "Give me a wild writing prompt",
      "Write a scene from a movie",
      "Help me build a character",
      "Songwriting — let's go",
    ],
  },
  debate: {
    label: "Debate",
    icon: Swords,
    description: "I'll push back on your ideas — respectfully. Let's sharpen your thinking.",
    gradient: "from-amber-500 to-red-500",
    emoji: "⚡",
    prompts: [
      "Change my mind about something",
      "Play devil's advocate",
      "Is this a good idea or am I wrong?",
      "Argue the other side for me",
      "Poke holes in my argument",
      "Let's debate something fun",
    ],
  },
  image: {
    label: "Imagine",
    icon: ImageIcon,
    description: "Describe what you see in your head. I'll bring it to life.",
    gradient: "from-emerald-500 to-teal-500",
    emoji: "🖼️",
    prompts: [
      "A cozy cabin in a snowy forest",
      "A futuristic city at golden hour",
      "Something that doesn't exist yet",
      "My dream room",
      "Abstract art — surprise me",
      "A dragon reading a bedtime story",
    ],
  },
};

const FullScreenChatbot = () => {
  const { user, profile } = useAuth();
  const { isAtLimit, remaining, limit, increment, tier } = useDailyLimit();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<ChatMode>("default");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [mobileModesOpen, setMobileModesOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchIdx, setChatSearchIdx] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentConvoRef = useRef<string | null>(null);

  const {
    conversations,
    trashedConversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    loadMessages,
    saveMessage,
    updateMessageContent,
    setReaction,
    deleteConversation,
    permanentlyDelete,
    restoreConversation,
    loadConversations,
    loadTrash,
    memories,
    addMemory,
    deleteMemory,
    updateMemory,
    exportAllData,
    getSyncCode,
    importSession,
    sessionId,
  } = useConversations();

  const [sidebarTab, setSidebarTab] = useState<"history" | "memory" | "trash">("history");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncInput, setSyncInput] = useState("");
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryValue, setNewMemoryValue] = useState("");
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingMemoryValue, setEditingMemoryValue] = useState("");

  const currentMode = MODE_CONFIG[mode];

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Scroll detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setShowScrollBtn(!atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (!showScrollBtn) scrollToBottom();
  }, [messages]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Load conversation when active changes
  useEffect(() => {
    if (!activeConversationId) return;
    currentConvoRef.current = activeConversationId;
    loadMessages(activeConversationId).then((dbMsgs) => {
      const mapped: Message[] = dbMsgs.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        images: m.images?.length ? m.images : undefined,
        uploadedImage: m.uploaded_image || undefined,
        dbId: m.id,
        reaction: (m.reaction === "thumbs_up" || m.reaction === "thumbs_down") ? m.reaction : null,
      }));
      setMessages(mapped);
      setFollowUps([]);
    });
  }, [activeConversationId, loadMessages]);

  // Speech recognition
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR() as SpeechRecognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Text-to-speech
  const speak = (text: string, index: number) => {
    if (speakingIndex === index) { window.speechSynthesis.cancel(); setSpeakingIndex(null); return; }
    window.speechSynthesis.cancel();
    const clean = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/```[\s\S]*?```/g, "");
    const utter = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate = 1; utter.pitch = 1;
    utter.onend = () => setSpeakingIndex(null);
    utter.onerror = () => setSpeakingIndex(null);
    utteranceRef.current = utter;
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utter);
  };

  const switchMode = (newMode: ChatMode) => {
    if (newMode === mode) return;
    haptic("light");
    setMode(newMode);
    startNewChat();
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    currentConvoRef.current = null;
    setFollowUps([]);
  };

  const MODES = Object.keys(MODE_CONFIG) as ChatMode[];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
    const currentIdx = MODES.indexOf(mode);
    if (dx < 0 && currentIdx < MODES.length - 1) {
      switchMode(MODES[currentIdx + 1]);
    } else if (dx > 0 && currentIdx > 0) {
      switchMode(MODES[currentIdx - 1]);
    }
  };

  // Image generation
  const generateImage = async (prompt: string) => {
    const userMsg: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch(IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Image generation failed." }));
        const isSafety = err.safety === true;
        throw new Error(isSafety ? `⚠️ **Safety Filter**: ${err.error}` : (err.error || "Image generation failed."));
      }
      const data = await resp.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text || "Here's your generated image!", images: data.images || [] }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: e instanceof Error ? e.message : "Sorry, image generation failed." }]);
    }
    setLoading(false);
  };

  // Edit an existing image
  const editImage = async (sourceImage: string, editPrompt: string) => {
    const userMsg: Message = { role: "user", content: `✏️ Edit: ${editPrompt}` };
    setMessages((prev) => [...prev, userMsg]);
    setEditingImage(null);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch(IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ prompt: editPrompt, sourceImage }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Image editing failed." })); throw new Error(err.error || "Image editing failed."); }
      const data = await resp.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text || "Here's your edited image!", images: data.images || [] }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: e instanceof Error ? e.message : "Sorry, image editing failed." }]);
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setPendingImage(reader.result as string); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Export to PDF
  const exportToPDF = (text: string) => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight();
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").replace(/```/g, ""));
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Leevee AI Response", margin, margin);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(new Date().toLocaleString(), margin, margin + 8);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, margin + 12, pageWidth + margin, margin + 12);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(clean, pageWidth);
      let y = margin + 20;
      for (const line of lines) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 6;
      }
      doc.save("leevee-response.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "leevee-response.txt";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Send message
  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if ((!text && !pendingImage) || loading) return;

    // Daily limit gate
    if (isAtLimit) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text || "(image)" },
        {
          role: "assistant",
          content: tier === "free"
            ? "⚡ **Daily limit reached!** You've used all **15 free messages** for today.\n\nUpgrade to **Pro** for 100 messages/day or **Premium** for unlimited access.\n\n[View Plans](/pricing)"
            : "⚡ **Daily limit reached!** You've used all **100 Pro messages** for today.\n\nUpgrade to **Premium** for unlimited access.\n\n[View Plans](/pricing)",
        },
      ]);
      return;
    }

    haptic("medium");

    const msgText = text || (pendingImage ? "What's in this image?" : "");

    // LETHALITY GATE
    if (detectLethality(msgText)) {
      localStorage.setItem("crisis_redirect_time", Date.now().toString());
      setMessages((prev) => [
        ...prev,
        { role: "user", content: msgText, uploadedImage: pendingImage || undefined },
        {
          role: "assistant",
          content:
            "**Leevee is holding this space for you.**\n\nI've noticed things have reached a critical point. My job is to keep you safe, so I'm pausing our chat for 30 minutes.\n\nWhile we wait, please use the **988** button below. You aren't alone, and I'll be here to listen again once we've both had a moment to breathe.\n\n📞 **Call or text 988** — Suicide & Crisis Lifeline (24/7)\n📱 **Text HOME to 741741** — Crisis Text Line\n\n*I'm an AI, and right now you need a real person. Please reach out.* 💙",
        },
      ]);
      setPendingImage(null);
      setTimeout(() => { window.location.href = "https://988lifeline.org/"; }, 4000);
      return;
    }

    const crisisUrl = detectCrisis(msgText);
    if (crisisUrl) {
      localStorage.setItem("crisis_redirect_time", Date.now().toString());
      window.location.href = crisisUrl;
      return;
    }

    if (mode === "image" && !pendingImage) return generateImage(msgText);
    if (mode === "image" && pendingImage) {
      const imgToEdit = pendingImage;
      setPendingImage(null);
      return editImage(imgToEdit, msgText);
    }

    // Ensure we have a conversation
    let convoId = currentConvoRef.current;
    if (!convoId) {
      try {
        convoId = await createConversation(mode, msgText);
        currentConvoRef.current = convoId;
      } catch {
        // Continue without persistence if DB fails
      }
    }

    const userMsg: Message = { role: "user", content: msgText, uploadedImage: pendingImage || undefined };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setFollowUps([]);
    const currentImage = pendingImage;
    setPendingImage(null);
    setLoading(true);
    increment();

    // Save user message to DB
    if (convoId) {
      try {
        const userDbId = await saveMessage(convoId, "user", msgText, [], currentImage || undefined);
        userMsg.dbId = userDbId;
      } catch {}
    }

    let assistantSoFar = "";
    let assistantDbId: string | null = null;
    const startTime = performance.now();
    let ttft: number | null = null;
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: allMessages.slice(-30).map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.uploadedImage ? { imageData: m.uploadedImage } : {}),
          })),
          mode,
          sessionId,
          ...(currentImage ? { imageData: currentImage } : {}),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Failed to connect" }));
        if (errData.moderation) {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ **Content Blocked**: ${errData.error}` }]);
          setLoading(false);
          return;
        }
        throw new Error(errData.error || "Failed to connect");
      }

      if (!resp.body) throw new Error("No response body");

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await resp.json();
        if (json.crisis && json.redirect) { localStorage.setItem("crisis_redirect_time", Date.now().toString()); window.location.href = json.redirect; return; }
        if (json.moderation) {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ **Content Blocked**: ${json.error}` }]);
          setLoading(false);
          return;
        }
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Create assistant message in DB early
      if (convoId) {
        try {
          assistantDbId = await saveMessage(convoId, "assistant", "…");
        } catch {}
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              if (ttft === null) ttft = performance.now() - startTime;
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                const metrics = { ttft: Math.round(ttft!), total: Math.round(performance.now() - startTime), mode };
                if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar, metrics, dbId: assistantDbId || m.dbId } : m);
                return [...prev, { role: "assistant", content: assistantSoFar, metrics, dbId: assistantDbId || undefined }];
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
    setLoading(false);

    // Save final assistant message to DB + extract memories
    if (convoId && assistantDbId && assistantSoFar) {
      // Extract and save any [MEMORY_SAVE] tags
      const memoryPattern = /\[MEMORY_SAVE:\s*key="([^"]+)"\s*value="([^"]+)"\]/g;
      let memMatch;
      let cleanedContent = assistantSoFar;
      while ((memMatch = memoryPattern.exec(assistantSoFar)) !== null) {
        const [fullMatch, memKey, memValue] = memMatch;
        addMemory(memKey, memValue, "auto");
        cleanedContent = cleanedContent.replace(fullMatch, "").trim();
      }
      // Update with cleaned content (without memory tags)
      updateMessageContent(assistantDbId, cleanedContent);
      if (cleanedContent !== assistantSoFar) {
        setMessages((prev) =>
          prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, content: cleanedContent } : m)
        );
      }
    }

    // Generate follow-up suggestions
    if (assistantSoFar) {
      setFollowUps([]);
      generateFollowUps([...allMessages, { role: "assistant", content: assistantSoFar }]);
    }
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `leevee-ai-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyMessage = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      haptic("light");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Toggle reaction
  const toggleReaction = async (msgIndex: number, reactionType: "thumbs_up" | "thumbs_down") => {
    const msg = messages[msgIndex];
    if (!msg?.dbId) return;
    const newReaction = msg.reaction === reactionType ? null : reactionType;
    haptic("light");
    // Optimistic update
    setMessages((prev) =>
      prev.map((m, i) => i === msgIndex ? { ...m, reaction: newReaction } : m)
    );
    await setReaction(msg.dbId, newReaction);
  };

  const generateFollowUps = async (conversationMessages: Message[]) => {
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [
            ...conversationMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: "Based on our conversation, suggest exactly 3 short follow-up questions the user might ask next. Return ONLY a JSON array of 3 strings, nothing else. Example: [\"What are the benefits?\", \"Can you give an example?\", \"How does this compare to alternatives?\"]" },
          ],
          mode: "default",
        }),
      });
      if (!resp.ok || !resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) result += content;
          } catch {}
        }
      }
      const match = result.match(/\[[\s\S]*\]/);
      if (match) {
        const suggestions = JSON.parse(match[0]) as string[];
        setFollowUps(suggestions.slice(0, 3));
      }
    } catch {}
  };

  const markdownComponents = useMemo(() => ({
    a: ({ href, children, ...props }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/30 hover:decoration-primary inline-flex items-center gap-1 transition-colors" {...props}>
        {children}<ExternalLink className="w-3 h-3" />
      </a>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      if (inline) {
        return <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary" {...props}>{children}</code>;
      }
      return (
        <pre className="bg-secondary/80 border border-border rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
          <code {...props}>{children}</code>
        </pre>
      );
    },
    strong: ({ children, ...props }: any) => <strong className="font-semibold text-foreground" {...props}>{children}</strong>,
    p: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    ul: ({ children, ...props }: any) => <ul className="list-disc pl-4 space-y-1 my-1" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal pl-4 space-y-1 my-1" {...props}>{children}</ol>,
    li: ({ children, ...props }: any) => <li className="text-foreground" {...props}>{children}</li>,
    h1: ({ children, ...props }: any) => <span className="text-lg font-bold text-foreground block mt-2 mb-1" {...props}>{children}</span>,
    h2: ({ children, ...props }: any) => <span className="text-base font-bold text-foreground block mt-2 mb-1" {...props}>{children}</span>,
    h3: ({ children, ...props }: any) => <span className="text-sm font-bold text-foreground block mt-1.5 mb-0.5" {...props}>{children}</span>,
    blockquote: ({ children, ...props }: any) => <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic" {...props}>{children}</blockquote>,
    hr: () => <hr className="border-border my-3" />,
    table: ({ children, ...props }: any) => <div className="overflow-x-auto my-2"><table className="min-w-full text-xs border border-border rounded-lg" {...props}>{children}</table></div>,
    th: ({ children, ...props }: any) => <th className="px-3 py-1.5 bg-secondary/50 text-left font-semibold border-b border-border" {...props}>{children}</th>,
    td: ({ children, ...props }: any) => <td className="px-3 py-1.5 border-b border-border/50" {...props}>{children}</td>,
  }), []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter conversations for search
  const filteredConversations = searchHistory
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchHistory.toLowerCase()))
    : conversations;

  // Chat search: find matching message indices
  const chatSearchMatches = useMemo(() => {
    if (!chatSearch.trim()) return [];
    const q = chatSearch.toLowerCase();
    return messages
      .map((m, i) => (m.content.toLowerCase().includes(q) ? i : -1))
      .filter((i) => i !== -1);
  }, [chatSearch, messages]);

  // Navigate search results
  const jumpToSearchMatch = (idx: number) => {
    const el = document.getElementById(`msg-${chatSearchMatches[idx]}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setChatSearchIdx(idx);
  };

  // Export full conversation as text
  const exportAsText = () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : "Leevee"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leevee-conversation.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    setShareMenuOpen(false);
  };

  // Export full conversation as PDF
  const exportConversationPDF = () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Leevee AI Conversation", margin, margin);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(new Date().toLocaleString(), margin, margin + 8);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, margin + 12, pageWidth + margin, margin + 12);
      let y = margin + 20;
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      for (const msg of messages) {
        const label = msg.role === "user" ? "You" : "Leevee";
        const clean = msg.content
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").replace(/```/g, ""));
        doc.setFont("helvetica", "bold");
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(`${label}:`, margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(clean, pageWidth);
        for (const line of lines) {
          if (y > pageHeight - margin) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += 5.5;
        }
        y += 4;
      }
      doc.save("leevee-conversation.pdf");
    } catch {
      exportAsText();
    }
    setShareMenuOpen(false);
  };

  // Copy conversation to clipboard
  const copyConversation = async () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : "Leevee"}: ${m.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      haptic("light");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setShareMenuOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+Shift+N = new chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        startNewChat();
      }
      // Ctrl/Cmd+K = search in chat
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setChatSearchOpen((v) => !v);
        setChatSearch("");
        setChatSearchIdx(0);
      }
      // Ctrl/Cmd+B = toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
      // Escape = close modals
      if (e.key === "Escape") {
        if (chatSearchOpen) { setChatSearchOpen(false); setChatSearch(""); }
        if (mobileModesOpen) setMobileModesOpen(false);
        if (shareMenuOpen) setShareMenuOpen(false);
        if (moreMenuOpen) setMoreMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatSearchOpen, mobileModesOpen, shareMenuOpen, moreMenuOpen]);

  // Confirm before clearing chat with messages
  const confirmNewChat = () => {
    if (messages.length > 0) {
      if (window.confirm("Start a new chat? Your current conversation is saved in history.")) {
        startNewChat();
      }
    } else {
      startNewChat();
    }
  };

  // Retry last message
  const retryLastMessage = () => {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[idx];
    // Remove everything from that point forward
    setMessages((prev) => prev.slice(0, idx));
    setFollowUps([]);
    haptic("light");
    setTimeout(() => sendMessage(lastUserMsg.content), 100);
  };

  return (
    <div className="flex h-full bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm sm:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed sm:relative z-40 h-full w-[80vw] max-w-80 sm:w-80 flex-shrink-0 border-r border-border/50 bg-card flex flex-col animate-message-in">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 py-3.5 sm:py-3 border-b border-border/50">
              <div className="flex items-center gap-0.5">
                {(["history", "memory", "trash"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setSidebarTab(tab); if (tab === "trash") loadTrash(); }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      sidebarTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {tab === "history" && <Clock className="w-3 h-3 inline mr-1" />}
                    {tab === "memory" && <Brain className="w-3 h-3 inline mr-1" />}
                    {tab === "trash" && <Archive className="w-3 h-3 inline mr-1" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {sidebarTab === "history" && (
                  <button
                    onClick={() => { startNewChat(); setSidebarOpen(false); }}
                    className="p-2 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95"
                    aria-label="New chat"
                  >
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* ── History Tab ── */}
            {sidebarTab === "history" && (
              <>
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchHistory}
                      onChange={(e) => setSearchHistory(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/40 rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-1.5 pb-2 space-y-0.5 scrollbar-none">
                  {filteredConversations.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground/50 py-8">
                      {searchHistory ? "No matching chats" : "No conversations yet"}
                    </div>
                  )}
                  {filteredConversations.map((c) => {
                    const modeEmoji = MODE_CONFIG[c.mode as ChatMode]?.emoji || "💭";
                    return (
                      <div
                        key={c.id}
                        className={`group flex items-center gap-2.5 px-3 py-3.5 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                          activeConversationId === c.id
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                        onClick={() => { setActiveConversationId(c.id); setMode(c.mode as ChatMode); setSidebarOpen(false); }}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="text-sm flex-shrink-0">{modeEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] sm:text-xs font-medium truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.title}</p>
                          <p className="text-[11px] sm:text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(c.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                          className="p-2 sm:p-1 rounded-md sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Move to trash"
                        >
                          <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Memory Tab ── */}
            {sidebarTab === "memory" && (
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none">
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Leevee remembers these facts about you across all conversations. Edit or remove anything.
                </p>
                {/* Add memory form */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Label (e.g. 'name')"
                    value={newMemoryKey}
                    onChange={(e) => setNewMemoryKey(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Value (e.g. 'Alex')"
                      value={newMemoryValue}
                      onChange={(e) => setNewMemoryValue(e.target.value)}
                      className="flex-1 bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMemoryKey.trim() && newMemoryValue.trim()) {
                          addMemory(newMemoryKey.trim(), newMemoryValue.trim());
                          setNewMemoryKey(""); setNewMemoryValue("");
                        }
                      }}
                    />
                    <button
                      onClick={() => { if (newMemoryKey.trim() && newMemoryValue.trim()) { addMemory(newMemoryKey.trim(), newMemoryValue.trim()); setNewMemoryKey(""); setNewMemoryValue(""); } }}
                      disabled={!newMemoryKey.trim() || !newMemoryValue.trim()}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-primary-foreground disabled:opacity-30 transition-all active:scale-95"
                      style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Memory list */}
                {memories.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground/40 py-6">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No memories yet</p>
                    <p className="text-[10px] mt-1">Leevee will learn about you as you chat</p>
                  </div>
                )}
                {memories.map((mem) => (
                  <div key={mem.id} className="group bg-secondary/30 rounded-xl px-3 py-2.5 border border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {mem.key}
                          {mem.source === "auto" && <span className="ml-1.5 text-muted-foreground/40 normal-case tracking-normal font-normal">· auto</span>}
                        </p>
                        {editingMemoryId === mem.id ? (
                          <input
                            type="text"
                            value={editingMemoryValue}
                            onChange={(e) => setEditingMemoryValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { updateMemory(mem.id, editingMemoryValue); setEditingMemoryId(null); }
                              if (e.key === "Escape") setEditingMemoryId(null);
                            }}
                            onBlur={() => { updateMemory(mem.id, editingMemoryValue); setEditingMemoryId(null); }}
                            className="w-full bg-background border border-primary/30 rounded px-2 py-1 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30"
                            autoFocus
                          />
                        ) : (
                          <p className="text-xs text-foreground mt-0.5 leading-relaxed">{mem.value}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => { setEditingMemoryId(mem.id); setEditingMemoryValue(mem.value); }}
                          className="p-1 rounded text-muted-foreground/40 hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteMemory(mem.id)}
                          className="p-1 rounded text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Trash Tab ── */}
            {sidebarTab === "trash" && (
              <div className="flex-1 overflow-y-auto px-1.5 pb-2 pt-2 space-y-0.5 scrollbar-none">
                {trashedConversations.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground/40 py-8">
                    <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Trash is empty</p>
                    <p className="text-[10px] mt-1">Deleted conversations appear here for recovery</p>
                  </div>
                )}
                {trashedConversations.map((c) => {
                  const modeEmoji = MODE_CONFIG[c.mode as ChatMode]?.emoji || "💭";
                  return (
                    <div key={c.id} className="group flex items-center gap-2.5 px-3 py-3 sm:py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/60 transition-all">
                      <span className="text-sm flex-shrink-0 opacity-50">{modeEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] sm:text-xs font-medium truncate opacity-60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.title}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                          Deleted {c.deleted_at ? formatDate(c.deleted_at) : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => restoreConversation(c.id)}
                        className="p-1.5 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Restore"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm("Permanently delete? This cannot be undone.")) permanentlyDelete(c.id); }}
                        className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sidebar footer */}
            <div className="border-t border-border/50 px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={exportAllData}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <HardDrive className="w-3 h-3" /> Export All
                </button>
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Smartphone className="w-3 h-3" /> Sync Devices
                </button>
              </div>
              <p className="hidden sm:block text-[10px] text-muted-foreground/40 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ⌘B sidebar · ⌘K search · ⌘⇧N new
              </p>
            </div>
          </aside>
        </>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowSyncModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-card border border-border/60 rounded-2xl shadow-2xl p-6 animate-message-in">
            <h3 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Smartphone className="w-4 h-4 inline mr-2" />Sync Across Devices
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Your sync code links your conversations, memories, and history across devices. Enter it on another device to sync.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 block mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your Sync Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getSyncCode()}
                    readOnly
                    className="flex-1 bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 text-xs text-foreground font-mono select-all focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(getSyncCode()); haptic("light"); }}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 block mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Import From Another Device</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste sync code..."
                    value={syncInput}
                    onChange={(e) => setSyncInput(e.target.value)}
                    className="flex-1 bg-secondary/50 border border-border/40 rounded-lg px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => {
                      if (syncInput.trim() && syncInput.trim() !== getSyncCode()) {
                        if (window.confirm("This will switch to the synced session. Your current local session will be replaced. Continue?")) {
                          importSession(syncInput.trim());
                        }
                      }
                    }}
                    disabled={!syncInput.trim() || syncInput.trim() === getSyncCode()}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-primary-foreground disabled:opacity-30 transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
                  >
                    Sync
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-2 sm:px-5 h-12 sm:h-14 border-b border-border/50 glass glass-border flex-shrink-0 z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors active:scale-95"
              title="Chat history (Ctrl+B)"
              aria-label="Toggle chat history"
            >
              <PanelLeftOpen className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            {/* New chat */}
            <button
              onClick={confirmNewChat}
              className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              title="New chat (Ctrl+Shift+N)"
              aria-label="Start new chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="p-[1.5px] rounded-xl hidden sm:block" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
              <img src={logo} alt="Leevee AI" className="w-8 h-8 rounded-[10px] object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Leevee AI
              </h1>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setMobileModesOpen(!mobileModesOpen)}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-primary-foreground shadow-md min-h-[40px]"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span>{currentMode.emoji}</span>
              <span>{currentMode.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileModesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileModesOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMobileModesOpen(false)} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 max-h-[70vh] overflow-y-auto scrollbar-none rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 p-1.5 animate-message-in">
                  {(Object.keys(MODE_CONFIG) as ChatMode[]).map((key) => {
                    const cfg = MODE_CONFIG[key];
                    const isActive = mode === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { switchMode(key); setMobileModesOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${
                          isActive
                            ? "text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        }`}
                        style={isActive ? { background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" } : { fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        <span className="text-base">{cfg.emoji}</span>
                        <div className="text-left min-w-0">
                          <span className="block leading-tight">{cfg.label}</span>
                          <span className={`block text-[11px] leading-tight mt-0.5 truncate ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>{cfg.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <nav className="hidden sm:flex items-center gap-0.5 overflow-x-auto scrollbar-none -mx-1 px-1">
            {(Object.keys(MODE_CONFIG) as ChatMode[]).map((key) => {
              const cfg = MODE_CONFIG[key];
              const Icon = cfg.icon;
              const isActive = mode === key;
              return (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 min-h-[36px] ${
                    isActive
                      ? "text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" } : { fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="text-sm">{cfg.emoji}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Desktop: show all controls */}
            {messages.length > 0 && (
              <>
                <button
                  onClick={() => { setChatSearchOpen(!chatSearchOpen); setChatSearch(""); setChatSearchIdx(0); }}
                  className={`hidden sm:flex p-2 rounded-lg transition-colors ${chatSearchOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                  title="Search in chat"
                >
                  <Search className="w-4 h-4" />
                </button>
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setShareMenuOpen(!shareMenuOpen)}
                    className={`p-2 rounded-lg transition-colors ${shareMenuOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                    title="Share conversation"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {shareMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShareMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-1 animate-message-in">
                        <button onClick={copyConversation} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          <Copy className="w-3.5 h-3.5" /> Copy to clipboard
                        </button>
                        <button onClick={exportAsText} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          <FileText className="w-3.5 h-3.5" /> Export as .txt
                        </button>
                        <button onClick={exportConversationPDF} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          <Download className="w-3.5 h-3.5" /> Export as PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Mobile: more menu with all features */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`p-2.5 rounded-lg transition-colors active:scale-95 ${moreMenuOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {moreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-1.5 animate-message-in">
                    <button
                      onClick={() => { confirmNewChat(); setMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <Plus className="w-4 h-4" /> New chat
                    </button>
                    {messages.length > 0 && (
                      <>
                        <button
                          onClick={() => { setChatSearchOpen(true); setChatSearch(""); setMoreMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <Search className="w-4 h-4" /> Search messages
                        </button>
                        <button
                          onClick={() => { copyConversation(); setMoreMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <Copy className="w-4 h-4" /> Copy conversation
                        </button>
                        <button
                          onClick={() => { exportAsText(); setMoreMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <FileText className="w-4 h-4" /> Export as .txt
                        </button>
                        <button
                          onClick={() => { exportConversationPDF(); setMoreMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <Download className="w-4 h-4" /> Export as PDF
                        </button>
                      </>
                    )}
                    <div className="mx-2 my-1 h-px bg-border/50" />
                    <button
                      onClick={() => { setSidebarOpen(true); setSidebarTab("memory"); setMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <Brain className="w-4 h-4" /> Memory Bank
                    </button>
                    <button
                      onClick={() => { exportAllData(); setMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <HardDrive className="w-4 h-4" /> Export All Data
                    </button>
                    <button
                      onClick={() => { setShowSyncModal(true); setMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <Smartphone className="w-4 h-4" /> Sync Devices
                    </button>
                    <div className="mx-2 my-1 h-px bg-border/50" />
                    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl">
                      <span className="text-[13px] text-muted-foreground flex-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Theme</span>
                      <ThemeToggle />
                    </div>
                    <div className="mx-2 my-1 h-px bg-border/50" />
                    <a
                      href={user ? "/profile" : "/auth"}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {user ? <UserCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      {user ? (profile?.display_name || "Profile") : "Sign In"}
                    </a>
                  </div>
                </>
              )}
            </div>

            <a
              href="tel:988"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[10px] font-bold tracking-wider uppercase bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25 transition-colors min-h-[36px] sm:min-h-[36px]"
              title="Crisis Line: 988"
            >
              <Phone className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              <span>988</span>
            </a>
            {/* Profile / Login */}
            <a
              href={user ? "/profile" : "/auth"}
              className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              title={user ? (profile?.display_name || "Profile") : "Sign in"}
            >
              {user ? <UserCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </a>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Chat search bar */}
        {chatSearchOpen && (
          <div className="flex items-center gap-2 px-3 sm:px-6 py-2 border-b border-border/50 bg-card/80 backdrop-blur-sm animate-message-in">
            <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search messages..."
              value={chatSearch}
              onChange={(e) => { setChatSearch(e.target.value); setChatSearchIdx(0); }}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              autoFocus
            />
            {chatSearchMatches.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {chatSearchIdx + 1}/{chatSearchMatches.length}
                </span>
                <button
                  onClick={() => { const next = (chatSearchIdx - 1 + chatSearchMatches.length) % chatSearchMatches.length; jumpToSearchMatch(next); }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { const next = (chatSearchIdx + 1) % chatSearchMatches.length; jumpToSearchMatch(next); }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {chatSearch && chatSearchMatches.length === 0 && (
              <span className="text-[10px] text-muted-foreground/50">No results</span>
            )}
            <button
              onClick={() => { setChatSearchOpen(false); setChatSearch(""); }}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-gradient relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-1">

            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center space-y-6 sm:space-y-8 animate-message-in">
                <div className="animate-float">
                  <div className="p-[2px] rounded-3xl" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
                    <div className="bg-background rounded-[22px] p-3">
                      <img src={logo} alt="Leevee AI" className="w-16 h-16 sm:w-14 sm:h-14 rounded-2xl object-cover" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/70 tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {(() => {
                      const h = new Date().getHours();
                      if (h < 5) return "Still up? I'm here. 🌙";
                      if (h < 12) return "Good morning ☀️";
                      if (h < 17) return "Good afternoon 🌤️";
                      if (h < 21) return "Good evening 🌅";
                      return "Hey, night owl 🌙";
                    })()}
                  </p>
                  <h2
                    className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--warm-glow)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {mode === "vent" ? "I'm listening." : mode === "academic" ? "Let's learn something." : mode === "creative" ? "Let's make something." : mode === "debate" ? "Challenge me." : mode === "image" ? "What do you see?" : mode === "fun" ? "Let's play." : "What's on your mind?"}
                  </h2>
                  <p className="text-muted-foreground text-[13px] sm:text-sm max-w-xs sm:max-w-sm mx-auto leading-relaxed px-4 sm:px-0">
                    {currentMode.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-md w-full px-2 sm:px-0">
                  {currentMode.prompts.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="group px-3.5 py-3 text-[12px] sm:text-xs rounded-2xl border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-card transition-all duration-200 text-left flex items-start gap-2 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.97]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <span className="text-primary/40 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5">→</span>
                      <span className="leading-snug">{q}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-[11px] text-muted-foreground/60 px-4">
                  <span>You're not alone</span>
                  <span>·</span>
                  <a href="tel:988" className="text-destructive/70 hover:text-destructive font-medium transition-colors">
                    988 Lifeline
                  </a>
                  <span>·</span>
                  <a href="/crisis-resources" className="hover:text-foreground transition-colors">
                    Resources
                  </a>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} id={`msg-${i}`} className={`flex py-3 sm:py-2 animate-message-in ${msg.role === "user" ? "justify-end" : "justify-start"} ${chatSearch && chatSearchMatches.includes(i) ? "ring-2 ring-primary/40 rounded-2xl" : ""}`}>
                <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col gap-1`}>
                  {msg.uploadedImage && (
                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm mb-1">
                      <img src={msg.uploadedImage} alt="Uploaded" className="w-full max-w-xs rounded-2xl" loading="lazy" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3.5 sm:py-3 text-[15px] sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-2xl rounded-br-md text-primary-foreground shadow-md"
                        : "rounded-2xl rounded-bl-md bg-card border border-border/50 text-foreground shadow-sm"
                    }`}
                    style={msg.role === "user" ? { background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" } : undefined}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                    ) : msg.content}
                  </div>

                  {/* Generated images */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {msg.images.map((imgSrc, imgIdx) => (
                        <div key={imgIdx} className="rounded-2xl overflow-hidden border border-border/50 shadow-lg">
                          <div className="relative group">
                            <img src={imgSrc} alt={`Generated image ${imgIdx + 1}`} className="w-full max-w-md rounded-t-2xl" loading="lazy" />
                            <div className="absolute top-3 right-3 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                              <button
                                onClick={() => setEditingImage(imgSrc)}
                                className="p-2.5 sm:p-2 rounded-xl glass glass-border text-foreground hover:bg-card active:scale-95"
                                title="Edit image"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadImage(imgSrc, imgIdx)}
                                className="p-2.5 sm:p-2 rounded-xl glass glass-border text-foreground hover:bg-card active:scale-95"
                                title="Download image"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {editingImage === imgSrc && (
                            <div className="p-3 bg-card border-t border-border/50 flex gap-2 items-center animate-message-in">
                              <input
                                type="text"
                                placeholder="Describe your edit (e.g. make it sunset)..."
                                className="flex-1 bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                                    editImage(imgSrc, (e.target as HTMLInputElement).value.trim());
                                  }
                                  if (e.key === "Escape") setEditingImage(null);
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingImage(null)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assistant message actions: copy, reactions, speak, PDF */}
                  {msg.role === "assistant" && !msg.images?.length && (
                    <div className="flex items-center gap-0.5 sm:gap-0.5 self-start ml-1 flex-wrap">
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        className="p-2 sm:p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all active:scale-90"
                        aria-label="Copy message"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === i ? <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-green-500" /> : <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                      </button>
                      <button
                        onClick={() => toggleReaction(i, "thumbs_up")}
                        className={`p-2 sm:p-1.5 rounded-lg transition-all active:scale-90 ${
                          msg.reaction === "thumbs_up"
                            ? "text-green-500 bg-green-500/10"
                            : "text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50"
                        }`}
                        aria-label="Thumbs up"
                        title="Good response"
                      >
                        <ThumbsUp className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleReaction(i, "thumbs_down")}
                        className={`p-2 sm:p-1.5 rounded-lg transition-all active:scale-90 ${
                          msg.reaction === "thumbs_down"
                            ? "text-destructive bg-destructive/10"
                            : "text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50"
                        }`}
                        aria-label="Thumbs down"
                        title="Bad response"
                      >
                        <ThumbsDown className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        onClick={() => speak(msg.content, i)}
                        className="p-2 sm:p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all active:scale-90"
                        aria-label={speakingIndex === i ? "Stop speaking" : "Read aloud"}
                      >
                        {speakingIndex === i ? <VolumeX className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                      </button>
                      <button
                        onClick={() => exportToPDF(msg.content)}
                        className="p-2 sm:p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all active:scale-90"
                        aria-label="Download as PDF"
                        title="Download as PDF"
                      >
                        <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                      {msg.metrics && (
                        <span className="ml-1 text-[10px] text-muted-foreground/40 font-mono tabular-nums" title={`TTFT: ${msg.metrics.ttft}ms · Total: ${msg.metrics.total}ms · Mode: ${msg.metrics.mode}`}>
                          ⚡ {msg.metrics.ttft < 1000 ? `${msg.metrics.ttft}ms` : `${(msg.metrics.ttft / 1000).toFixed(1)}s`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Retry button after last assistant error/response */}
            {!loading && messages.length > 1 && messages[messages.length - 1]?.role === "assistant" && (
              <div className="flex items-center gap-2 py-1 pl-1 animate-message-in">
                <button
                  onClick={retryLastMessage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/50 transition-all active:scale-95"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  aria-label="Retry last message"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            {/* Follow-up suggestions */}
            {followUps.length > 0 && !loading && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
              <div className="flex flex-wrap gap-2 py-2 pl-1 animate-message-in">
                {followUps.map((q, qi) => (
                  <button
                    key={qi}
                    onClick={() => { setFollowUps([]); sendMessage(q); }}
                    className="group inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-3.5 sm:py-2 text-[13px] sm:text-xs rounded-xl border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-card transition-all duration-200 hover:shadow-md hover:shadow-primary/5 active:scale-[0.97]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-primary/40 group-hover:text-primary flex-shrink-0 transition-colors" />
                    <span className="leading-snug">{q}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Loading / typing indicator */}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 py-2 animate-message-in">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
                >
                  <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border/50 px-5 py-3.5 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {mode === "image" ? "Generating image…" : "Leevee is thinking…"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scroll to bottom */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 p-2 rounded-full glass glass-border shadow-lg hover:bg-card transition-all z-20 animate-message-in"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 glass flex-shrink-0">
          <div className="max-w-2xl mx-auto px-2 sm:px-6 py-2 sm:py-3">
            {pendingImage && (
              <div className="mb-2 relative inline-block">
                <img src={pendingImage} alt="Upload preview" className="h-20 rounded-xl border border-border/50 shadow-sm" />
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold shadow-md hover:scale-110 transition-transform"
                >
                  ×
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex items-end gap-2.5"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    pendingImage ? "Ask about this image..."
                      : isListening ? "Listening..."
                      : mode === "image" ? "Describe what you want to see..."
                      : "Message Leevee..."
                  }
                  rows={1}
                  className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3.5 pr-12 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none scrollbar-none text-[16px] sm:text-sm"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", maxHeight: "140px" }}
                />
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
                    isListening
                      ? "text-destructive animate-pulse"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                  aria-label={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-5 h-5 sm:w-4 sm:h-4" /> : <Mic className="w-5 h-5 sm:w-4 sm:h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={(!input.trim() && !pendingImage) || loading}
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex-shrink-0 glow-primary"
                style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
              >
                {mode === "image" && !pendingImage ? <ImageIcon className="w-5 h-5 sm:w-4 sm:h-4 text-primary-foreground" /> : <Send className="w-5 h-5 sm:w-4 sm:h-4 text-primary-foreground" />}
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground/30 text-center mt-1.5 sm:mt-2 tracking-wider uppercase flex items-center justify-center gap-2 flex-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span>Leevee AI</span>
              <span className="text-muted-foreground/20">·</span>
              <span>Powered by Gemini</span>
              <span className="text-muted-foreground/20">·</span>
              <a href="/safety" className="hover:text-muted-foreground/60 transition-colors">Safety</a>
              <span className="text-muted-foreground/20">·</span>
              <a href="/vision/ai-web-developer" className="hover:text-muted-foreground/60 transition-colors">Vision</a>
              <span className="text-muted-foreground/20">·</span>
              <a href="/feature-requests" className="hover:text-muted-foreground/60 transition-colors">Ideas</a>
              <span className="text-muted-foreground/20">·</span>
              <a href="/pricing" className="hover:text-muted-foreground/60 transition-colors">Pricing</a>
              <span className="text-muted-foreground/20">·</span>
              <a href="/terms" className="hover:text-muted-foreground/60 transition-colors">Terms</a>
              <span className="text-muted-foreground/20">·</span>
              <a href="/privacy" className="hover:text-muted-foreground/60 transition-colors">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenChatbot;
