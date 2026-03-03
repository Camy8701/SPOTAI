import { useState } from "react";
import { Home, ShoppingBag, TrendingUp, MessageCircle, Users, UsersRound, Newspaper, Gamepad2, Gift, BookOpen, Headphones, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Marketplace", icon: ShoppingBag, path: "/marketplace" },
  { name: "Popular", icon: TrendingUp, path: "/popular" },
  { name: "Messages", icon: MessageCircle, path: "/messages" },
  { name: "Communities", icon: Users, path: "/communities" },
  { name: "Groups", icon: UsersRound, path: "/groups" },
  { name: "News & Articles", icon: Newspaper, path: "/library?section=news_articles" },
  { name: "Games", icon: Gamepad2, path: "/quiz" },
];

const freebiesSubItems = [
  { name: "Ebooks Library", icon: BookOpen, path: "/freebies/ebooks" },
  { name: "Podcast Library", icon: Headphones, path: "/freebies/podcasts" },
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
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? "bg-accent text-accent-foreground font-semibold"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <item.icon size={18} className={isActive ? "text-foreground" : "text-muted-foreground"} />
          <span className="text-sm whitespace-nowrap">{item.name}</span>
        </div>
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
          <nav className="flex flex-col gap-0.5">
            {sidebarItems.map(renderItem)}

            {/* Freebies expandable */}
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                isFreebiesActive
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              onClick={() => setFreebiesOpen(!freebiesOpen)}
            >
              <Gift size={18} className={isFreebiesActive ? "text-foreground" : "text-muted-foreground"} />
              <span className="text-sm whitespace-nowrap flex-1">Freebies</span>
              <motion.div
                animate={{ rotate: freebiesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </div>

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
