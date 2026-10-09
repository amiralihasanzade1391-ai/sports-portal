import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

import { Providers } from "@/app/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/shared/scroll-to-top";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

// ─── Dynamic SEO Metadata with hreflang Alternates ────────────────────────────

export async function generateMetadata({
  params: { locale },
}: LocaleLayoutProps): Promise<Metadata> {
  const isRtl = locale === "fa";

  return {
    title: isRtl
      ? "پورتال جامع ورزش | نتایج زنده، اخبار و جدول لیگ‌ها"
      : "Sports Portal | Real-time Scores, News & Match Highlights",
    description: isRtl
      ? "مرجع تخصصی اخبار ورزشی، نتایج زنده، خلاصه بازی‌ها و جدول رده‌بندی مسابقات جهان."
      : "Your one-stop destination for live scores, breaking sports news, video highlights, and community updates.",
    metadataBase: new URL("https://sportsportal.com"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        fa: "/fa",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate incoming locale against allowed routing list
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load message dictionaries for the active locale
  const messages = await getMessages();
  const isRtl = locale === "fa";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${inter.variable} ${vazirmatn.variable}`}
    >
      <body
        className={`min-h-screen bg-background text-foreground flex flex-col antialiased ${
          isRtl ? "font-persian" : "font-sans"
        }`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
