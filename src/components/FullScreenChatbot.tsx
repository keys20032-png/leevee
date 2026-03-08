import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Sparkles, ExternalLink, Volume2, VolumeX,
  Mic, MicOff, GraduationCap, PartyPopper, MessageSquare,
  PenTool, ImageIcon, Download, Phone, ChevronDown, Flame, Swords,
  Paperclip, FileText, Pencil,
} from "lucide-react";
import logo from "@/assets/safehubhelp-ai-logo.png";
import { detectCrisis, detectLethality, detectDistress } from "@/lib/crisis-detection";
import { haptic } from "@/lib/haptics";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import jsPDF from "jspdf";

type Message = { role: "user" | "assistant"; content: string; images?: string[]; uploadedImage?: string };
type ChatMode = "default" | "vent" | "academic" | "fun" | "creative" | "debate" | "image";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

const MODE_CONFIG: Record<ChatMode, { label: string; icon: typeof MessageSquare; description: string; gradient: string; prompts: string[] }> = {
  default: {
    label: "General",
    icon: MessageSquare,
    description: "Ask me anything — writing, coding, research, brainstorming, and more.",
    gradient: "from-primary to-accent",
    prompts: [
      "Help me write a cover letter",
      "Debug my JavaScript code",
      "Give me a healthy meal plan",
      "Brainstorm business ideas",
      "Summarize a topic for me",
      "Plan my weekend trip",
    ],
  },
  vent: {
    label: "Vent",
    icon: Flame,
    description: "Let it all out — raw, unfiltered, no judgment. Leevee will listen. 🔥",
    gradient: "from-red-500 to-orange-600",
    prompts: [
      "I just need to rant about my day",
      "Everything is so frustrating right now",
      "I'm so angry I could scream",
      "Let me get this off my chest",
      "Nobody understands what I'm going through",
      "I just need someone to listen",
    ],
  },
  academic: {
    label: "Academic",
    icon: GraduationCap,
    description: "Step-by-step explanations, study strategies, and in-depth learning support.",
    gradient: "from-blue-500 to-cyan-500",
    prompts: [
      "Explain photosynthesis step by step",
      "Help me understand calculus",
      "What caused World War I?",
      "Teach me about DNA replication",
      "Explain supply and demand",
      "Help me write a thesis statement",
    ],
  },
  fun: {
    label: "Fun",
    icon: PartyPopper,
    description: "Jokes, trivia, creative challenges, and learning with flair 🎉",
    gradient: "from-yellow-500 to-orange-500",
    prompts: [
      "Tell me a mind-blowing fact",
      "Write a funny short story",
      "Give me a riddle to solve",
      "Roast my taste in music",
      "Invent a new holiday",
      "Quiz me on random trivia",
    ],
  },
  creative: {
    label: "Creative",
    icon: PenTool,
    description: "Poetry, stories, screenplays, songwriting, and craft coaching ✍️",
    gradient: "from-purple-500 to-pink-500",
    prompts: [
      "Write a poem about the ocean",
      "Help me outline a short story",
      "Give me a writing prompt",
      "Write a movie scene",
      "Help me develop a character",
      "Critique my opening paragraph",
    ],
  },
  debate: {
    label: "Debate",
    icon: Swords,
    description: "Sharpen your thinking — Leevee will respectfully challenge your ideas ⚔️",
    gradient: "from-amber-500 to-red-500",
    prompts: [
      "Is social media good for society?",
      "Should college be free?",
      "Is AI a threat to humanity?",
      "Are zoos ethical?",
      "Should voting be mandatory?",
      "Is capitalism the best system?",
    ],
  },
  image: {
    label: "Image",
    icon: ImageIcon,
    description: "Describe what you want to see and Leevee will create it 🎨",
    gradient: "from-emerald-500 to-teal-500",
    prompts: [
      "A cozy cabin in a snowy forest",
      "Futuristic city at sunset",
      "A cat wearing a tiny hat",
      "Abstract art with vibrant colors",
      "A dragon reading a book",
      "Underwater coral reef scene",
    ],
  },
};

const FullScreenChatbot = () => {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    setMessages([]);
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

    // Only trigger if horizontal swipe is dominant and > 60px
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
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result as string);
    };
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
      
      // Clean markdown
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").replace(/```/g, ""));
      
      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Leevee AI Response", margin, margin);
      
      // Date
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(new Date().toLocaleString(), margin, margin + 8);
      
      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, margin + 12, pageWidth + margin, margin + 12);
      
      // Body text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(clean, pageWidth);
      let y = margin + 20;
      
      for (const line of lines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 6;
      }
      
      doc.save("leevee-response.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      // Fallback: download as .txt
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
    haptic("medium");

    const msgText = text || (pendingImage ? "What's in this image?" : "");

    // LETHALITY GATE — hard block on specific means/methods
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
      setTimeout(() => {
        window.location.href = "https://988lifeline.org/";
      }, 4000);
      return;
    }

    const crisisUrl = detectCrisis(msgText);
    if (crisisUrl) {
      localStorage.setItem("crisis_redirect_time", Date.now().toString());
      window.location.href = crisisUrl;
      return;
    }

    if (mode === "image" && !pendingImage) return generateImage(msgText);

    const userMsg: Message = { role: "user", content: msgText, uploadedImage: pendingImage || undefined };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    const currentImage = pendingImage;
    setPendingImage(null);
    setLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.uploadedImage ? { imageData: m.uploadedImage } : {}),
          })),
          mode,
          ...(currentImage ? { imageData: currentImage } : {}),
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed to connect");

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await resp.json();
        if (json.crisis && json.redirect) { localStorage.setItem("crisis_redirect_time", Date.now().toString()); window.location.href = json.redirect; return; }
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
    setLoading(false);
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `leevee-ai-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Markdown-lite renderer
  const renderContent = (text: string) => {
    const codeBlockParts = text.split(/(```[\s\S]*?```)/g);
    return codeBlockParts.map((segment, si) => {
      const codeMatch = segment.match(/```(\w*)\n?([\s\S]*?)```/);
      if (codeMatch) {
        return (
          <pre key={si} className="bg-secondary/80 border border-border rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
            <code>{codeMatch[2].trim()}</code>
          </pre>
        );
      }
      const parts = segment.split(/(\[.*?\]\(.*?\))/g);
      return parts.map((part, i) => {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={`${si}-${i}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/30 hover:decoration-primary inline-flex items-center gap-1 transition-colors">
              {match[1]}<ExternalLink className="w-3 h-3" />
            </a>
          );
        }
        const inlineCodeParts = part.split(/(`[^`]+`)/g);
        return inlineCodeParts.map((icp, k) => {
          const inlineMatch = icp.match(/^`([^`]+)`$/);
          if (inlineMatch) return <code key={`${si}-${i}-${k}`} className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">{inlineMatch[1]}</code>;
          const boldParts = icp.split(/(\*\*.*?\*\*)/g);
          return boldParts.map((bp, j) => {
            const boldMatch = bp.match(/\*\*(.*?)\*\*/);
            if (boldMatch) return <strong key={`${si}-${i}-${k}-${j}`} className="font-semibold text-foreground">{boldMatch[1]}</strong>;
            return <span key={`${si}-${i}-${k}-${j}`}>{bp}</span>;
          });
        });
      });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };




  return (
    <div className="flex flex-col h-full bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-14 border-b border-border/50 glass glass-border flex-shrink-0 z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-3">
          <div className="p-[1.5px] rounded-xl" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
            <img src={logo} alt="Leevee AI" className="w-9 h-9 sm:w-8 sm:h-8 rounded-[10px] object-cover" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Leevee AI
            </h1>
          </div>
        </div>

        {/* Mode tabs — vertical sheet on mobile, horizontal on desktop */}
        {/* Mobile: current mode button that opens vertical picker */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setMobileModesOpen(!mobileModesOpen)}
            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-primary-foreground shadow-md min-h-[40px]"
            style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {(() => { const Icon = currentMode.icon; return <Icon className="w-4 h-4" />; })()}
            <span>{currentMode.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileModesOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Vertical dropdown */}
          {mobileModesOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMobileModesOpen(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 p-1.5 animate-message-in">
                {(Object.keys(MODE_CONFIG) as ChatMode[]).map((key) => {
                  const cfg = MODE_CONFIG[key];
                  const Icon = cfg.icon;
                  const isActive = mode === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { switchMode(key); setMobileModesOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                      style={isActive ? { background: `linear-gradient(135deg, ${cfg.gradient.split(', ').slice(1).join(', ').replace(')', '')})`, fontFamily: "'Space Grotesk', sans-serif" } : { fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <div className="text-left">
                        <span className="block leading-tight">{cfg.label}</span>
                        <span className={`block text-[11px] leading-tight mt-0.5 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>{cfg.description.slice(0, 40)}…</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Desktop: horizontal tabs */}
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
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <a
            href="tel:988"
            className="inline-flex items-center gap-1 px-3 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[10px] font-bold tracking-wider uppercase bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25 transition-colors min-h-[36px]"
            title="Crisis Line: 988"
          >
            <Phone className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">988</span>
          </a>
          
          <ThemeToggle />
        </div>
      </header>

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
              <div className="space-y-3">
                <h2
                  className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Hey, I'm Leevee
                </h2>
                <p className="text-muted-foreground text-sm sm:text-sm max-w-sm mx-auto leading-relaxed px-4 sm:px-0">
                  {currentMode.description}
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2 max-w-md w-full px-2 sm:px-0">
                {currentMode.prompts.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="group px-4 py-3.5 sm:py-3.5 text-[13px] sm:text-xs rounded-2xl border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-card transition-all duration-200 text-left flex items-start gap-2.5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-primary/40 group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
                    <span className="leading-snug">{q}</span>
                  </button>
                ))}
              </div>

              {/* Crisis info subtle */}
              <div className="flex items-center gap-2 text-xs sm:text-[11px] text-muted-foreground/60">
                <span>In crisis?</span>
                <a href="tel:988" className="text-destructive/70 hover:text-destructive font-medium transition-colors">
                  Call or text 988
                </a>
                <span>·</span>
                <a href="/crisis-resources" className="hover:text-foreground transition-colors">
                  View all resources
                </a>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex py-3 sm:py-2 animate-message-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col gap-1`}>
                {/* Uploaded image preview in user message */}
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
                  {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                </div>

                {/* Generated images */}
                {msg.images && msg.images.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {msg.images.map((imgSrc, imgIdx) => (
                      <div key={imgIdx} className="rounded-2xl overflow-hidden border border-border/50 shadow-lg">
                        <div className="relative group">
                          <img src={imgSrc} alt={`Generated image ${imgIdx + 1}`} className="w-full max-w-md rounded-t-2xl" loading="lazy" />
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => setEditingImage(imgSrc)}
                              className="p-2 rounded-xl glass glass-border text-foreground hover:bg-card"
                              title="Edit image"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadImage(imgSrc, imgIdx)}
                              className="p-2 rounded-xl glass glass-border text-foreground hover:bg-card"
                              title="Download image"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {/* Inline edit prompt for this image */}
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

                {/* Read aloud + PDF download */}
                {msg.role === "assistant" && !msg.images?.length && (
                  <div className="flex items-center gap-1 self-start ml-1">
                    <button
                      onClick={() => speak(msg.content, i)}
                      className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all"
                      aria-label={speakingIndex === i ? "Stop speaking" : "Read aloud"}
                    >
                      {speakingIndex === i ? <VolumeX className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                    </button>
                    <button
                      onClick={() => exportToPDF(msg.content)}
                      className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all"
                      aria-label="Download as PDF"
                      title="Download as PDF"
                    >
                      <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3 py-2 animate-message-in">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
              >
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border/50 px-5 py-3.5 rounded-2xl rounded-bl-md shadow-sm">
                {mode === "image" ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                    </div>
                    <span className="text-xs text-muted-foreground">Generating image…</span>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-primary/50 rounded-full typing-dot" />
                  </div>
                )}
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
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-3">
          {/* Pending image preview */}
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
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex-shrink-0"
              title="Upload image"
            >
              <Paperclip className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
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
              {/* Voice button inside input */}
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
          <p className="text-[10px] text-muted-foreground/30 text-center mt-2 tracking-wider uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Leevee AI · Powered by Gemini
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenChatbot;
