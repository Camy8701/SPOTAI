import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LearnAIProvider } from "@/contexts/LearnAIContext";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import TipCalculator from "./pages/TipCalculator";
import CharacterCounter from "./pages/CharacterCounter";
import FileConverter from "./pages/FileConverter";
import PdfBrander from "./pages/PdfBrander";
import Tools from "./pages/Tools";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Quiz from "./pages/Quiz";
import Games from "./pages/Games";
import QuizLevels from "./pages/QuizLevels";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import BlogPost from "./pages/BlogPost";
import Library from "./pages/Library";
import CreatePost from "./pages/CreatePost";
import Marketplace from "./pages/Marketplace";
import MarketplaceProductDetail from "./pages/MarketplaceProductDetail";
import Popular from "./pages/Popular";
import Messages from "./pages/Messages";
import Communities from "./pages/Communities";
import Groups from "./pages/Groups";
import LearnAI from "./pages/LearnAI";
import LearnAIDetail from "./pages/LearnAIDetail";
import LearnAILesson from "./pages/LearnAILesson";
import LearnAIResults from "./pages/LearnAIResults";
import EbooksLibrary from "./pages/EbooksLibrary";
import PodcastLibrary from "./pages/PodcastLibrary";
import ImageLibrary from "./pages/ImageLibrary";
import PromptLibrary from "./pages/PromptLibrary";
import PromptLibraryDetail from "./pages/PromptLibraryDetail";
import Notifications from "./pages/Notifications";
import { hasCompletedOnboarding } from "@/lib/profile";
import ProfileSettings from "./pages/ProfileSettings";
import UserProfile from "./pages/UserProfile";
import AccountRestricted from "./pages/AccountRestricted";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const AuthLoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
    Loading SpotAI...
  </div>
);

const isRestrictedProfile = (profile: ReturnType<typeof useAuth>["profile"]) =>
  Boolean(profile?.is_platform_banned);

const LandingRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (user && isRestrictedProfile(profile)) return <Navigate to="/account-restricted" replace />;
  return user ? <Navigate to={hasCompletedOnboarding(profile) ? "/home" : "/onboarding"} replace /> : <LandingPage />;
};

const AuthRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (user && isRestrictedProfile(profile)) return <Navigate to="/account-restricted" replace />;
  return user ? <Navigate to={hasCompletedOnboarding(profile) ? "/home" : "/onboarding"} replace /> : <Auth />;
};

const OnboardingRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (isRestrictedProfile(profile)) return <Navigate to="/account-restricted" replace />;
  return hasCompletedOnboarding(profile) ? <Navigate to="/home" replace /> : <Onboarding />;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (isRestrictedProfile(profile)) return <Navigate to="/account-restricted" replace />;
  if (!hasCompletedOnboarding(profile)) return <Navigate to="/onboarding" replace />;
  return children;
};

const RestrictedRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (!isRestrictedProfile(profile)) return <Navigate to={hasCompletedOnboarding(profile) ? "/home" : "/onboarding"} replace />;
  return <AccountRestricted />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <LearnAIProvider>
            <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/onboarding" element={<OnboardingRoute />} />
              <Route path="/account-restricted" element={<RestrictedRoute />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/quiz" element={<ProtectedRoute><Games /></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
              <Route path="/quiz/levels" element={<ProtectedRoute><QuizLevels /></ProtectedRoute>} />
              <Route path="/quiz/arena" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/tip-calculator" element={<ProtectedRoute><TipCalculator /></ProtectedRoute>} />
              <Route path="/character-counter" element={<ProtectedRoute><CharacterCounter /></ProtectedRoute>} />
              <Route path="/file-converter" element={<ProtectedRoute><FileConverter /></ProtectedRoute>} />
              <Route path="/pdf-brander" element={<ProtectedRoute><PdfBrander /></ProtectedRoute>} />
              <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/post/:slug" element={<BlogPost />} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/marketplace/:slug" element={<ProtectedRoute><MarketplaceProductDetail /></ProtectedRoute>} />
              <Route path="/popular" element={<ProtectedRoute><Popular /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
              <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
              <Route path="/learn-ai" element={<ProtectedRoute><LearnAI /></ProtectedRoute>} />
              <Route path="/learn-ai/:slug" element={<ProtectedRoute><LearnAIDetail /></ProtectedRoute>} />
              <Route path="/learn-ai/:slug/lessons/:lessonId" element={<ProtectedRoute><LearnAILesson /></ProtectedRoute>} />
              <Route path="/learn-ai/:slug/results" element={<ProtectedRoute><LearnAIResults /></ProtectedRoute>} />
              <Route path="/freebies/ebooks" element={<ProtectedRoute><EbooksLibrary /></ProtectedRoute>} />
              <Route path="/freebies/podcasts" element={<ProtectedRoute><PodcastLibrary /></ProtectedRoute>} />
              <Route path="/image-library" element={<ProtectedRoute><ImageLibrary /></ProtectedRoute>} />
              <Route path="/prompt-library" element={<ProtectedRoute><PromptLibrary /></ProtectedRoute>} />
              <Route path="/prompt-library/:id" element={<ProtectedRoute><PromptLibraryDetail /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LearnAIProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
