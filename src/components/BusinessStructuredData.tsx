import { absoluteUrl } from "@/lib/site";

export function BusinessStructuredData({ name, description, path }: { name: string; description: string; path: string }) {
  const url = absoluteUrl(path);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", name, description, url, inLanguage: "ja" },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "トップ", item: absoluteUrl("") },
          { "@type": "ListItem", position: 2, name: "事業者向け", item: absoluteUrl("business/") },
          { "@type": "ListItem", position: 3, name, item: url },
        ],
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
