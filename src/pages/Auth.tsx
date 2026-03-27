import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CookieBanner from "@/components/CookieBanner";
import LandingMascots from "@/components/landing/LandingMascots";
import { getAvatarDataUrlForId } from "@/components/auth/ProfileAvatarPicker";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { consumeAuthFlashMessage } from "@/lib/auth-flow";

const HERO_AVATARS = [
  {
    avatarId: 5,
    label: "Choose your avatar",
    className: "left-4 top-5 md:left-8 md:top-8",
  },
  {
    avatarId: 2,
    label: "Google signup",
    className: "right-4 top-10 md:right-8 md:top-8",
  },
  {
    avatarId: 8,
    label: "Profile setup next",
    className: "left-6 bottom-8 md:left-12 md:bottom-10",
  },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function HeroAvatar({
  avatarId,
  label,
  className,
}: {
  avatarId: number;
  label: string;
  className: string;
}) {
  return (
    <div
      className={cn(
        "absolute hidden items-center gap-3 rounded-full border border-border bg-background/95 px-3 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:flex",
        className,
      )}
    >
      <img
        src={getAvatarDataUrlForId(avatarId)}
        alt={label}
        className="h-10 w-10 rounded-full"
      />
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">After account creation</p>
      </div>
    </div>
  );
}

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSignUp = searchParams.get("mode") === "signup";

  useEffect(() => {
    const flashMessage = consumeAuthFlashMessage();
    if (flashMessage) {
      setError(flashMessage);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await signInWithGoogle(isSignUp ? "signup" : "login");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isSignUp) {
        const result = await signUpWithEmail(email, password);
        if (result.requiresEmailVerification) {
          setSuccess("Account created. Verify your email, then continue into profile setup.");
        } else {
          navigate("/onboarding");
        }
      } else {
        await signInWithEmail(email, password);
        navigate("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? "sign up" : "sign in"}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwap = () => {
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      navigate("/");
      return;
    }

    setSearchParams({ mode: "signup" });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12 xl:px-16 2xl:px-24">
          <div className="w-full max-w-[880px]">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="mt-8 max-w-[620px]">
              <span className="inline-flex rounded-full border border-border bg-muted/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {isSignUp ? "SpotAI signup" : "SpotAI access"}
              </span>
              <span className="spotai-wordmark mt-6 block text-5xl font-extrabold tracking-tight md:text-6xl">
                SpotAI
              </span>
              <h1
                className="mt-6 text-3xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl lg:leading-[1.05]"
                style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
              >
                {isSignUp
                  ? "Create your account and finish your profile next."
                  : "Log back in and continue where you left off."}
              </h1>
              <p className="mt-4 max-w-[560px] text-base leading-7 text-muted-foreground">
                {isSignUp
                  ? "Start with email and password or continue with Google. After that, you’ll enter your name, profile details, and choose your avatar in one simple step."
                  : "Sign in to access your saved tools, communities, messages, and profile settings."}
              </p>
            </div>

            <div className="relative mt-10 min-h-[420px] overflow-hidden rounded-[34px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(74,169,255,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,125,16,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,250,251,1))] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
              {HERO_AVATARS.map((avatar) => (
                <HeroAvatar key={avatar.avatarId} {...avatar} />
              ))}

              <div className="flex h-full min-h-[360px] items-center justify-center">
                <LandingMascots
                  isTyping={isTyping}
                  passwordLength={password.length}
                  showPassword={showPassword}
                />
              </div>

              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {[1, 3, 6].map((avatarId) => (
                  <div
                    key={avatarId}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-xs font-semibold text-muted-foreground"
                  >
                    <img
                      src={getAvatarDataUrlForId(avatarId)}
                      alt={`SpotAI avatar ${avatarId}`}
                      className="h-7 w-7 rounded-full"
                    />
                    {avatarId === 1 && "Preset avatar"}
                    {avatarId === 3 && "Custom colors"}
                    {avatarId === 6 && "Profile identity"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-8 lg:w-[420px] lg:border-l lg:border-border lg:px-10 xl:w-[460px]">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold text-foreground">
              {isSignUp ? "Create account" : "Log in to SpotAI"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isSignUp
                ? "Create your account here, then we’ll take you to profile setup."
                : "Use your SpotAI account to continue."}
            </p>

            {error && (
              <Alert className="mt-4 border-destructive/30 bg-destructive/10 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-5 h-12 w-full rounded-lg text-sm font-semibold"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Connecting...
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="ml-2">
                    {isSignUp ? "Create account with Google" : "Log in with Google"}
                  </span>
                </>
              )}
            </Button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isSignUp ? "you@example.com" : "Email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="mt-2 h-12 rounded-lg border-border bg-muted/50 px-4"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a password" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="h-12 rounded-lg border-border bg-muted/50 px-4 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <Link
                  to="/forgot-password"
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Forgotten password?
                </Link>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg text-sm font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    {isSignUp ? "Creating account..." : "Logging in..."}
                  </div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {isSignUp ? "Create Account" : "Log In"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleModeSwap}
                className="h-12 w-full rounded-lg border-primary text-sm font-semibold text-primary hover:bg-primary/5"
              >
                {isSignUp ? "Already have an account?" : "Create new account"}
              </Button>
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>About</span>
          <span>Blog</span>
          <span>Help</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookies</span>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">© 2026 SpotAI</p>
      </footer>

      <CookieBanner />
    </div>
  );
};

export default Auth;
