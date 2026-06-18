"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PHOTO_FILTER_CHIPS } from "@/lib/photo-constants";
import { cn } from "@/lib/utils";

export function PhotoFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";
  const photoType = searchParams.get("type") ?? "all";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `/explore/photos?${qs}` : "/explore/photos", {
      scroll: false,
    });
  };

  return (
    <div className="space-y-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory"
        role="tablist"
        aria-label="Категории фото"
      >
        {PHOTO_FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={active === chip.id}
            onClick={() => setParam("category", chip.id)}
            className={cn(
              "shrink-0 snap-start text-xs px-3 py-2 border transition-colors duration-150 whitespace-nowrap",
              active === chip.id
                ? "bg-foreground text-primary-foreground border-foreground"
                : "bg-background text-foreground border-border hover:bg-muted"
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "Все периоды" },
          { id: "old", label: "Старые фото" },
          { id: "modern", label: "Современные" },
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setParam("type", chip.id)}
            className={cn(
              "text-xs px-3 py-1.5 border transition-colors",
              photoType === chip.id
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
