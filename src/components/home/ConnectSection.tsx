import { motion } from "framer-motion";
import AnimateInView from "@/components/AnimateInView";

const ConnectSection = () => (
  <section className="py-12 sm:py-16 bg-secondary" id="action-buttons">
    <AnimateInView>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Connect With Us</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch, support our work, or follow our latest content
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <motion.button
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm transition-colors hover:bg-blue-50"
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-3xl sm:text-4xl mb-4">📧</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">Contact Us</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Get in touch with our team</p>
          </motion.button>
          <motion.button
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm transition-colors hover:bg-orange-50"
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open("https://ko-fi.com/spotai", "_blank")}
          >
            <div className="text-3xl sm:text-4xl mb-4">☕</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">Support Us</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Help us create more content</p>
          </motion.button>
          <motion.button
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm transition-colors hover:bg-red-50"
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open("https://www.youtube.com/channel/UC6D5mUGNBRB80j_5A-QkazA", "_blank")}
          >
            <div className="text-3xl sm:text-4xl mb-4">📺</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">YouTube</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Watch our latest videos</p>
          </motion.button>
        </div>
      </div>
    </AnimateInView>
  </section>
);

export default ConnectSection;
