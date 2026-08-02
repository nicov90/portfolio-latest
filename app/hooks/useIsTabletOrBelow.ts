"use client";
import * as React from "react";

// "Tablet and below" per the mobile-artifact investigation — deliberately wider than the 768px
// mobile breakpoint (`use-mobile.ts`) since the tearing was also reproduced on a tablet.
export const TABLET_BREAKPOINT = 1024;

export function useIsTabletOrBelow(): boolean {
  const [isTabletOrBelow, setIsTabletOrBelow] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    const onChange = () => setIsTabletOrBelow(window.innerWidth < TABLET_BREAKPOINT);
    mql.addEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTabletOrBelow(window.innerWidth < TABLET_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTabletOrBelow;
}
