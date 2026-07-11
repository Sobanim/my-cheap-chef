import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { PostHogProvider } from "@/components";
import "./globals.scss";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Cheap Chef — Varím zo zliav",
  description:
    "Appka ti povie, čo uvariť z produktov, ktoré sú práve v zľave v Lidli. Šetri peniaze a varí chutne.",
  applicationName: "My Cheap Chef",
  appleWebApp: {
    capable: true,
    title: "My Cheap Chef",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sk"
      className={`${plusJakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
