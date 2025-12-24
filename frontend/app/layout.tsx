import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "CPFFL | 2025 Standings",
  description: "ESPN fantasy league archive powered by Lambda + DynamoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
