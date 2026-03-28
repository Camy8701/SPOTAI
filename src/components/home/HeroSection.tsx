import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimateInView from "@/components/AnimateInView";

interface HeroSectionProps {
  hero: {
    slug: string;
    featured_image: string | null;
    title: string;
    excerpt: string | null;
    audio_url: string | null;
  };
  onListen: (src: string, title: string) => void;
}

const HeroSection = ({ hero, onListen }: HeroSectionProps) => (
  <AnimateInView className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
    <Link
      to={`/post/${hero.slug}`}
      className="block relative overflow-hidden rounded-lg group cursor-pointer"
      style={{ aspectRatio: "16/9", maxHeight: "52.5rem" }}
    >
      <img
        src={hero.featured_image || "/placeholder.svg"}
        alt={hero.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-16 sm:bottom-32 left-4 sm:left-8 right-4 sm:right-8 text-center">
        <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
          {hero.title}
        </h2>
        {hero.excerpt && (
          <p className="text-sm sm:text-lg md:text-xl text-gray-200 drop-shadow-lg line-clamp-2">
            {hero.excerpt}
          </p>
        )}
      </div>
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 sm:gap-4">
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Read
        </motion.button>
        {hero.audio_url && (
          <motion.button
            className="bg-red-500 hover:bg-red-600 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onListen(hero.audio_url!, hero.title);
            }}
          >
            Listen
          </motion.button>
        )}
      </div>
    </Link>
  </AnimateInView>
);

export default HeroSection;
