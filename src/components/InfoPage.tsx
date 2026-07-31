import { PageHero } from "@/components/PageHero";

export function InfoPage({ eyebrow, title, lead, children }: {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main">
      <PageHero eyebrow={eyebrow} title={title} lead={lead} crumbs={[{ label: title }]} />
      <section className="section"><article className="narrow article-body">{children}</article></section>
    </main>
  );
}
