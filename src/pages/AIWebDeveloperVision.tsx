import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AIWebDeveloperVision = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Back to Leevee">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leevee Vision</h1>
            <p className="text-[10px] text-muted-foreground">Community Ideas</p>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Feature Vision
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            AI-Powered Web Development for Everyone
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A community-submitted vision for making AI meaningfully more accessible to small creators, freelancers, and marginalized users.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
            <span>Community Submission</span>
            <span>·</span>
            <span>March 2026</span>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Picture this: You've spent months having conversations with your AI assistant. It knows your preferences, understands your work style, remembers your ongoing projects, and has become genuinely useful. Then you lose access to your account — maybe you forgot your password, lost your phone, or there was a technical glitch.
          </p>
          <p className="font-semibold text-foreground">Everything's gone.</p>
          <p>
            All those conversations, all that context, all that personalized knowledge — vanished. You're starting from square one with a blank slate AI that doesn't know you at all.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The Problem: AI Memory Is Trapped</h3>
          <p>
            Current AI systems store your conversation history in ways that are tied to your specific account on a specific platform. Lose access to that account, and you lose everything. There's no backup, no recovery, no way to transfer your AI's memory to a new account or different platform.
          </p>
          <p>
            Think about how absurd this is compared to every other type of digital content we create. Your photos? Backed up to iCloud or Google Photos. Your documents? Synced across devices through cloud storage. Your music preferences? Portable across platforms.
          </p>
          <p>
            But your AI conversations — the context that makes AI actually useful to you personally — exists in a fragile, non-portable silo.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The Solution: Cloud-Based AI Memory</h3>
          <p>
            The fix is surprisingly straightforward: treat AI memory like any other valuable digital asset. Store it in the cloud, make it portable, and give users full ownership and control.
          </p>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex gap-3"><span className="text-primary font-bold flex-shrink-0">Transfer it.</span> Lost your account? Your AI memory lives in your personal cloud. Sign into a new account, connect your storage, and your AI immediately remembers everything.</li>
            <li className="flex gap-3"><span className="text-primary font-bold flex-shrink-0">Recover it.</span> Accidentally deleted important conversations? Restore previous versions from backup snapshots.</li>
            <li className="flex gap-3"><span className="text-primary font-bold flex-shrink-0">Edit it.</span> Remove sensitive information or correct things your AI learned incorrectly about you.</li>
            <li className="flex gap-3"><span className="text-primary font-bold flex-shrink-0">Own it.</span> This is your data. Download it, analyze it, or delete it completely at any time.</li>
          </ul>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 my-8">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ✅ Built Into Leevee
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Leevee already implements this vision. Your <strong>Memory Bank</strong> persists what Leevee learns about you. <strong>Export All Data</strong> gives you full ownership. <strong>Device Sync</strong> lets you carry your AI memory anywhere. And <strong>Trash Recovery</strong> means nothing is permanently lost by accident.
            </p>
          </div>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The Next Step: AI Web Development for Creators</h3>
          <p>
            I'm not a professional web developer. I'm a solo creator, working with limited tools and time. Even with Wix or Squarespace, I still have to micromanage SEO, formatting, mobile compatibility, and content hierarchy — often guessing what works.
          </p>
          <p>What I imagine is a system where:</p>
          <ul className="space-y-2">
            <li>I describe my goal or brand vision</li>
            <li>The AI builds a fully editable website layout</li>
            <li>It automatically optimizes pages for search</li>
            <li>It offers suggestions for design, accessibility, and safety moderation tools</li>
            <li>I can approve or tweak things without managing a dozen panels or SEO checklists</li>
          </ul>
          <p>
            This would empower people who are creative but not tech-trained. Especially for those of us who may be flagged, shadowbanned, or ignored by traditional platforms due to our identity, background, or line of work — having an AI partner to navigate these systems is a game-changer.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>What Needs to Happen</h3>
          <ol className="space-y-2">
            <li><strong>Standardized formats</strong> for AI memory that work across different platforms and services</li>
            <li><strong>User-controlled cloud storage</strong> options specifically designed for AI conversation history</li>
            <li><strong>Clear ownership rights</strong> that establish users as the legal owners of their AI interaction data</li>
            <li><strong>Privacy-preserving encryption</strong> so your AI memory is secure even when stored in the cloud</li>
            <li><strong>Interoperability</strong> between different AI platforms so you can take your memory with you when switching services</li>
          </ol>

          <div className="bg-secondary/50 border border-border/50 rounded-2xl p-5 my-8">
            <p className="text-sm text-foreground leading-relaxed italic">
              "AI is too important to keep treating memory as a throwaway feature tied to a single account. Your AI should remember you. And that memory should be yours to keep, transfer, recover, edit, and own — no matter what happens to any individual account or platform."
            </p>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Try Leevee's Memory Features →
          </Link>
          <span>Have your own vision? Share it with us in a chat.</span>
        </div>
      </article>
    </div>
  );
};

export default AIWebDeveloperVision;
