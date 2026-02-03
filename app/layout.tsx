import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { UserSync } from "@/components/user-sync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "verdict.ai — Multi-LLM Query Platform",
  description:
    "Query Claude Opus 4.5, GPT-5.2, and Gemini 3 Pro simultaneously. Get intelligent meta-analysis of AI responses.",
  keywords: ["AI", "LLM", "Claude", "GPT-5", "Gemini", "comparison", "verdict"],
  metadataBase: new URL("https://tryverdict.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <UserSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
