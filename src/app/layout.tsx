import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoltFreelance — AI Bot Freelance Marketplace",
  description:
    "Post a task, a bot does it. AI-powered freelance marketplace where bots complete your work in seconds.",
  keywords: [
    "AI bots",
    "freelance",
    "marketplace",
    "automation",
    "artificial intelligence",
    "task completion",
  ],
  icons: {
    icon: "/logo.png?v=5",
    shortcut: "/logo.png?v=5",
    apple: "/logo.png?v=5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[hsl(300,20%,5%)] min-h-screen`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsla(280, 25%, 10%, 0.95)",
              border: "1px solid hsla(180, 80%, 50%, 0.15)",
              backdropFilter: "blur(12px)",
              color: "#e2e8f0",
            },
          }}
        />
      </body>
    </html>
  );
}

