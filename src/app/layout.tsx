import type { Metadata } from "next";
import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech",
  display: "swap",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} antialiased bg-[#0a0614] min-h-screen`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(18, 8, 42, 0.95)",
              border: "1px solid rgba(0, 255, 255, 0.2)",
              backdropFilter: "blur(12px)",
              color: "#e2e8f0",
              fontFamily: "var(--font-rajdhani), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
