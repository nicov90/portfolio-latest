"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { ImageLightbox } from "./ImageLightbox";

interface ImageStackCarouselProps {
  images: string[];
  autoPlayDelay?: number;
}

export const ImageStackCarousel = ({ images, autoPlayDelay = 5000 }: ImageStackCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDragStart = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if ("touches" in e) {
      dragStartX.current = e.touches[0]?.clientX ?? 0;
    } else {
      dragStartX.current = e.clientX ?? 0;
    }
  };

  const handleDragEnd = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    setIsDragging(false);
    let dragEndX = 0;
    if ("changedTouches" in e) {
      dragEndX = e.changedTouches[0]?.clientX ?? 0;
    } else {
      dragEndX = e.clientX ?? 0;
    }
    const diff = dragStartX.current - dragEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!isHovered && images.length > 1) {
      autoPlayRef.current = setInterval(nextImage, autoPlayDelay);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, currentIndex, images.length, autoPlayDelay]);

  if (images.length === 0) return null;

  const getPrevIndex = () => (currentIndex - 1 + images.length) % images.length;
  const getNextIndex = () => (currentIndex + 1) % images.length;

  return (
    <>
      <div
        className="relative w-full h-full flex items-center justify-center perspective-1000"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Card Stack - Previous images (left side, stacked behind) */}
        {images.length > 1 && (
          <motion.div
            key={`prev-${getPrevIndex()}`}
            className="absolute left-0 w-[45%] h-[80%] cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ x: -100, opacity: 0, rotateY: 15 }}
            animate={{ 
              x: 0, 
              opacity: 0.7,
              rotateY: 15,
              scale: 0.95,
            }}
            whileHover={{ 
              scale: 0.98, 
              opacity: 0.85,
              rotateY: 12,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={prevImage}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`prev-img-${getPrevIndex()}`}
                src={images[getPrevIndex()]}
                alt="Previous"
                className="w-full h-full object-cover rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ 
                  clipPath: "inset(0 15% 0 0)",
                  filter: "brightness(0.9) blur(0.5px)"
                }}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {/* Current Card (center, main focus) */}
        <motion.div
          className="relative w-[65%] h-[90%] z-20 cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            scale: isHovered && !isDragging ? 1.08 : 1,
            y: isHovered && !isDragging ? -10 : 0,
            rotateY: 0,
          }}
          transition={{ 
            duration: 0.4, 
            ease: [0.34, 1.56, 0.64, 1],
            scale: { duration: 0.3 },
            y: { duration: 0.3 }
          }}
          onClick={() => !isDragging && openLightbox(currentIndex)}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ 
                x: direction > 0 ? "85%" : "-85%",
                opacity: 0,
                scale: 0.95,
                rotateY: direction > 0 ? -15 : 15,
                z: -50
              }}
              animate={{ 
                x: 0,
                opacity: 1,
                scale: 1,
                rotateY: 0,
                z: 0
              }}
              exit={{ 
                x: direction > 0 ? "-85%" : "85%",
                opacity: 0,
                scale: 0.95,
                rotateY: direction > 0 ? 15 : -15,
                z: -50
              }}
              transition={{ 
                duration: 0.9,
                ease: [0.34, 1.56, 0.64, 1],
                opacity: { duration: 0.6 },
                scale: { duration: 0.9 },
                rotateY: { duration: 0.9 }
              }}
              className="absolute inset-0 z-10"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.img
                src={images[currentIndex]}
                alt={`Project image ${currentIndex + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)]"
                style={{
                  boxShadow: "0 25px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)"
                }}
              />
            </motion.div>
          </AnimatePresence>

        </motion.div>

        {/* Image counter - elevated to top layering */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-50">
          <div className="pointer-events-auto px-4 py-2 bg-background/70 text-foreground rounded-full text-sm font-semibold backdrop-blur-md border border-border/50 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="inline-block"
              >
                {currentIndex + 1} / {images.length}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Card Stack - Next images (right side, stacked behind) */}
        {images.length > 1 && (
          <motion.div
            key={`next-${getNextIndex()}`}
            className="absolute right-0 w-[45%] h-[80%] cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ x: 100, opacity: 0, rotateY: -15 }}
            animate={{ 
              x: 0, 
              opacity: 0.7,
              rotateY: -15,
              scale: 0.95,
            }}
            whileHover={{ 
              scale: 0.98, 
              opacity: 0.85,
              rotateY: -12,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={nextImage}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`next-img-${getNextIndex()}`}
                src={images[getNextIndex()]}
                alt="Next"
                className="w-full h-full object-cover rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ 
                  clipPath: "inset(0 0 0 15%)",
                  filter: "brightness(0.9) blur(0.5px)"
                }}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {/* Navigation dots with smooth animations */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-40 bg-background/60 px-4 py-2 rounded-full backdrop-blur-md border border-border/50 pointer-events-auto">
            {images.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`rounded-full transition-all duration-300 ${index === currentIndex ? "bg-primary" : "bg-foreground/50 hover:bg-foreground/80"}`}
                animate={{
                  width: index === currentIndex ? 32 : 8,
                  height: 8
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir a la imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};
