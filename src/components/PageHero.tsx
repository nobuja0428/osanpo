import Link from "next/link";

type Crumb = { href?: string; label: string };

export function PageHero({ eyebrow, title, lead, crumbs = [] }: {
  eyebrow: string;
  title: string;
  lead: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumbs" aria-label="パンくず">
          <Link href="/">トップ</Link>
          {crumbs.map((crumb) => (
            <span key={`${crumb.href ?? ""}-${crumb.label}`}>
              <span aria-hidden="true"> / </span>
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
            </span>
          ))}
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
      </div>
    </section>
  );
}
