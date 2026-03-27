import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import TipCalculator from "./pages/TipCalculator";
import CharacterCounter from "./pages/CharacterCounter";
import FileConverter from "./pages/FileConverter";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Quiz from "./pages/Quiz";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import BlogPost from "./pages/BlogPost";
import Library from "./pages/Library";
import CreatePost from "./pages/CreatePost";
import Marketplace from "./pages/Marketplace";
import Popular from "./pages/Popular";
import Messages from "./pages/Messages";
import Communities from "./pages/Communities";
import Groups from "./pages/Groups";
import EbooksLibrary from "./pages/EbooksLibrary";
import PodcastLibrary from "./pages/PodcastLibrary";
import ImageLibrary from "./pages/ImageLibrary";
import PromptLibrary from "./pages/PromptLibrary";
import Notifications from "./pages/Notifications";
import { hasCompletedOnboarding } from "@/lib/profile";

const queryClient = new QueryClient();

const AuthLoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
    Loading SpotAI...
  </div>
);

const LandingRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  return user ? <Navigate to={hasCompletedOnboarding(profile) ? "/home" : "/onboarding"} replace /> : <LandingPage />;
};

const AuthRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  return user ? <Navigate to={hasCompletedOnboarding(profile) ? "/home" : "/onboarding"} replace /> : <Auth />;
};

const OnboardingRoute = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return hasCompletedOnboarding(profile) ? <Navigate to="/home" replace /> : <Onboarding />;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || (user && profileLoading)) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (!hasCompletedOnboarding(profile)) return <Navigate to="/onboarding" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/onboarding" element={<OnboardingRoute />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/tip-calculator" element={<ProtectedRoute><TipCalculator /></ProtectedRoute>} />
            <Route path="/character-counter" element={<ProtectedRoute><CharacterCounter /></ProtectedRoute>} />
            <Route path="/file-converter" element={<ProtectedRoute><FileConverter /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/post/:slug" element={<BlogPost />} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/popular" element={<ProtectedRoute><Popular /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/freebies/ebooks" element={<ProtectedRoute><EbooksLibrary /></ProtectedRoute>} />
            <Route path="/freebies/podcasts" element={<ProtectedRoute><PodcastLibrary /></ProtectedRoute>} />
            <Route path="/image-library" element={<ProtectedRoute><ImageLibrary /></ProtectedRoute>} />
            <Route path="/prompt-library" element={<ProtectedRoute><PromptLibrary /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
