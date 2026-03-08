import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ExternalLink, Volume2, VolumeX } from "lucide-react";
import logo from "@/assets/safehelphublogo.jpg";
import { detectCrisis } from "@/lib/crisis-detection";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const QUICK_PROMPTS = [
  "Explain quantum computing simply",
  "Help me write a cover letter",
  "Debug my JavaScript code",
  "Give me a healthy meal plan",
  "Brainstorm business ideas",
  "Summarize a topic for me",
];

const FullScreenChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string, index: number) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const clean = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "");
    const utter = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => setSpeakingIndex(null);
    utter.onerror = () => setSpeakingIndex(null);
    utteranceRef.current = utter;
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    // Safety feature: crisis detection redirect
    const crisisUrl = detectCrisis(text);
    if (crisisUrl) {
      localStorage.setItem("safehub_crisis_redirect", "true");
      window.location.href = crisisUrl;
      return;
    }

    const userMsg: Message = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to connect");
      }

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await resp.json();
        if (json.crisis && json.redirect) {
          window.location.href = json.redirect;
          return;
        }
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
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    }

    setLoading(false);
  };

  const renderContent = (text: string) => {
    // Handle code blocks
    const codeBlockParts = text.split(/(```[\s\S]*?```)/g);
    return codeBlockParts.map((segment, si) => {
      const codeMatch = segment.match(/```(\w*)\n?([\s\S]*?)```/);
      if (codeMatch) {
        return (
          <pre key={si} className="bg-secondary/80 border border-border rounded-lg p-3 my-2 overflow-x-auto text-xs">
            <code>{codeMatch[2].trim()}</code>
          </pre>
        );
      }

      // Handle inline formatting
      const parts = segment.split(/(\[.*?\]\(.*?\))/g);
      return parts.map((part, i) => {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={`${si}-${i}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
              {match[1]}
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        }
        // Inline code
        const inlineCodeParts = part.split(/(`[^`]+`)/g);
        return inlineCodeParts.map((icp, k) => {
          const inlineMatch = icp.match(/^`([^`]+)`$/);
          if (inlineMatch) {
            return <code key={`${si}-${i}-${k}`} className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">{inlineMatch[1]}</code>;
          }
          // Bold
          const boldParts = icp.split(/(\*\*.*?\*\*)/g);
          return boldParts.map((bp, j) => {
            const boldMatch = bp.match(/\*\*(.*?)\*\*/);
            if (boldMatch) return <strong key={`${si}-${i}-${k}-${j}`}>{boldMatch[1]}</strong>;
            return <span key={`${si}-${i}-${k}-${j}`}>{bp}</span>;
          });
        });
      });
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div
                className="inline-flex p-[2px] rounded-2xl"
                style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
              >
                <img src={logo} alt="SafeHubHelp logo" className="w-16 h-16 rounded-[14px] object-cover" />
              </div>
              <div className="space-y-2">
                <h1
                  className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  SafeHubHelp AI
                </h1>
                <p className="text-muted-foreground text-sm max-w-md">
                  Your all-purpose AI assistant. Ask me anything — writing, coding, research, brainstorming, and more.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg w-full">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="group px-4 py-3 text-xs rounded-xl border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-secondary transition-all text-left flex items-start gap-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary flex-shrink-0 mt-0.5" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
                >
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="max-w-[75%] flex flex-col gap-1">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speak(msg.content, i)}
                    className="self-start ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    aria-label={speakingIndex === i ? "Stop speaking" : "Read aloud"}
                    title={speakingIndex === i ? "Stop" : "Read aloud"}
                  >
                    {speakingIndex === i ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-primary/20">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
              >
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </form>
          <p className="text-xs text-muted-foreground/50 text-center mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            SafeHubHelp AI · Powered by Gemini
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenChatbot;
