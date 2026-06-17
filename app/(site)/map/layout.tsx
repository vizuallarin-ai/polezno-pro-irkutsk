import { YandexMapsScript } from "@/components/map/yandex-maps-script";

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <YandexMapsScript />
      {children}
    </>
  );
}
