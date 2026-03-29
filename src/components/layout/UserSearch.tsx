import { useState, useRef, useEffect } from "react";
import { Search, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, headline")
        .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(8);
      setResults(data || []);
      setOpen(true);
      setLoading(false);
    }, 300);
  }, [query]);

  const selectUser = (userId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/user/${userId}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 border border-border rounded-md bg-secondary text-foreground placeholder-muted-foreground text-sm h-9 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {loading && (
              <div className="p-3 text-sm text-muted-foreground text-center">Searching...</div>
            )}
            {!loading && results.length === 0 && query.trim() && (
              <div className="p-3 text-sm text-muted-foreground text-center">No users found</div>
            )}
            {results.map((user) => (
              <button
                key={user.user_id}
                onClick={() => selectUser(user.user_id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.display_name || "Unnamed User"}
                  </p>
                  {user.headline && (
                    <p className="text-xs text-muted-foreground truncate">{user.headline}</p>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch;
