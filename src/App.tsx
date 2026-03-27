import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
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

const queryClient = new QueryClient();

const LandingRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/home" replace /> : <LandingPage />;
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
            <Route path="/home" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/tip-calculator" element={<TipCalculator />} />
            <Route path="/character-counter" element={<CharacterCounter />} />
            <Route path="/file-converter" element={<FileConverter />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/post/:slug" element={<BlogPost />} />
            <Route path="/library" element={<Library />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/freebies/ebooks" element={<EbooksLibrary />} />
            <Route path="/freebies/podcasts" element={<PodcastLibrary />} />
            <Route path="/image-library" element={<ImageLibrary />} />
            <Route path="/prompt-library" element={<PromptLibrary />} />
            <Route path="/notifications" element={<Notifications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
