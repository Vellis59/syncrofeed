import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syncrofeed — A modern RSS reader",
  description:
    "Self-hosted, AI-enhanced RSS reader with Fever API compatibility. Read smarter, not harder.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
