import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export function businessMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const fullTitle = `${title}｜${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", locale: "ja_JP", siteName: SITE_NAME, title: fullTitle, description, url: absoluteUrl(path), images: [{ url: absoluteUrl("assets/images/hero/hero-tokyo-walk.webp"), width: 1600, height: 900, alt: "東京の街歩きを表現したイメージ" }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [absoluteUrl("assets/images/hero/hero-tokyo-walk.webp")] },
  };
}
