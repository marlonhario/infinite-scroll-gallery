import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina Gallery — Infinite Scroll Photo Explorer",
  description:
    "Browse thousands of stunning photos with infinite scroll. Fetches new images every 200px.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
