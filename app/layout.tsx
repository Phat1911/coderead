import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";

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
  openGraph: {
    title: 'CodeRead - Learn to Read Code',
    description: 'Practice reading real code snippets and sharpen your ability to work with AI effectively.',
    url: 'https://codeoneread.tech',
    siteName: 'CodeRead',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeRead - Learn to Read Code',
    description: 'Practice reading real code snippets and sharpen your ability to work with AI effectively.',
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
