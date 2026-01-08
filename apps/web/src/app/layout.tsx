import type { Metadata } from "next";

import { Space_Grotesk, Geist_Mono, Inter } from "next/font/google";

//@ts-ignore
import "../index.css";
import Providers from "@/components/providers";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RCC Dashboard and Engagement Tool",
  description: "A dashboard and engagement tool for RCC Club SJSU.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
            <SidebarProvider>
        <Providers >
          {children}
        </Providers>
            </SidebarProvider>
      </body>
    </html>
  );
}
