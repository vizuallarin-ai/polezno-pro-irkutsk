/**
 * Pack load + change detection between pack versions (pre-mutation).
 */

import fs from "node:fs";
import path from "node:path";
import { ownerPackSchema, type OwnerPack, EMPTY_OWNER_PACK } from "./schemas";
import type { ChangeKind } from "./types";

export const DEFAULT_PACK_PATH = path.join(
  process.cwd(),
  "docs",
  "owner-content",
  "pack.json"
);

export function loadOwnerPackFromFile(
  filePath: string = DEFAULT_PACK_PATH
): OwnerPack {
  if (!fs.existsSync(filePath)) {
    return { ...EMPTY_OWNER_PACK };
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return ownerPackSchema.parse(raw);
}

export type FieldChange = {
  path: string;
  kind: ChangeKind;
  before?: string;
  after?: string;
};

function preview(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

/** Shallow-ish pack diff for human review before CONTENT.1 ingest. */
export function diffOwnerPacks(
  previous: OwnerPack,
  next: OwnerPack
): FieldChange[] {
  const changes: FieldChange[] = [];

  const metaKeys = [
    "packVersion",
    "receivedAt",
    "source",
    "ownerConfirmedAt",
  ] as const;
  for (const k of metaKeys) {
    if (previous[k] !== next[k]) {
      changes.push({
        path: k,
        kind: previous[k] == null ? "NEW" : next[k] == null ? "REMOVED" : "CHANGED",
        before: preview(previous[k]),
        after: preview(next[k]),
      });
    }
  }

  const prevExc = new Map(previous.excursions.map((e) => [e.ownerContentId, e]));
  const nextExc = new Map(next.excursions.map((e) => [e.ownerContentId, e]));
  for (const id of new Set([...prevExc.keys(), ...nextExc.keys()])) {
    const a = prevExc.get(id);
    const b = nextExc.get(id);
    if (!a && b) {
      changes.push({ path: `excursions.${id}`, kind: "NEW", after: b.title });
      continue;
    }
    if (a && !b) {
      changes.push({ path: `excursions.${id}`, kind: "REMOVED", before: a.title });
      continue;
    }
    if (a && b) {
      for (const key of ["title", "groupSize", "meetingPoint"] as const) {
        if (a[key] !== b[key]) {
          changes.push({
            path: `excursions.${id}.${key}`,
            kind: "CHANGED",
            before: preview(a[key]),
            after: preview(b[key]),
          });
        }
      }
      if (JSON.stringify(a.price) !== JSON.stringify(b.price)) {
        changes.push({
          path: `excursions.${id}.price`,
          kind: "CHANGED",
          before: preview(a.price),
          after: preview(b.price),
        });
      }
    }
  }

  return changes.length
    ? changes
    : [{ path: "(pack)", kind: "UNCHANGED", before: "—", after: "—" }];
}

export function formatPackDiff(changes: FieldChange[]): string {
  return changes
    .map((c) => {
      if (c.kind === "UNCHANGED") return "No changes detected.";
      if (c.kind === "NEW") return `${c.path}:\n(new)\n→ ${c.after ?? ""}`;
      if (c.kind === "REMOVED") return `${c.path}:\n${c.before ?? ""}\n→ (removed)`;
      return `${c.path}:\n${c.before ?? ""}\n→ ${c.after ?? ""}`;
    })
    .join("\n\n");
}
