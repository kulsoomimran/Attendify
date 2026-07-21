import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendify — Workforce Management & Attendance Tracking",
  description: "Attendify is a premium enterprise SaaS platform for workforce attendance management, scheduling, and GPS based attendance tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
