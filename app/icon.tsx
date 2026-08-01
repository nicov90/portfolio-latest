import { ImageResponse } from 'next/og';

// Next.js auto-wires this into the site's favicon/tab icon — no static asset needed. Colors
// match the navbar logo's own gradient (blue-600 -> purple-500) so the tab icon and the site
// itself read as the same brand at a glance.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 100%)',
          borderRadius: 7,
          color: 'white',
          fontSize: 17,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: -0.5,
        }}
      >
        NV
      </div>
    ),
    { ...size }
  );
}
