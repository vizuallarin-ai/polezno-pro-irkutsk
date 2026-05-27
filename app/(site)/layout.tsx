import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LenisProvider } from "@/components/layout/lenis-provider";
import { getNavigation } from "@/lib/navigation";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNavigation();

  return (
    <LenisProvider>
      <Header links={nav.links} ctaLabel={nav.ctaLabel} ctaHref={nav.ctaHref} />
      <main>{children}</main>
      <Footer />
    </LenisProvider>
  );
}
