import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { PostHogProvider, ThemeProvider } from "@/components";
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
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("mcc-theme")?.value;

  // Only set data-theme when the user has explicitly chosen a theme (via cookie).
  // When absent, CSS @media (prefers-color-scheme) handles it automatically.
  const theme =
    themeCookie === "light" || themeCookie === "dark"
      ? themeCookie
      : undefined;

  return (
    <html
      lang="sk"
      className={`${plusJakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
      {...(theme ? { "data-theme": theme } : {})}
    >
      <body>
        <ThemeProvider initialTheme={theme}>
          <PostHogProvider>{children}</PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

