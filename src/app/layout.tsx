import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { PWARegister } from "@/components/PWARegister";
import { DictProvider } from "@/components/DictProvider";
import { getDictionary, getLocaleFromHeaders } from "@/lib/dictionaries";
import { getTenant } from "@/lib/tenant";
import { tenantThemeCss, HEX_RE } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const defaultMetadata: Metadata = {
  metadataBase: new URL("https://fair-do.com"),
  title: "fair-do — tutoring that's fair",
  description:
    "fair-do is the simple, private practice tool for tutors — your students, scheduling, secure video and payments in one place.",
  openGraph: {
    title: "fair-do — tutoring that's fair",
    description:
      "Connect with qualified tutors. Fair pricing for students, properly paid tutors.",
    url: "https://fair-do.com",
    siteName: "fair-do",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "fair-do — tutoring that's fair",
    description:
      "Connect with qualified tutors. Fair pricing for students, properly paid tutors.",
  },
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "fair-do", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/apple-touch-180.png",
  },
};

// Tenant (school) hosts carry the school's name and colour; the apex
// marketplace returns exactly the defaults above. getTenant() is null when the
// enterprise portal flag is off, so the apex path is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  if (!tenant) return defaultMetadata;
  const title = `${tenant.name} — tutoring portal`;
  const description = `${tenant.name}'s tutoring portal — book lessons, join video sessions and track progress. Powered by fair-do.`;
  return {
    ...defaultMetadata,
    title,
    description,
    openGraph: { ...defaultMetadata.openGraph, title, description, siteName: tenant.name },
    twitter: { ...defaultMetadata.twitter, title, description },
    appleWebApp: { capable: true, title: tenant.name, statusBarStyle: "default" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const tenant = await getTenant();
  const brand = tenant?.brandColor;
  return { themeColor: brand && HEX_RE.test(brand) ? brand : "#4f46e5" };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromHeaders();
  const dict = await getDictionary(locale);
  // One inline <style> overriding the @theme CSS variables — no per-tenant CSS
  // build. null on the apex (or invalid colours) → not rendered at all.
  const tenant = await getTenant();
  const themeCss = tenant ? tenantThemeCss(tenant) : null;
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
          <div className="bg-coral-600 text-white text-center text-xs py-1.5 px-4 font-medium">
            UAT / demo environment — sample data, not a live service. Don&apos;t enter real personal information.
          </div>
        )}
        <ClerkProvider>
          <DictProvider dict={dict}>{children}</DictProvider>
        </ClerkProvider>
        <PWARegister />
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          defer
          src="https://plausible.io/js/pa-razXEoY_HICMfZ98WVC7z.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>
      </body>
    </html>
  );
}
