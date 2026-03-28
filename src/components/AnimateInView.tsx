import { motion } from "framer-motion";
import { forwardRef, ReactNode } from "react";

interface AnimateInViewProps {
  children: ReactNode;
  className?: string;
}

const AnimateInView = forwardRef<HTMLDivElement, AnimateInViewProps>(
  ({ children, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }
);

AnimateInView.displayName = "AnimateInView";

export default AnimateInView;
