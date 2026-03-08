import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, LogOut, Save, Crown, Star, Zap, Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import logo from "@/assets/safehubhelp-ai-logo.png";

const Profile = () => {
  const { user, profile, signOut, refreshProfile, tier, subscribed, subscriptionEnd, checkingSubscription, refreshSubscription } = useAuth();
  const { status: pushStatus, subscribed: pushSubscribed, loading: pushLoading, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">You need to sign in to view your profile.</p>
          <a href="/auth" className="text-primary hover:underline">Sign in</a>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) { toast.error("Name cannot be empty."); return; }
    if (trimmed.length > 100) { toast.error("Name must be under 100 characters."); return; }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) toast.error("Failed to update profile.");
    else {
      toast.success("Profile updated! ✨");
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </a>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Profile</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-border">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile?.display_name || "User"}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              className="h-11 bg-card border-border"
            />
          </div>
          <Button type="submit" disabled={saving} size="sm" className="gap-1.5 bg-primary text-primary-foreground">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        {/* Subscription Status */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Subscription</h2>
            {tier === "premium" && <Badge className="bg-primary/10 text-primary border-primary/20"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
            {tier === "pro" && <Badge className="bg-accent/10 text-accent-foreground border-accent/20"><Star className="w-3 h-3 mr-1" />Pro</Badge>}
            {tier === "free" && <Badge variant="secondary"><Zap className="w-3 h-3 mr-1" />Free</Badge>}
          </div>
          {subscribed && subscriptionEnd && (
            <p className="text-xs text-muted-foreground">
              Renews {new Date(subscriptionEnd).toLocaleDateString()}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            {!subscribed && (
              <Button asChild size="sm" className="gap-1.5 bg-primary text-primary-foreground">
                <a href="/pricing"><Crown className="w-3.5 h-3.5" />Upgrade</a>
              </Button>
            )}
            {subscribed && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const { data, error } = await supabase.functions.invoke("customer-portal");
                  if (data?.url) window.open(data.url, "_blank");
                  else toast.error("Could not open billing portal.");
                }}
              >
                Manage Subscription
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={refreshSubscription} disabled={checkingSubscription}>
              {checkingSubscription ? "Checking..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Account created</p>
          <p className="text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </main>
    </div>
  );
};

export default Profile;
