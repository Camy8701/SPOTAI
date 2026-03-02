import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimateInViewProps {
  children: ReactNode;
  className?: string;
}

const AnimateInView = ({ children, className }: AnimateInViewProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default AnimateInView;
