import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Mail, KeyRound, Sparkles, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/safehubhelp-ai-logo.png";

type AuthView = "login" | "signup" | "magic-link" | "forgot-password";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) toast.error(error.message);
    else toast.success("Welcome back! 💙");
    setLoading(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
    else toast.success("Check your email for a verification link! 📧");
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent! Check your inbox. ✨");
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent! 📧");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Google sign-in failed. Try again.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <a href="/" className="inline-block">
            <img src={logo} alt="Leevee AI" className="w-14 h-14 rounded-2xl mx-auto" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {view === "login" && "Welcome back"}
              {view === "signup" && "Create your account"}
              {view === "magic-link" && "Magic link sign-in"}
              {view === "forgot-password" && "Reset password"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {view === "login" && "Sign in to your Leevee account"}
              {view === "signup" && "Join the Leevee community"}
              {view === "magic-link" && "We'll email you a sign-in link"}
              {view === "forgot-password" && "We'll send you a reset link"}
            </p>
          </div>
        </div>

        {/* Google OAuth */}
        {(view === "login" || view === "signup") && (
          <>
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-11 gap-2 border-border hover:bg-muted"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>
          </>
        )}

        {/* Email/Password Form */}
        {(view === "login" || view === "signup") && (
          <form onSubmit={view === "login" ? handleEmailLogin : handleEmailSignup} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-card border-border"
                required
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-card border-border"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {view === "login" && (
              <button type="button" onClick={() => setView("forgot-password")} className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            )}
            <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Loading..." : view === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        )}

        {/* Magic Link Form */}
        {view === "magic-link" && (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-card border-border"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Sparkles className="w-4 h-4" />
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        )}

        {/* Forgot Password Form */}
        {view === "forgot-password" && (
          <form onSubmit={handleForgotPassword} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-card border-border"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        {/* Navigation between views */}
        <div className="space-y-2 text-center text-sm">
          {view === "login" && (
            <>
              <button onClick={() => setView("magic-link")} className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 mx-auto">
                <Sparkles className="w-3.5 h-3.5" /> Sign in with magic link
              </button>
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setView("signup")} className="text-primary hover:underline font-medium">Sign up</button>
              </p>
            </>
          )}
          {view === "signup" && (
            <>
              <button onClick={() => setView("magic-link")} className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 mx-auto">
                <Sparkles className="w-3.5 h-3.5" /> Sign up with magic link
              </button>
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setView("login")} className="text-primary hover:underline font-medium">Sign in</button>
              </p>
            </>
          )}
          {(view === "magic-link" || view === "forgot-password") && (
            <button onClick={() => setView("login")} className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          )}
        </div>

        {/* Skip / Continue without account */}
        <div className="pt-2 text-center">
          <a href="/" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            Continue without an account →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
