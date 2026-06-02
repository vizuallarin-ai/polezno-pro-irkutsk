"use client";

import { ROUTE_FILTERS, type RouteFilterId } from "@/lib/data/routes";
import { cn } from "@/lib/utils";

interface RouteFiltersProps {
  activeFilter: RouteFilterId;
  onFilterChange: (id: RouteFilterId) => void;
  className?: string;
}

export function RouteFilters({
  activeFilter,
  onFilterChange,
  className,
}: RouteFiltersProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      role="tablist"
      aria-label="Фильтры маршрутов"
    >
      {ROUTE_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={activeFilter === filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "shrink-0 snap-start text-xs px-3 py-2 border transition-colors duration-150 whitespace-nowrap",
            activeFilter === filter.id
              ? "bg-foreground text-primary-foreground border-foreground"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
