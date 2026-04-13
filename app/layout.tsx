/**
 * @file app/layout.tsx
 * @description Root shell shared by every route in the app.
 *
 *              The inline <script> in <head> is a Flash Of Unstyled Content (FOUC)
 *              prevention technique.  It runs synchronously — before any CSS or React
 *              rendering — reads the stored theme from localStorage, and applies the
 *              `dark` class to <html> immediately.  Without it, every page would paint
 *              in light mode for one frame before ThemeProvider hydrates, producing a
 *              visible flicker on dark-mode users' screens.  This is one of the few
 *              cases where a blocking inline script is the correct, intentional tool.
 *
 *              suppressHydrationWarning on <html> is required as a direct consequence:
 *              the inline script changes the DOM before React can reconcile, so the
 *              SSR-rendered HTML won't match what the client sees.  React would otherwise
 *              warn about this class mismatch on every page load.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import PosthogProvider from "@/components/ui/PosthogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'CodeRead - Learn to Read Code',
    template: '%s | CodeRead',
  },
  description: 'Practice reading real code snippets and sharpen your ability to work with AI effectively. Free coding challenges for developers.',
  keywords: ['code reading', 'AI coding', 'programming challenges', 'learn to code', 'JavaScript', 'TypeScript'],
  metadataBase: new URL('https://codeoneread.tech'),
  icons: {
    icon: '/favicon.ico',
    apple: '/owl-180.png',
  },
  openGraph: {
    title: 'CodeRead - Learn to Read Code',
    description: 'Practice reading real code snippets and sharpen your ability to work with AI effectively.',
    url: 'https://codeoneread.tech',
    siteName: 'CodeRead',
    type: 'website',
    images: [{ url: '/owl-512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeRead - Learn to Read Code',
    description: 'Practice reading real code snippets and sharpen your ability to work with AI effectively.',
    images: ['/owl-512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <PosthogProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </PosthogProvider>
      </body>
    </html>
  );
}
