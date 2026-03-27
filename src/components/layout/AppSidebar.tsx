import { useState } from "react";
import { Home, ShoppingBag, TrendingUp, MessageCircle, Users, UsersRound, Newspaper, Gamepad2, Gift, BookOpen, Headphones, ChevronDown, Images, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
  { name: "Home", icon: Home, path: "/home", color: "from-blue-500 to-blue-600" },
  { name: "Marketplace", icon: ShoppingBag, path: "/marketplace", color: "from-emerald-500 to-green-600" },
  { name: "Popular", icon: TrendingUp, path: "/popular", color: "from-orange-500 to-red-500" },
  { name: "Messages", icon: MessageCircle, path: "/messages", color: "from-cyan-500 to-blue-500" },
  { name: "Communities", icon: Users, path: "/communities", color: "from-purple-500 to-violet-600" },
  { name: "Groups", icon: UsersRound, path: "/groups", color: "from-pink-500 to-rose-600" },
  { name: "News & Articles", icon: Newspaper, path: "/library?section=news_articles", color: "from-amber-500 to-orange-600" },
  { name: "Games", icon: Gamepad2, path: "/quiz", color: "from-indigo-500 to-purple-600" },
  { name: "Image Library", icon: Images, path: "/image-library", color: "from-sky-500 to-cyan-600" },
  { name: "Prompt Library", icon: Sparkles, path: "/prompt-library", color: "from-violet-500 to-purple-600" },
];

const freebiesSubItems = [
  { name: "Ebooks Library", icon: BookOpen, path: "/freebies/ebooks", color: "from-teal-500 to-emerald-600" },
  { name: "Podcast Library", icon: Headphones, path: "/freebies/podcasts", color: "from-rose-500 to-pink-600" },
];

interface AppSidebarProps {
  isOpen: boolean;
}

const AppSidebar = ({ isOpen }: AppSidebarProps) => {
  const location = useLocation();
  const [freebiesOpen, setFreebiesOpen] = useState(
    location.pathname.startsWith("/freebies")
  );

  const renderItem = (item: typeof sidebarItems[0]) => {
    const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path.split("?")[0]));
    return (
      <Link key={item.name} to={item.path}>
        <motion.div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? "bg-accent text-accent-foreground font-semibold"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
            <item.icon size={16} className="text-white" />
          </div>
          <span className="text-sm whitespace-nowrap">{item.name}</span>
        </motion.div>
      </Link>
    );
  };

  const isFreebiesActive = location.pathname.startsWith("/freebies");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 224, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="hidden lg:flex flex-col flex-shrink-0 border-r border-border bg-sidebar-background sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden py-4 px-3"
        >
          <nav className="flex flex-col gap-1">
            {sidebarItems.map(renderItem)}

            {/* Freebies expandable */}
            <motion.div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                isFreebiesActive
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFreebiesOpen(!freebiesOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                <Gift size={16} className="text-white" />
              </div>
              <span className="text-sm whitespace-nowrap flex-1">Freebies</span>
              <motion.div
                animate={{ rotate: freebiesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {freebiesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-4"
                >
                  {freebiesSubItems.map(renderItem)}
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default AppSidebar;
