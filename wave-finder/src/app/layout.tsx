import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wave Finder",
  description: "Cross-chain discovery hub for Open Source Sprints",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
