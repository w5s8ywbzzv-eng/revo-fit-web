import type { Metadata, Viewport } from "next";
import { Jost, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap"
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap"
});

export const metadata: Metadata = {
  title: "revo fit",
  description: "revo in your life — あなたの毎日を、動きで満たしていく。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "revo fit"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#16140F"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${jost.variable} ${outfit.variable}`} style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
        <ThemeProvider>
          <LocaleProvider>
            {children}
            <ServiceWorkerRegister />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
