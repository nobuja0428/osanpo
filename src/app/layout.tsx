import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InlineEnhancements } from "@/components/InlineEnhancements";
import { Analytics } from "@/components/Analytics";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s｜${SITE_NAME}`,
  },
  description: "時間・予算・同行者・気分から、東京の散歩コースを探せる地域メディア。",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "時間・予算・同行者・気分から、東京の散歩コースを探せます。",
    url: SITE_URL,
    images: [{ url: absoluteUrl("assets/images/hero/hero-tokyo-walk.webp"), width: 1600, height: 900, alt: "東京の街歩きを表現したイメージ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "時間・予算・同行者・気分から、東京の散歩コースを探せます。",
    images: [absoluteUrl("assets/images/hero/hero-tokyo-walk.webp")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "ja" },
      { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: SITE_NAME, url: SITE_URL },
    ],
  };

  return (
    <html lang="ja">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {measurementId ? <Analytics /> : null}
        <a className="skip-link" href="#main">本文へ移動</a>
        <Header />
        {children}
        <Footer />
        <MobileBottomNav />
        <InlineEnhancements />
      </body>
    </html>
  );
}
