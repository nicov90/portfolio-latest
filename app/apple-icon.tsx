import { ImageResponse } from 'next/og';

// Same "NV" mark as icon.tsx, sized for iOS home-screen bookmarks (Apple ignores the regular
// favicon for that and looks for this convention specifically).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          color: 'white',
          fontSize: 92,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: -2,
        }}
      >
        NV
      </div>
    ),
    { ...size }
  );
}
