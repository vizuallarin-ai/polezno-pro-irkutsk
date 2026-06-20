/**
 * Demo-данные из кода — только для локальной разработки без БД
 * или при явном ALLOW_DEMO_FALLBACK=true.
 */
export function allowDemoFallback(): boolean {
  if (!process.env.DATABASE_URL) return true;
  return process.env.ALLOW_DEMO_FALLBACK === "true";
}
