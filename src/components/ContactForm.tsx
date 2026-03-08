import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t.contact.nameRequired;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t.contact.emailRequired;
    if (!form.message.trim()) errs.message = t.contact.messageRequired;
    if (form.message.length > 1000) errs.message = t.contact.messageTooLong;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact", {
        body: { name: form.name, email: form.email, message: form.message },
      });
      if (error) throw error;
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Submit error:", err);
      setErrors({ form: t.contact.error });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="contact-form" className="py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.contact.thankYou}
          </h3>
          <p className="text-muted-foreground text-sm">{t.contact.received}</p>
          <button onClick={() => setSubmitted(false)} className="mt-4 text-primary text-sm hover:underline">
            {t.contact.sendAnother}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact-form" className="py-24 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-20" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gradient-start)), hsl(var(--gradient-end)), transparent)" }} />
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.contact.label}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.contact.title}</h2>
            <div className="w-16 h-[2px] mx-auto mt-4" style={{ background: "linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
            <p className="text-muted-foreground text-sm mt-4">{t.contact.description}</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card/30 border border-border rounded-xl p-6 md:p-8">
            <div>
              <label htmlFor="contact-name" className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.contact.name}
              </label>
              <input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                placeholder={t.contact.namePlaceholder}
                maxLength={100}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p id="name-error" role="alert" className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.contact.email}
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                placeholder={t.contact.emailPlaceholder}
                maxLength={255}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" role="alert" className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.contact.message}
              </label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm min-h-[120px] resize-y"
                placeholder={t.contact.messagePlaceholder}
                maxLength={1000}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && <p id="message-error" role="alert" className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>
            {errors.form && <p role="alert" className="text-destructive text-xs">{errors.form}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-primary-foreground font-semibold text-sm tracking-[0.1em] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t.contact.sending : t.contact.send}
            </button>
          </form>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ContactForm;
