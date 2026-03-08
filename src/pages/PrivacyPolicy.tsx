import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {title}
    </h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground">Last updated: March 8, 2026</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm text-foreground leading-relaxed">
            Your privacy matters. This policy explains what data Leevee AI collects, how it's used, and what
            choices you have. We've designed the Service to collect as little data as possible.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p><strong className="text-foreground">Chat Messages</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Messages you send are transmitted to third-party AI providers (Google Gemini) to generate responses</li>
            <li>Chat conversations are <strong className="text-foreground">not stored</strong> after your session ends — when you close the app, your conversation is gone</li>
            <li>We do not maintain chat logs, transcripts, or conversation archives</li>
          </ul>

          <p><strong className="text-foreground">Local Device Storage</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your Digital Safety Plan is stored in your browser's local storage — it never leaves your device</li>
            <li>Theme preferences and language settings are stored locally</li>
            <li>Crisis cooldown timestamps are stored locally to enforce safety pauses</li>
          </ul>

          <p><strong className="text-foreground">Contact Form Submissions</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>If you use the contact form, we collect your name, email, and message</li>
            <li>This information is stored securely and used only to respond to your inquiry</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To generate AI responses to your messages</li>
            <li>To provide crisis detection and safety features</li>
            <li>To respond to contact form inquiries</li>
            <li>To improve the Service (aggregated, anonymized usage patterns only)</li>
          </ul>
        </Section>

        <Section title="3. Crisis Detection Processing">
          <p>
            Crisis detection happens <strong className="text-foreground">on your device</strong> before messages are sent to
            the AI. This means:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your messages are scanned locally using pattern matching — no external service is involved</li>
            <li>If crisis language is detected, you are redirected to professional resources</li>
            <li>No record of crisis detections is transmitted or stored on our servers</li>
          </ul>
          <p>
            Learn more on our <Link to="/safety" className="text-primary hover:underline">Safety & Transparency</Link> page.
          </p>
        </Section>

        <Section title="4. Third-Party Services">
          <p>The Service uses the following third-party providers:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-foreground">Google Gemini</strong> — processes your messages to generate AI responses</li>
            <li><strong className="text-foreground">Hosting infrastructure</strong> — serves the application and backend functions</li>
          </ul>
          <p>
            These providers have their own privacy policies. We do not share your data with any other third parties,
            advertisers, or data brokers.
          </p>
        </Section>

        <Section title="5. Data We Do NOT Collect">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We do not use cookies for tracking or advertising</li>
            <li>We do not collect device fingerprints</li>
            <li>We do not track your location</li>
            <li>We do not build user profiles</li>
            <li>We do not sell or share data with third parties for marketing</li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-foreground">Chat messages:</strong> Not retained — deleted when session ends</li>
            <li><strong className="text-foreground">Local storage data:</strong> Persists until you clear your browser data</li>
            <li><strong className="text-foreground">Contact submissions:</strong> Retained as needed to respond, then deleted</li>
          </ul>
        </Section>

        <Section title="7. Your Rights & Choices">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Clear your local storage data at any time through your browser settings</li>
            <li>Stop using the Service at any time</li>
            <li>Request deletion of any contact form submissions by reaching out to us</li>
          </ul>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            The Service is not intended for children under 13. We do not knowingly collect personal information
            from children under 13. If you believe a child has provided us with personal information, please
            contact us so we can take appropriate action.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be reflected on this page with an
            updated "Last updated" date. Continued use of the Service after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have questions about this Privacy Policy, please reach out through our{" "}
            <Link to="/" className="text-primary hover:underline">contact form</Link>.
          </p>
        </Section>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Leevee AI. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
