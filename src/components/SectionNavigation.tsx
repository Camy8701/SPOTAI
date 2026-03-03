import { useState } from "react";
import { Book, Grid, Package, FileText, Gamepad2, Newspaper, PenSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const sections = [
  { name: "Featured AI Stories", icon: Book, color: "bg-blue-500", sectionId: "featured-stories" },
  { name: "Featured Collections", icon: Grid, color: "bg-purple-500", sectionId: "featured-collections" },
  { name: "Digital Products", icon: Package, color: "bg-amber-500", sectionId: "digital-products" },
  { name: "Best AI Tools", icon: FileText, color: "bg-green-500", sectionId: "best-ai-tools" },
  { name: "Games", icon: Gamepad2, color: "bg-pink-500", sectionId: "ai-quiz" },
  { name: "News & Articles", icon: Newspaper, color: "bg-orange-500", sectionId: "news-articles" },
  { name: "Create a Post", icon: PenSquare, color: "bg-yellow-500", sectionId: "create-post", isCreatePost: true },
];

const SectionNavigation = () => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { user } = useAuth();

  return (
    <div className="bg-secondary py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between overflow-x-auto pb-2 -mx-4 px-4 space-x-8">
          {sections.map((section) => {
            if ((section as any).isCreatePost) {
              return (
                <div key={section.name} className="relative flex flex-col items-center space-y-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (!user) {
                        window.location.href = "/auth";
                        return;
                      }
                      setShowCreateMenu(!showCreateMenu);
                    }}
                  >
                    <motion.div
                      className={`${section.color} w-14 h-14 rounded-full flex items-center justify-center text-white`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <section.icon size={24} />
                    </motion.div>
                  </button>
                  <span className="text-xs text-center font-medium text-foreground">{section.name}</span>

                  <AnimatePresence>
                    {showCreateMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-48"
                      >
                        <Link
                          to="/create-post?type=post"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-foreground text-sm font-medium"
                          onClick={() => setShowCreateMenu(false)}
                        >
                          <PenSquare size={16} />
                          Create a Post
                        </Link>
                        <Link
                          to="/create-post?type=question"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-sm font-medium border-t border-border"
                          onClick={() => setShowCreateMenu(false)}
                        >
                          <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                          <span className="text-foreground">Ask a Question</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <button
                key={section.name}
                onClick={() => scrollToSection(section.sectionId)}
                className="flex flex-col items-center space-y-2 flex-shrink-0"
              >
                <motion.div
                  className={`${section.color} w-14 h-14 rounded-full flex items-center justify-center text-white`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <section.icon size={24} />
                </motion.div>
                <span className="text-xs text-center font-medium text-foreground">{section.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;
