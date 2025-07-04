import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { TolgeeNextProvider } from '@/components/providers/TolgeeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PTT Home Camera",
  description: "Private home camera streaming with authentication",
  icons: {
    icon: '/cctv.svg',
    shortcut: '/cctv.svg',
    apple: '/cctv.svg',
  },
};

// Wrapper component to handle Clerk initialization
function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // Only use ClerkProvider if we have a valid key (not placeholder)
  if (publishableKey && !publishableKey.includes('placeholder')) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  
  // Fallback for build time or when no valid key is provided
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkWrapper>
      <html lang="vi">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <TolgeeNextProvider language="vi-VN">
            {children}
          </TolgeeNextProvider>
        </body>
      </html>
    </ClerkWrapper>
  );
}
