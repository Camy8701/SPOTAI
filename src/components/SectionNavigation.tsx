import { Book, Grid, Package, FileText, Brain, Newspaper, Crown } from "lucide-react";
import { motion } from "framer-motion";

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
  { name: "AI Knowledge Quiz", icon: Brain, color: "bg-pink-500", sectionId: "ai-quiz" },
  { name: "News & Articles", icon: Newspaper, color: "bg-orange-500", sectionId: "news-articles" },
  { name: "Become a Member", icon: Crown, color: "bg-yellow-500", sectionId: "action-buttons" },
];

const SectionNavigation = () => {
  return (
    <div className="bg-secondary py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between overflow-x-auto pb-2 -mx-4 px-4 space-x-8">
          {sections.map((section) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;
