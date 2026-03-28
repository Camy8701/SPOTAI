import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import AnimateInView from "@/components/AnimateInView";

const GamesSection = () => (
  <section className="py-12 sm:py-16 bg-background" id="ai-quiz">
    <AnimateInView>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Games</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your AI knowledge with our interactive games and quizzes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/quiz">
            <motion.button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              Start Quiz
            </motion.button>
          </Link>
          <Link to="/quiz">
            <motion.button
              className="inline-flex items-center gap-2 border border-border bg-card hover:bg-accent text-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Gamepad2 size={20} />
              View All Games
            </motion.button>
          </Link>
        </div>
      </div>
    </AnimateInView>
  </section>
);

export default GamesSection;
