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
  description: "Portfolio de Nicolás Valdez, desarrollador Full Stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
