import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LenisProvider } from "@/components/layout/lenis-provider";
import { getNavigation } from "@/lib/navigation";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);

  return (
    <LenisProvider>
      <Header
        links={nav.links}
        ctaLabel={settings.mainCta.label}
        ctaHref={settings.mainCta.href}
        projectName={settings.projectName}
      />
      <main>{children}</main>
      <Footer settings={settings} />
    </LenisProvider>
  );
}
