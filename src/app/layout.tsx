import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iron Trace — Ballistic Trajectory Analysis",
  description: "Real-time red-alert ballistic trajectory analysis platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
