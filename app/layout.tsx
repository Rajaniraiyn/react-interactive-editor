import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://studio.local"),
  title: {
    default: "JSX Studio – Paste JSX, edit visually",
    template: "%s • JSX Studio",
  },
  description: "Paste React JSX, get a live, editable preview with minimal, elegant controls.",
  openGraph: {
    title: "JSX Studio – Paste JSX, edit visually",
    description: "Paste React JSX, get a live, editable preview with minimal, elegant controls.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSX Studio – Paste JSX, edit visually",
    description: "Paste React JSX, get a live, editable preview with minimal, elegant controls.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
