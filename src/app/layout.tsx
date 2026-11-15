import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { PostHogProvider, ThemeProvider, Header, Footer, BottomNav, ServiceWorkerRegistration, JsonLd } from "@/components";
import { BASE_OPEN_GRAPH, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/structuredData";
import "./globals.scss";
import styles from "./page.module.scss";

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
  // Makes every relative URL in metadata (canonical, og:image) absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Pages set only their own part: "Recepty tohto týždňa" → "Recepty tohto týždňa — My Cheap Chef".
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: BASE_OPEN_GRAPH,
  twitter: {
    card: "summary_large_image",
  },
  appleWebApp: {
    capable: true,
    title: "My Cheap Chef",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#ff6d00",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the page reach under the iPhone notch and home indicator; without it
  // env(safe-area-inset-*) is always 0 and the tab bar can't clear the indicator.
  viewportFit: "cover",
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
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
        <ThemeProvider initialTheme={theme}>
          <ServiceWorkerRegistration />
          <PostHogProvider>
            {/* <DevThemePanel /> */}
            <div className={styles.shell}>
              <Header />
              <main className={styles.main}>
                {children}
              </main>
              <Footer />
            </div>
            <BottomNav />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

