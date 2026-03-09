import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionSupabase, getSessionId } from "@/lib/session-supabase";
import { ArrowLeft, ChevronUp, Plus, Lightbulb, TrendingUp, Clock, Filter, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Public view type — session_id intentionally excluded to prevent enumeration
type FeatureRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  created_at: string;
  updated_at: string;
};

const CATEGORIES = [
  { value: "all", label: "All", icon: Filter },
  { value: "ai", label: "AI Features", icon: Lightbulb },
  { value: "accessibility", label: "Accessibility", icon: MessageSquare },
  { value: "safety", label: "Safety", icon: MessageSquare },
  { value: "general", label: "General", icon: MessageSquare },
];

const SORT_OPTIONS = [
  { value: "votes", label: "Most Voted", icon: TrendingUp },
  { value: "newest", label: "Newest", icon: Clock },
];

const FeatureRequests = () => {
  const sessionId = getSessionId();
  // db = session-scoped client; supabase = public read client
  const db = getSessionSupabase();

  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [ownRequestIds, setOwnRequestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");
  const [submitting, setSubmitting] = useState(false);

  // ── Read feature requests from the PUBLIC VIEW (no session_id exposed) ──
  const loadRequests = useCallback(async () => {
    const query = (supabase as any)
      .from("feature_requests_public")
      .select("id, title, description, category, status, vote_count, created_at, updated_at");

    if (filterCategory !== "all") query.eq("category", filterCategory);
    if (sortBy === "votes") query.order("vote_count", { ascending: false });
    else query.order("created_at", { ascending: false });

    const { data } = await query.limit(100);
    if (data) setRequests(data as FeatureRequest[]);
    setLoading(false);
  }, [filterCategory, sortBy]);

  // ── Load the current session's own request IDs (for "yours" badge) ──
  const loadOwnRequestIds = useCallback(async () => {
    const { data } = await db
      .from("feature_requests")
      .select("id")
      .eq("session_id", sessionId);
    if (data) setOwnRequestIds(new Set(data.map((r: any) => r.id as string)));
  }, [sessionId, db]);

  // ── Load which feature requests this session has voted on ──
  const loadVotes = useCallback(async () => {
    const { data } = await db
      .from("feature_request_votes")
      .select("feature_request_id")
      .eq("session_id", sessionId);
    if (data) setVotedIds(new Set(data.map((v: any) => v.feature_request_id as string)));
  }, [sessionId, db]);

  useEffect(() => {
    loadRequests();
    loadVotes();
    loadOwnRequestIds();
  }, [loadRequests, loadVotes, loadOwnRequestIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    if (!trimmedTitle || trimmedTitle.length < 5) {
      toast.error("Title must be at least 5 characters.");
      return;
    }
    if (trimmedTitle.length > 120) {
      toast.error("Title must be under 120 characters.");
      return;
    }
    if (!trimmedDesc || trimmedDesc.length < 15) {
      toast.error("Description must be at least 15 characters.");
      return;
    }
    if (trimmedDesc.length > 1000) {
      toast.error("Description must be under 1000 characters.");
      return;
    }

    setSubmitting(true);
    const { error } = await db
      .from("feature_requests")
      .insert({ session_id: sessionId, title: trimmedTitle, description: trimmedDesc, category });

    if (error) {
      toast.error("Failed to submit. Please try again.");
    } else {
      toast.success("Feature request submitted! 🎉");
      setTitle("");
      setDescription("");
      setCategory("general");
      setShowForm(false);
      await Promise.all([loadRequests(), loadOwnRequestIds()]);
    }
    setSubmitting(false);
  };

  const toggleVote = async (requestId: string) => {
    const hasVoted = votedIds.has(requestId);

    // Optimistic update
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, vote_count: r.vote_count + (hasVoted ? -1 : 1) } : r
      )
    );

    if (hasVoted) {
      const { error } = await db
        .from("feature_request_votes")
        .delete()
        .eq("feature_request_id", requestId)
        .eq("session_id", sessionId);
      if (error) {
        setVotedIds((prev) => { const next = new Set(prev); next.add(requestId); return next; });
        setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, vote_count: r.vote_count + 1 } : r));
      }
    } else {
      const { error } = await db
        .from("feature_request_votes")
        .insert({ feature_request_id: requestId, session_id: sessionId });
      if (error) {
        setVotedIds((prev) => { const next = new Set(prev); next.delete(requestId); return next; });
        setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, vote_count: r.vote_count - 1 } : r));
      }
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "ai": return "bg-accent/20 text-accent-foreground border-accent/30";
      case "accessibility": return "bg-primary/20 text-primary-foreground border-primary/30";
      case "safety": return "bg-destructive/20 text-destructive-foreground border-destructive/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </a>
            <div>
              <h1 className="text-lg font-bold font-display">Feature Requests</h1>
              <p className="text-xs text-muted-foreground">Shape Leevee's future — submit & vote</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Idea</span>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Submit form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-5 space-y-4 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold text-sm">New Feature Request</span>
            </div>
            <Input
              placeholder="Short, clear title for your idea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="bg-background border-border"
            />
            <Textarea
              placeholder="Describe the feature, who it helps, and why it matters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              className="bg-background border-border resize-none"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Category:</span>
              {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    category === c.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{description.length}/1000</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="gap-1.5 bg-primary text-primary-foreground">
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Filters & Sort */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                filterCategory === c.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value as "votes" | "newest")}
                className={`p-1.5 rounded-lg transition-colors ${
                  sortBy === s.value ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                }`}
                title={s.label}
              >
                <s.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">No feature requests yet. Be the first!</p>
            <Button size="sm" onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Submit an Idea
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const hasVoted = votedIds.has(req.id);
              const isOwn = ownRequestIds.has(req.id);
              return (
                <div
                  key={req.id}
                  className="group rounded-xl border border-border bg-card hover:border-primary/20 transition-all duration-200 flex"
                >
                  {/* Vote button */}
                  <button
                    onClick={() => toggleVote(req.id)}
                    className={`flex flex-col items-center justify-center px-4 py-3 border-r border-border transition-colors min-w-[60px] ${
                      hasVoted
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    <ChevronUp className={`w-5 h-5 transition-transform ${hasVoted ? "scale-110" : ""}`} />
                    <span className="text-sm font-bold">{req.vote_count}</span>
                  </button>

                  {/* Content */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground leading-snug flex-1">
                        {req.title}
                        {isOwn && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                            yours
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColor(req.category)}`}>
                        {req.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(req.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">← Back to Leevee</a>
      </footer>
    </div>
  );
};

export default FeatureRequests;
