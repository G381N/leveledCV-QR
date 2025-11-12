import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'LeveledCV — Choose Your Path',
  description: 'LeveledCV interactive experience — choose a path and discover where it leads. Find LeveledCV, career resources and resume tools.',
  keywords: ['LeveledCV', 'leveledcv', 'resume', 'career', 'QR', 'leveled cv'],
  authors: [{ name: 'LeveledCV' }],
  openGraph: {
    title: 'LeveledCV — Choose Your Path',
    description: 'Interactive LeveledCV experience — pick a path to discover your next step.',
    url: 'https://leveledcv.com',
    siteName: 'LeveledCV',
    images: [
      {
        url: '/LOGO.png',
        width: 800,
        height: 600,
        alt: 'LeveledCV Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeveledCV — Choose Your Path',
    description: 'Interactive LeveledCV experience — pick a path to discover your next step.',
    images: ['/LOGO.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <meta name="theme-color" content="#0066ff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-14 sm:pt-16`}
      >
        {/* Transparent fixed navbar at top */}
  <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 pointer-events-auto bg-black border-b border-white/5">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-3">
              <img src="/LOGO.png" alt="Logo" className="h-8 sm:h-10 w-auto" />
            </a>
          </div>

          <div className="text-right">
            <p
              className="text-[10px] sm:text-xs md:text-sm text-white/70 max-w-xs"
              style={{ fontSize: 'clamp(0.6rem, 1.3vw, 0.95rem)' }}
            >
              Hint: our link just might be on the page — check the bottom of the page.
            </p>
          </div>
        </nav>

        {/* note: canonical/meta/json-ld removed from body to avoid hydration mismatch; metadata export handles SEO */}

        {children}
      </body>
    </html>
  );
}
