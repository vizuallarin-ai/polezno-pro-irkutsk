/**
 * Media validation helpers for owner intake (no OCR, no image mutation).
 */

import fs from "node:fs";
import path from "node:path";
import type { OwnerMediaItem } from "./schemas";
import type { Issue } from "./types";

const SUPPORTED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".svg",
  ".mp4",
  ".webm",
  ".pdf",
]);

const MAX_BYTES = 50_000_000;

export type MediaFileCheck = {
  ownerContentId: string;
  exists: boolean;
  supportedFormat: boolean;
  fileSizeBytes?: number;
  issues: Issue[];
};

export function checkMediaFileOnDisk(
  item: OwnerMediaItem,
  mediaRoot: string
): MediaFileCheck {
  const issues: Issue[] = [];
  const name = item.file || item.originalFilename;
  if (!name) {
    return {
      ownerContentId: item.ownerContentId,
      exists: false,
      supportedFormat: false,
      issues: [
        {
          severity: "BLOCKER",
          code: "FILE_MISSING",
          entity: "media",
          entityId: item.ownerContentId,
          message: "No filename",
        },
      ],
    };
  }

  const abs = path.isAbsolute(name) ? name : path.join(mediaRoot, name);
  const exists = fs.existsSync(abs);
  const ext = path.extname(name).toLowerCase();
  const supportedFormat = SUPPORTED_EXT.has(ext);

  if (!exists) {
    issues.push({
      severity: "BLOCKER",
      code: "FILE_NOT_FOUND",
      entity: "media",
      entityId: item.ownerContentId,
      message: `File not found: ${name}`,
    });
  }
  if (!supportedFormat) {
    issues.push({
      severity: "BLOCKER",
      code: "UNSUPPORTED_FORMAT",
      entity: "media",
      entityId: item.ownerContentId,
      message: `Unsupported format: ${ext || "(none)"}`,
    });
  }

  let fileSizeBytes: number | undefined;
  if (exists) {
    try {
      fileSizeBytes = fs.statSync(abs).size;
      if (fileSizeBytes > MAX_BYTES) {
        issues.push({
          severity: "BLOCKER",
          code: "FILE_TOO_LARGE",
          entity: "media",
          entityId: item.ownerContentId,
          message: `File exceeds ${MAX_BYTES} bytes`,
        });
      }
      if (fileSizeBytes === 0) {
        issues.push({
          severity: "BLOCKER",
          code: "FILE_EMPTY",
          entity: "media",
          entityId: item.ownerContentId,
          message: "Empty file",
        });
      }
    } catch {
      issues.push({
        severity: "WARNING",
        code: "STAT_FAILED",
        entity: "media",
        entityId: item.ownerContentId,
        message: "Could not stat file",
      });
    }
  }

  if (item.width && item.height) {
    if (item.role === "hero" && (item.width < 1200 || item.height < 800)) {
      issues.push({
        severity: "WARNING",
        code: "LOW_RES_HERO",
        entity: "media",
        entityId: item.ownerContentId,
        message: "Hero image below recommended 1200×800",
      });
    }
  }

  return {
    ownerContentId: item.ownerContentId,
    exists,
    supportedFormat,
    fileSizeBytes,
    issues,
  };
}

export const MEDIA_NAMING_POLICY = {
  canonicalPattern: "irkutsk-{role}-{nn}.{ext}",
  preserveOriginalMapping: true,
  doNotRenameWithoutManifest: true,
  example: "irkutsk-flagship-excursion-01.jpg",
} as const;

export const RAW_PRESERVATION_POLICY = {
  layers: ["raw/", "normalized/", "ready/"] as const,
  binaryLocation:
    "owner-content-private/ (gitignored) — never commit client originals by default",
  gitSafe: [
    "schemas",
    "templates",
    "empty pack.json",
    "manifests without binaries",
    "synthetic TEST_FIXTURE only",
  ],
} as const;
