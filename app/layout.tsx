import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppLayoutProvider } from "@/components/layout/app-layout-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Kaiboard - Project Management for Distributed Teams",
    template: "%s | Kaiboard",
  },
  description: "Schedule meetings across timezones with ease. Collaborate seamlessly with your global team using Kaiboard's smart project management platform.",
  keywords: [
    "project management",
    "distributed teams",
    "remote collaboration", 
    "timezone scheduling",
    "team productivity",
    "global teams",
    "meeting scheduler",
    "collaboration tools",
    "productivity software",
    "remote work"
  ],
  authors: [{ name: "Kaiboard Team" }],
  creator: "Kaiboard",
  publisher: "Kaiboard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://kaiboard.vercel.app'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Kaiboard - Project Management for Distributed Teams",
    description: "Schedule meetings across timezones with ease. Collaborate seamlessly with your global team using Kaiboard's smart project management platform.",
    siteName: "Kaiboard",
    images: [
      {
        url: "/assets/screenshots/Kaiboard-cover.jpeg",
        width: 1200,
        height: 630,
        alt: "Kaiboard - Project Management for Distributed Teams",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaiboard - Project Management for Distributed Teams",
    description: "Schedule meetings across timezones with ease. Collaborate seamlessly with your global team.",
    images: ["/assets/screenshots/Kaiboard-cover.jpeg"],
    creator: "@kaiboard",
    site: "@kaiboard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification IDs here when available
    // google: 'your-google-verification-id',
    // bing: 'your-bing-verification-id',
  },
  category: "technology",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.vercel.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppLayoutProvider>
          {children}
        </AppLayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
