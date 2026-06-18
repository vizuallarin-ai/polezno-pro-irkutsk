import { redirect } from "next/navigation";

interface ProgramRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Сохраняем старый URL /program — редирект на /business с query-параметрами. */
export default async function ProgramRedirectPage({
  searchParams,
}: ProgramRedirectProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      qs.set(key, value);
    } else if (Array.isArray(value) && value[0]) {
      qs.set(key, value[0]);
    }
  }

  const query = qs.toString();
  redirect(query ? `/business?${query}` : "/business");
}
