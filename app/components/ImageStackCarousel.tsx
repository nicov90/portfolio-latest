"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { useInViewport } from "../hooks/useInViewport";
import { ImageLightbox } from "./ImageLightbox";

interface ImageStackCarouselProps {
  images: string[];
  autoPlayDelay?: number;
}

export const ImageStackCarousel = ({ images, autoPlayDelay = 5000 }: ImageStackCarouselProps) => {
  // Detect tablet or below to switch to a simplified carousel
  const useIsTabletOrBelow = () => {
    const [isSmall, setIsSmall] = useState(false);
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const mql = window.matchMedia('(max-width: 768px)');
      const onChange = (e: MediaQueryListEvent) => setIsSmall(e.matches);
      setIsSmall(mql.matches);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }, []);
    return isSmall;
  };
  const isTabletOrBelow = useIsTabletOrBelow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Autoplay used to run unconditionally the whole time this component was mounted — which, since
  // every project card on the page is mounted simultaneously (not virtualized), meant every
  // project's carousel kept firing its own setInterval forever, including ones scrolled far out
  // of view. On a page with several projects that's several independent timers all doing
  // React state updates + a Framer transition on every tick, competing for the main thread with
  // whatever the user is actually looking at (traced directly to extra jank on the sections
  // *after* Projects, not Projects itself). Gating on viewport visibility stops a carousel's
  // clock the moment it's scrolled away and only restarts it once it's back in view.
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
    if (!isHovered && isInViewport && images.length > 1) {
      autoPlayRef.current = setInterval(nextImage, autoPlayDelay);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, isInViewport, currentIndex, images.length, autoPlayDelay, nextImage]);

  if (images.length === 0) return null;

  const getPrevIndex = () => (currentIndex - 1 + images.length) % images.length;
  const getNextIndex = () => (currentIndex + 1) % images.length;

  // Simplified carousel for small/tablet viewports
  if (isTabletOrBelow) {
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
          {/* Aspect ratio wrapper to stabilize height in small screens */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Project image ${currentIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)]"
                initial={{ x: direction > 0 ? '60%' : '-60%', opacity: 0, scale: 0.98 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction > 0 ? '-60%' : '60%', opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], opacity: { duration: 0.3 } }}
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
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
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
  }

  return (
    <>
      <div
        ref={containerRef}
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
            className="absolute left-0 w-[38%] h-[76%] cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ x: -100, opacity: 0, rotateY: 15 }}
            animate={{ 
              x: 0, 
              opacity: 0.7,
              rotateY: 15,
              scale: 0.94,
            }}
            whileHover={{ 
              scale: 0.97, 
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
          className="relative w-[60%] h-[88%] max-h-[550px] z-20 cursor-pointer"
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
                x: direction > 0 ? "70%" : "-70%",
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
                x: direction > 0 ? "-70%" : "70%",
                opacity: 0,
                scale: 0.95,
                rotateY: direction > 0 ? 15 : -15,
                z: -50
              }}
              transition={{ 
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
                opacity: { duration: 0.3 },
                scale: { duration: 0.6 },
                rotateY: { duration: 0.6 }
              }}
              className="absolute flex justify-center inset-0 z-10"
              style={{ transformStyle: "preserve-3d", willChange: 'transform, opacity' }}
            >
              <motion.img
                src={images[currentIndex]}
                alt={`Project image ${currentIndex + 1}`}
                className="h-full object-contain rounded-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)]"
                style={{
                  boxShadow: "0 25px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
                  willChange: 'transform, opacity'
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
            className="absolute right-0 w-[38%] h-[76%] cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ x: 100, opacity: 0, rotateY: -15 }}
            animate={{ 
              x: 0, 
              opacity: 0.7,
              rotateY: -15,
              scale: 0.94,
            }}
            whileHover={{ 
              scale: 0.97, 
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
