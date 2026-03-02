import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const isSignUp = mode === "signup";

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
    if (isSignUp && !fullName) { setError("Please enter your full name."); return; }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        setSuccess("Account created! Please check your email to verify your account.");
      } else {
        await signInWithEmail(email, password);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? "sign up" : "sign in"}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isSignUp ? "Join UTOP-AI" : "Welcome Back"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isSignUp
                  ? "Create your account to like posts, comment, and track your quiz scores!"
                  : "Sign in to access your saved posts, comments, and quiz progress."}
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-4">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 mb-4">
                <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {/* Auth Method Toggle */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  authMethod === "email"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Mail className="h-4 w-4 mr-2 inline" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("google")}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  authMethod === "google"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            {/* Email Form */}
            {authMethod === "email" && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required={isSignUp} className="mt-1" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {!isSignUp && (
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    Forgot your password?
                  </Link>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </div>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      {isSignUp ? "Create Account" : "Sign In"}
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Google Sign In */}
            {authMethod === "google" && (
              <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>
            )}

            {/* Features Preview */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 mt-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <User className="h-4 w-4" />
                What you'll get:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Like and save your favorite AI stories</li>
                <li>• Comment and engage with the community</li>
                <li>• Track your AI quiz scores and rankings</li>
                <li>• Get personalized content recommendations</li>
              </ul>
            </div>

            {/* Toggle mode */}
            <div className="text-center mt-6">
              <button onClick={() => { setMode(isSignUp ? "signin" : "signup"); setError(null); setSuccess(null); }} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>

            <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
