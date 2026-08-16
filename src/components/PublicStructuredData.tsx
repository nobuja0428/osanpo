import { absoluteUrl } from "@/lib/site";

type StructuredType = "WebPage" | "CollectionPage" | "TouristTrip" | "TouristDestination" | "TouristAttraction" | "Article" | "Event";

type PublicStructuredDataProps = {
  type: StructuredType;
  name: string;
  description: string;
  path: string;
  parent: { name: string; path: string };
  image?: string;
  dateModified?: string;
  items?: readonly { name: string; path: string }[];
  event?: { startDate: string; endDate: string; locationName: string };
};

export function PublicStructuredData({ type, name, description, path, parent, image, dateModified, items, event }: PublicStructuredDataProps) {
  const url = absoluteUrl(path);
  const page: Record<string, unknown> = { "@type": type, name, description, url, inLanguage: "ja" };
  if (image) page.image = absoluteUrl(image);
  if (dateModified) page.dateModified = dateModified;
  if (type === "Article") page.headline = name;
  if (type === "Event" && event) {
    page.startDate = event.startDate;
    page.endDate = event.endDate;
    page.eventAttendanceMode = "https://schema.org/OfflineEventAttendanceMode";
    page.eventStatus = "https://schema.org/EventScheduled";
    page.location = { "@type": "Place", name: event.locationName };
  }

  const graph: Record<string, unknown>[] = [
    page,
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: absoluteUrl("") },
        { "@type": "ListItem", position: 2, name: parent.name, item: absoluteUrl(parent.path) },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
  ];
  if (items?.length) graph.push({
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: absoluteUrl(item.path) })),
  });

  const serialized = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
