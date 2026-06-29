import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Script from "next/script";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://faresay.com"),
  title: "Faresay — therapy that's fair",
  description:
    "Faresay is the simple, private practice tool for therapists — your clients, scheduling, secure video and payments in one place.",
  openGraph: {
    title: "Faresay — therapy that's fair",
    description:
      "Connect with registered therapists. Fair pricing for clients, properly paid therapists.",
    url: "https://faresay.com",
    siteName: "Faresay",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faresay — therapy that's fair",
    description:
      "Connect with registered therapists. Fair pricing for clients, properly paid therapists.",
  },
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "Faresay", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/apple-touch-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#217567",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = (await headers()).get("x-locale") ?? "en";
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
          <div className="bg-coral-600 text-white text-center text-xs py-1.5 px-4 font-medium">
            UAT / demo environment — sample data, not a live service. Don’t enter real personal information.
          </div>
        )}
        <ClerkProvider>{children}</ClerkProvider>
        <PWARegister />
        <Script
          defer
          data-domain="faresay.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
