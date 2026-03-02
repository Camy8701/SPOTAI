import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface CarouselImage {
  src: string;
  alt: string;
}

interface AutoScrollCarouselProps {
  images: CarouselImage[];
  speed?: number;
  className?: string;
}

export default function AutoScrollCarousel({ images, speed = 20, className = "" }: AutoScrollCarouselProps) {
  const [duplicatedImages, setDuplicatedImages] = useState<CarouselImage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setDuplicatedImages([...images, ...images, ...images]);
  }, [images]);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, [duplicatedImages]);

  return (
    <div className={`overflow-hidden ${className}`} ref={containerRef}>
      <motion.div
        className="flex gap-6"
        animate={{
          x: [-width / 3, (-width * 2) / 3],
        }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          },
        }}
      >
        {duplicatedImages.map((image, index) => (
          <motion.div
            key={index}
            className="min-w-[560px] h-[400px] relative rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-r from-blue-600 to-red-600 p-[2px]"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black rounded-lg overflow-hidden m-[1px]">
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
