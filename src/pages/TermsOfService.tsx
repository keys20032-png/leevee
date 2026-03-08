import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground">Last updated: March 8, 2026</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm text-foreground leading-relaxed">
            By using Leevee AI ("the Service"), you agree to these Terms of Service. Please read them carefully.
          </p>
        </div>

        <Section title="1. Nature of the Service">
          <p>
            Leevee AI is an AI-powered companion designed to provide emotional support, information, and conversation.
            Leevee is <strong className="text-foreground">not</strong> a licensed therapist, counselor, medical professional,
            or emergency service. The Service does not provide medical advice, diagnosis, or treatment.
          </p>
        </Section>

        <Section title="2. Not a Substitute for Professional Help">
          <p>
            The Service is not a replacement for professional mental health care, crisis intervention, or emergency services.
            If you are experiencing a medical or mental health emergency, please contact emergency services (911) or the
            988 Suicide & Crisis Lifeline immediately.
          </p>
        </Section>

        <Section title="3. Crisis Detection & Safety Features">
          <p>
            Leevee includes automated crisis detection that may redirect you to professional resources when certain
            language patterns are detected. These safety features:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Are designed to err on the side of caution</li>
            <li>May occasionally trigger on non-crisis language (false positives)</li>
            <li>Include a mandatory 30-minute cooldown period after crisis detection</li>
            <li>Cannot guarantee detection of all crisis situations</li>
          </ul>
          <p>
            You can learn more about how these systems work on our{" "}
            <Link to="/safety" className="text-primary hover:underline">Safety & Transparency</Link> page.
          </p>
        </Section>

        <Section title="4. Privacy & Data">
          <p>
            We respect your privacy:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Chat conversations are not persistently stored — they are lost when you close the app</li>
            <li>Your Digital Safety Plan is stored locally on your device only</li>
            <li>Crisis detection processing happens on your device before messages are sent</li>
            <li>Messages sent to the AI are processed by third-party AI providers to generate responses</li>
            <li>We do not sell or share your personal data</li>
          </ul>
        </Section>

        <Section title="5. User Conduct">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Plan, encourage, or facilitate harm to yourself or others</li>
            <li>Generate illegal, abusive, or harmful content</li>
            <li>Attempt to circumvent safety features or crisis detection systems</li>
            <li>Use the Service in any way that violates applicable laws</li>
          </ul>
        </Section>

        <Section title="6. AI Limitations">
          <p>
            Leevee is powered by artificial intelligence and may:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Produce inaccurate, incomplete, or outdated information</li>
            <li>Misunderstand context, tone, or intent</li>
            <li>Generate responses that are inappropriate or unhelpful</li>
            <li>Be unavailable due to technical issues</li>
          </ul>
          <p>
            You should independently verify any information provided by the Service before relying on it.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Leevee AI and its creators shall not be liable for any
            direct, indirect, incidental, consequential, or special damages arising from your use of the Service,
            including but not limited to emotional distress, reliance on AI-generated content, or failure of
            safety features to detect a crisis.
          </p>
        </Section>

        <Section title="8. Age Requirements">
          <p>
            You must be at least 13 years old to use the Service. If you are under 18, you should use the Service
            with the knowledge and consent of a parent or guardian.
          </p>
        </Section>

        <Section title="9. Refund Policy">
          <p>
            Leevee AI operates as a subscription-based service. All subscription fees are <strong className="text-foreground">non-refundable</strong>.
            When you subscribe to a paid plan, you gain immediate access to premium features for the duration of your billing period.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>No refunds will be issued for partial billing periods, unused features, or early cancellation.</li>
            <li>You may cancel your subscription at any time through the subscription management portal. Upon cancellation, you will retain access to paid features until the end of your current billing cycle.</li>
            <li>If you believe you were charged in error, please contact us within 7 days of the charge through our contact form.</li>
          </ul>
        </Section>

        <Section title="10. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes are posted
            constitutes acceptance of the revised Terms. Material changes will be communicated through the Service.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            If you have questions about these Terms, please reach out through our{" "}
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

export default TermsOfService;
