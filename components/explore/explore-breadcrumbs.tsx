import Link from "next/link";
import { exploreCategoryLabel } from "@/lib/explore-constants";

export function ExploreBreadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ExploreSimilarMaterials({
  materials,
  category,
}: {
  materials: Array<{
    slug: string;
    title: string;
    excerpt?: string;
    category: string;
  }>;
  category: string;
}) {
  if (materials.length === 0) return null;

  return (
    <aside className="mt-16 pt-10 border-t border-border">
      <h2 className="text-lg font-medium mb-6">
        Ещё в разделе «{exploreCategoryLabel(category)}»
      </h2>
      <ul className="flex flex-col gap-4">
        {materials.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/explore/${item.slug}`}
              className="group block border border-border p-4 hover:bg-card transition-colors"
            >
              <p className="font-medium group-hover:text-baikal transition-colors">
                {item.title}
              </p>
              {item.excerpt && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.excerpt}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
