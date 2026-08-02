"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { useInViewport } from "../hooks/useInViewport";
import { useAnimEnabled } from "../lib/animationFlags";
import { ImageLightbox } from "./ImageLightbox";

interface SimpleImageCarouselProps {
  images: string[];
  autoPlayDelay?: number;
}

export const SimpleImageCarousel = ({ images, autoPlayDelay = 5000 }: SimpleImageCarouselProps) => {
  const carouselAnimated = useAnimEnabled('carousel');
  const slideTransition = (base: object) => (carouselAnimated ? base : { duration: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // See ImageStackCarousel's note on the same fix: autoplay used to run the whole time this
  // component was mounted, regardless of scroll position — every project's carousel kept ticking
  // even scrolled far out of view, competing with whatever the user was actually looking at.
  const isInViewport = useInViewport(containerRef);

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

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
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!isHovered && isInViewport && images.length > 1) {
      autoPlayRef.current = setInterval(nextImage, autoPlayDelay);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isHovered, isInViewport, images.length, autoPlayDelay, nextImage]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Aspect ratio wrapper to stabilize height; overflow-hidden to keep animation inside */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Project image ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)]"
              initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0.6 }}
              transition={slideTransition({ duration: 0.5, ease: [0.22, 1, 0.36, 1] })}
              style={{ willChange: 'transform, opacity' }}
              onClick={() => !isDragging && openLightbox(currentIndex)}
            />
          </AnimatePresence>

          {/* Image counter */}
          <div className="pointer-events-none absolute bottom-3 right-3 z-20">
            <div className="pointer-events-auto px-3 py-1.5 bg-background/70 text-foreground rounded-full text-sm font-semibold backdrop-blur-md border border-border/50 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={slideTransition({ duration: 0.25, ease: 'easeInOut' })}
                  className="inline-block"
                >
                  {currentIndex + 1} / {images.length}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-background/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-border/50 pointer-events-auto">
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary' : 'bg-foreground/50 hover:bg-foreground/80'}`}
                  animate={{ width: index === currentIndex ? 24 : 8, height: 8 }}
                  transition={slideTransition({ type: 'spring', stiffness: 400, damping: 30 })}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Ir a la imagen ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
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
