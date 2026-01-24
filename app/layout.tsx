import LayoutWrapper from "@/src/components/LayoutWrapper";
import Providers from "@/src/components/Providers";
import { AuthProvider } from "@/src/contexts/AuthContext";
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
  title: "Meridiano - News Briefings",
  description: "AI-powered summaries and insights from your curated news feeds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme-preference');
                  let theme = stored || 'system';
                  
                  if (theme === 'system') {
                    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                    theme = mediaQuery.matches ? 'dark' : 'light';
                  }
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  if (mediaQuery.matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
