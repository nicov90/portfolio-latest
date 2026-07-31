import "@/styles/globals.css";
import "react-image-crop/dist/ReactCrop.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EditModeToolbar } from "./components/admin/EditModeToolbar";
import { EditModeProvider } from "./contexts/editModeContext";
import { QueryProvider } from "./providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// No static `title` here on purpose: Next's metadata-derived <title> isn't part of the same
// React reconciliation as a <title> rendered directly in the tree (see DocumentTitleUpdater), so
// the two never dedupe — the browser always keeps whichever <title> is first in the document,
// which would permanently be this one, never updating no matter what DocumentTitleUpdater renders.
export const metadata: Metadata = {
  description: "Portfolio de Nicolas Valdez, desarrollador Full Stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        // overflow-x-hidden is defensive, not decorative: sections throughout the site use
        // Framer's `initial={{ x: ±50/100 }}` slide-in entrances, driven by scroll/inView
        // triggers — while a section hasn't been scrolled into view yet, its cards sit at that
        // untransformed offset (e.g. translateX(100px)), which pushes the page's real scrollable
        // width past the viewport even though nothing is ever visually poking out on screen.
        // Set on <html> too: body's overflow-x doesn't reliably suppress real (wheel/programmatic)
        // horizontal scroll on the viewport by itself — confirmed via Playwright that scrollX could
        // still reach ~70px with only body clipped, even though nothing visibly overflowed.
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <QueryProvider>
          <EditModeProvider>
            {children}
            <EditModeToolbar />
          </EditModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
