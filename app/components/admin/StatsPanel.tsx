"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useStats } from '../../hooks/useStats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface StatsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Preset = 'all' | 'thisMonth' | 'lastMonth' | 'custom';

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'all', label: 'Todo el tiempo' },
  { value: 'thisMonth', label: 'Este mes' },
  { value: 'lastMonth', label: 'Mes pasado' },
  { value: 'custom', label: 'Personalizado' },
];

// Turns a 2-letter ISO code into its flag emoji by shifting each letter into the Unicode
// "regional indicator symbol" range — no flag image assets or country list needed.
function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

let regionNames: Intl.DisplayNames | null = null;
function countryCodeToName(code: string): string {
  if (!code || code === 'unknown') return 'Desconocido';
  try {
    if (!regionNames) regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  if (minutes < 60) return remSeconds > 0 ? `${minutes}m ${remSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
}

function toLocalDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- "grown since last viewed" tracking ---------------------------------------------------
// One baseline per preset (not per exact custom range — hopping between arbitrary custom
// ranges doesn't have a meaningful single baseline to diff against). Stored client-side only;
// this is a personal "what's new" indicator, not analytics data itself.
const LAST_VIEWED_KEY = 'portfolio_stats_last_viewed';

interface PeriodSnapshot {
  total: number;
  byCountry: Record<string, number>;
}
type LastViewedStore = Partial<Record<Preset, PeriodSnapshot>>;

function loadLastViewed(): LastViewedStore {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LAST_VIEWED_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLastViewed(store: LastViewedStore) {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(store));
  } catch {
    // ignore — the delta badges just won't show next time, nothing else depends on this
  }
}

function DeltaBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold text-green-700 bg-green-100">
      +{value}
    </span>
  );
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ open, onOpenChange }) => {
  const [preset, setPreset] = useState<Preset>('all');
  const [customFrom, setCustomFrom] = useState(() => toLocalDateInputValue(new Date(Date.now() - 86400000)));
  const [customTo, setCustomTo] = useState(() => toLocalDateInputValue(new Date()));
  const [deltas, setDeltas] = useState<{ total: number; byCountry: Record<string, number> } | null>(null);

  const { from, to, label } = useMemo(() => {
    const now = new Date();
    if (preset === 'thisMonth') {
      return { from: startOfMonth(now).toISOString(), to: null, label: 'este mes' };
    }
    if (preset === 'lastMonth') {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        from: startOfMonth(prevMonthDate).toISOString(),
        to: endOfMonth(prevMonthDate).toISOString(),
        label: 'mes pasado',
      };
    }
    if (preset === 'custom') {
      return {
        from: customFrom ? new Date(customFrom).toISOString() : null,
        to: customTo ? new Date(`${customTo}T23:59:59`).toISOString() : null,
        label: 'período seleccionado',
      };
    }
    return { from: null, to: null, label: 'siempre' };
  }, [preset, customFrom, customTo]);

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useStats(from, to);

  // The panel component stays mounted (only the Dialog's own open state toggles), so React
  // Query never sees a fresh mount to trigger a refetch on its own — without this, reopening
  // later in the same session would keep showing whatever was cached from the first view.
  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  // Compare against what was stored the last time THIS preset was viewed, show the growth as
  // "+N" badges, then immediately move the baseline forward to what's showing now — so the
  // badges represent "new since you last looked," not "new since some fixed point."
  useEffect(() => {
    if (!data) return;
    const byCountry: Record<string, number> = {};
    data.byCountry.forEach((entry) => { byCountry[entry.country] = entry.uniqueIps; });

    const store = loadLastViewed();
    const previous = store[preset];

    if (previous) {
      const totalDelta = data.totalUniqueIps - previous.total;
      const countryDeltas: Record<string, number> = {};
      for (const [country, count] of Object.entries(byCountry)) {
        const delta = count - (previous.byCountry[country] ?? 0);
        if (delta > 0) countryDeltas[country] = delta;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeltas({ total: Math.max(0, totalDelta), byCountry: countryDeltas });
    } else {
      setDeltas(null);
    }

    saveLastViewed({ ...store, [preset]: { total: data.totalUniqueIps, byCountry } });
    // `dataUpdatedAt` (not just `data`) drives this: React Query's structural sharing returns
    // the same `data` reference when a refetch's content is unchanged, which would otherwise
    // silently skip re-running this on a same-content refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt, preset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Estadísticas de visitas</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ value, label: presetLabel }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
                preset === value
                  ? 'bg-[#00bfe6] text-white border-[#00bfe6]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {presetLabel}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-sm"
            />
            <span className="text-gray-400">a</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pt-1">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {isError && <p className="text-sm text-red-600">Error al cargar las estadísticas.</p>}

          {data && (
            <>
              <div className="rounded-xl bg-gradient-to-r from-[#00bfe6]/10 to-[#0096c7]/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-[#0096c7]">{data.totalUniqueIps}</span>
                  {deltas && <DeltaBadge value={deltas.total} />}
                </div>
                <div className="text-sm text-gray-500 mt-1">visitantes únicos · {label}</div>
                {data.avgDurationSeconds !== null && (
                  <div className="text-xs text-gray-400 mt-1">
                    Estadía promedio: {formatDuration(data.avgDurationSeconds)}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Por país</h4>
                {data.byCountry.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin datos para este período.</p>
                )}
                <div className="space-y-1">
                  {data.byCountry.map((entry) => (
                    <div
                      key={entry.country}
                      className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700">
                        <span>{countryCodeToFlag(entry.country)}</span>
                        <span>{countryCodeToName(entry.country)}</span>
                        {entry.avgDurationSeconds !== null && (
                          <span className="text-xs text-gray-400">· {formatDuration(entry.avgDurationSeconds)}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{entry.uniqueIps}</span>
                        {deltas && <DeltaBadge value={deltas.byCountry[entry.country] ?? 0} />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
