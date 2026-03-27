import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Eye, EyeOff, Sparkles, Bookmark, MessageSquare, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR_ID, ProfileAvatarPicker, getAvatarDataUrlForId } from "@/components/auth/ProfileAvatarPicker";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<"google" | "email">("email");
  const [selectedAvatarId, setSelectedAvatarId] = useState(DEFAULT_AVATAR_ID);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const isSignUp = mode === "signup";
  const benefits = [
    {
      icon: Bookmark,
      title: "Save and organize",
      description: "Keep ebooks, prompts, and tools in one personal library.",
      accent: "bg-[hsl(217,91%,60%)]",
    },
    {
      icon: MessageSquare,
      title: "Join the community",
      description: "Comment on articles and keep a visible profile identity.",
      accent: "bg-[hsl(150,68%,47%)]",
    },
    {
      icon: Trophy,
      title: "Track progress",
      description: "Store quiz results, favorites, and activity in your dashboard.",
      accent: "bg-[hsl(35,92%,58%)]",
    },
  ];

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all required fields."); return; }
    if (isSignUp && !fullName.trim()) { setError("Please enter your full name."); return; }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isSignUp) {
        await signUpWithEmail(email, password, fullName.trim(), getAvatarDataUrlForId(selectedAvatarId));
        setSuccess("Account created! Please check your email to verify your account.");
      } else {
        await signInWithEmail(email, password);
        navigate("/home");
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? "sign up" : "sign in"}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f4f6f8] px-4 py-10 transition-colors dark:bg-[#020611] lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] transition-colors dark:border-white/10 dark:bg-[#07101f] dark:shadow-[0_30px_80px_rgba(0,0,0,0.42)] md:p-10">
            <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,1))]" />
            <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,rgba(7,16,31,0.96),rgba(4,10,20,1))]" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-black/10 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 transition-colors dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
                SpotAI access
              </span>
              <div className="mt-8">
                <span className="spotai-wordmark text-3xl font-extrabold tracking-tight">
                  SpotAI
                </span>
                <h1 className="mt-6 text-5xl leading-[0.95] tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  {isSignUp ? "Create a profile that feels like yours." : "Return to your SpotAI dashboard."}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  {isSignUp
                    ? "Set your display name, pick one of 7 avatar colorways, and unlock the full SpotAI experience."
                    : "Sign in to access your saved content, activity history, and profile settings."}
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div key={benefit.title} className="flex items-start gap-4 rounded-3xl border border-black/8 bg-slate-50/80 px-5 py-4 transition-colors dark:border-white/10 dark:bg-white/[0.045]">
                      <span className={cn("mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl text-white", benefit.accent)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-slate-100">{benefit.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] transition-colors dark:border-white/10 dark:bg-[#07101f] dark:shadow-[0_30px_80px_rgba(0,0,0,0.42)] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full border border-black/10 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 transition-colors dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
                  {isSignUp ? "New account" : "Existing account"}
                </span>
                <h2 className="mt-4 text-4xl tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  {isSignUp ? "Build your profile" : "Sign in to continue"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {isSignUp
                    ? "Email signup lets you set your profile name and avatar before your first session."
                    : "Use the same account you use for articles, freebies, and community activity."}
                </p>
              </div>
              <button
                onClick={() => {
                  setMode(isSignUp ? "signin" : "signup");
                  setError(null);
                  setSuccess(null);
                }}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
              >
                {isSignUp ? "Already have an account?" : "Need an account?"}
              </button>
            </div>

            {error && (
              <Alert className="mt-6 border-red-200 bg-red-50 text-red-900">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mt-6 border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 flex rounded-full border border-black/8 bg-slate-100 p-1 transition-colors dark:border-white/10 dark:bg-white/[0.06]">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={cn(
                  "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all",
                  authMethod === "email"
                    ? "bg-white text-slate-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("google")}
                className={cn(
                  "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all",
                  authMethod === "google"
                    ? "bg-white text-slate-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            {authMethod === "email" && (
              <form onSubmit={handleEmailAuth} className="mt-6 space-y-5">
                {isSignUp && (
                  <>
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="mt-2 h-11 rounded-2xl border-black/10 bg-slate-50 px-4 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                    <ProfileAvatarPicker
                      className="bg-white dark:bg-[#07101f]"
                      onChange={setSelectedAvatarId}
                      value={selectedAvatarId}
                    />
                  </>
                )}

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="mt-2 h-11 rounded-2xl border-black/10 bg-slate-50 px-4 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-11 rounded-2xl border-black/10 bg-slate-50 px-4 pr-10 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <Link to="/forgot-password" className="inline-flex text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Forgot your password?
                  </Link>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-full bg-slate-950 text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin dark:border-slate-950 dark:border-t-transparent" />
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {isSignUp ? "Create Account" : "Sign In"}
                    </>
                  )}
                </Button>
              </form>
            )}

            {authMethod === "google" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-[28px] border border-black/8 bg-slate-50 p-5 transition-colors dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="flex items-center gap-3 text-slate-950 dark:text-white">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/[0.08]">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                    </span>
                    <div>
                      <p className="font-semibold">Continue with Google</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Google sign-in keeps your Google profile photo. Email signup is available if you want to pick one of the 7 SpotAI avatars first.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="h-12 w-full rounded-full border border-black/10 bg-white text-slate-950 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin dark:border-slate-300 dark:border-t-transparent" />
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </Button>
              </div>
            )}

            <p className="mt-6 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
