"use client";
import { useEffect, useRef } from "react";

// Reads the hash on initial load and navigates to that section once.
export function useInitialHashNavigation(
  validIds: string[],
  scrollTo: (id: string) => void,
  enabled: boolean
) {
  const didRunRef = useRef(false);
  const validRef = useRef(validIds);
  const scrollRef = useRef(scrollTo);

  useEffect(() => {
    validRef.current = validIds;
  }, [validIds]);

  useEffect(() => {
    scrollRef.current = scrollTo;
  }, [scrollTo]);

  useEffect(() => {
    if (!enabled || didRunRef.current) return;
    didRunRef.current = true;
    const raw = window.location.hash?.slice(1);
    if (raw && validRef.current.includes(raw)) {
      requestAnimationFrame(() => scrollRef.current(raw));
    }
  }, [enabled]);
}
