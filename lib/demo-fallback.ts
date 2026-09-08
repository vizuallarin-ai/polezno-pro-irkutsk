/**
 * Demo-данные из кода — только для локальной разработки без БД
 * или при явном ALLOW_DEMO_FALLBACK=true.
 *
 * Production is fail-closed: missing DATABASE_URL does NOT enable demo.
 * Opt-in only via ALLOW_DEMO_FALLBACK=true (discouraged on irkportal.ru).
 */
export function allowDemoFallback(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  if (env.ALLOW_DEMO_FALLBACK === "true") return true;
  if (env.NODE_ENV === "production") return false;
  return !env.DATABASE_URL;
}
