"use client";

import Script from "next/script";

type AdSenseScriptProps = {
  publisherId: string;
};

export function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  return (
    <Script
      id="osanpo-adsense-script"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      onLoad={() => window.dispatchEvent(new Event("osanpo:adsense-ready"))}
      onError={() => window.dispatchEvent(new Event("osanpo:adsense-error"))}
    />
  );
}
