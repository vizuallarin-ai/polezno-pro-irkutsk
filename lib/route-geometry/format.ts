export function formatRouteDistance(meters: number | null | undefined): string {
  if (!meters || meters <= 0) return "—";
  if (meters < 1000) return `около ${Math.round(meters / 50) * 50} м`;
  const km = meters / 1000;
  if (km < 10) return `примерно ${km.toFixed(1).replace(".", ",")} км`;
  return `примерно ${Math.round(km)} км`;
}

export function formatWalkingDuration(
  minMinutes: number | null | undefined,
  maxMinutes: number | null | undefined
): string {
  if (!minMinutes && !maxMinutes) return "—";
  const min = minMinutes ?? maxMinutes ?? 0;
  const max = maxMinutes ?? minMinutes ?? 0;
  if (min <= 0 && max <= 0) return "—";
  if (min === max) return `около ${min} мин`;
  if (max >= 240) return "полдня";
  return `${min}–${max} мин`;
}

export const GEOMETRY_SOURCE_LABELS: Record<string, string> = {
  manual: "Ручная линия",
  yandex_api: "Яндекс API",
  fallback: "По точкам (прямые)",
  none: "Только точки",
};

export const GEOMETRY_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  active: "Активна",
  needs_review: "Требует проверки",
  error: "Ошибка",
  archived: "В архиве",
};
