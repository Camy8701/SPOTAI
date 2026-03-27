import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calculator, Type, Upload, X, Moon, Sun, LogOut, LayoutDashboard, Shield, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import NotificationBell from "@/components/NotificationBell";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        searchInputRef.current?.blur();
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 lg:px-8 flex items-center h-14 sm:h-16">
        {/* Left - Burger Menu + Brand */}
        <div className="flex items-center flex-shrink-0 gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>

          <Link to="/home" className="flex items-center gap-2">
            <span className="spotai-wordmark text-lg sm:text-xl font-extrabold tracking-tight">
              SpotAI
            </span>
          </Link>

          <nav className="hidden md:flex md:items-center md:space-x-6 ml-6">
            <a
              href="https://www.youtube.com/channel/UC6D5mUGNBRB80j_5A-QkazA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-foreground font-medium whitespace-nowrap hover:text-red-600 transition-colors text-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </a>
            <a
              href="https://ko-fi.com/spotai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-foreground font-medium whitespace-nowrap hover:text-orange-600 transition-colors text-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
              </svg>
              Support Us
            </a>
          </nav>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:block flex-1 mx-8">
          <div className="relative w-full max-w-7xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search AI tools, stories, news... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-12 py-2 border border-border rounded-md leading-5 bg-secondary placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-10 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-secondary rounded-r-md transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Right - Theme Toggle + Auth + Utility Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-auto">
          <button
            onClick={toggleDark}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <NotificationBell />
              <Link to="/dashboard" className="p-2 rounded-md hover:bg-secondary transition-colors" title="My Dashboard">
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="p-2 rounded-md hover:bg-secondary transition-colors" title="Admin Dashboard">
                  <Shield className="h-4 w-4" />
                </Link>
              )}
              <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
                {profile?.display_name || user.email?.split("@")[0]}
              </span>
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth">
              <button className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium h-9 sm:h-10 items-center transition-colors">
                Sign In
              </button>
            </Link>
          )}

          {/* Utility Tools - Desktop only */}
          <div className="hidden xl:flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
              <Link to="/tip-calculator" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap h-10 transition-colors">
                <Calculator size={16} /><span>Tip Calculator</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
              <Link to="/character-counter" className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap h-10 transition-colors">
                <Type size={16} /><span>Character Counter</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
              <Link to="/file-converter" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap h-10 transition-colors">
                <Upload size={16} /><span>File Converter</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden border-t border-border bg-secondary">
        <div className="px-4 py-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-10 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-background border-r border-border z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="spotai-wordmark text-lg font-extrabold">SpotAI</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {/* Auth section for mobile */}
                {user ? (
                  <div className="pb-4 mb-4 border-b border-border space-y-2">
                    <div className="text-sm font-medium text-foreground truncate px-3">
                      {profile?.display_name || user.email?.split("@")[0]}
                    </div>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                        <Shield className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async () => { await signOut(); navigate("/"); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground w-full"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pb-4 mb-4 border-b border-border">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                      Sign In
                    </Link>
                  </div>
                )}

                {/* External links */}
                <a href="https://www.youtube.com/channel/UC6D5mUGNBRB80j_5A-QkazA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                  YouTube
                </a>
                <a href="https://ko-fi.com/spotai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" /></svg>
                  Support Us
                </a>

                {/* Utility tools */}
                <div className="pt-4 mt-4 border-t border-border space-y-2">
                  <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tools</div>
                  <Link to="/tip-calculator" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                    <Calculator className="h-4 w-4 text-sky-500" /> Tip Calculator
                  </Link>
                  <Link to="/character-counter" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                    <Type className="h-4 w-4 text-violet-500" /> Character Counter
                  </Link>
                  <Link to="/file-converter" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm text-foreground">
                    <Upload className="h-4 w-4 text-orange-500" /> File Converter
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
