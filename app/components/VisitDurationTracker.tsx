"use client";
import { useEffect } from 'react';

interface VisitDurationTrackerProps {
  visitId: string | null;
}

/**
 * Silently reports how long a qualifying visit (see app/page.tsx — excludes localhost/admin)
 * lasted, via sendBeacon so the report reliably goes out even as the tab is closing. Fires on
 * both 'visibilitychange' (tab hidden/switched away — the more reliable signal on mobile) and
 * 'pagehide' (actual navigation/close on desktop); either one reports the total elapsed time
 * since mount, so whichever fires last simply overwrites with the more complete number.
 */
export const VisitDurationTracker: React.FC<VisitDurationTrackerProps> = ({ visitId }) => {
  useEffect(() => {
    if (!visitId) return;

    const startedAt = Date.now();

    const report = () => {
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      if (durationSeconds <= 0) return;
      try {
        const payload = JSON.stringify({ visitId, durationSeconds });
        navigator.sendBeacon('/api/track-duration', new Blob([payload], { type: 'application/json' }));
      } catch {
        // best-effort — losing a single duration report isn't worth surfacing an error for
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') report();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', report);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', report);
    };
  }, [visitId]);

  return null;
};
