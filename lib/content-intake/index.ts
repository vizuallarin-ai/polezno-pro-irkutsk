/**
 * CONTENT.0 owner content intake — public API.
 * Dry-run only. No Payload / DB writes.
 */

export * from "./types";
export * from "./schemas";
export * from "./mapping";
export * from "./normalize";
export * from "./validate";
export * from "./plan";
export * from "./report";
export * from "./media";
export * from "./load";
export {
  TEST_FIXTURE_PACK,
  TEST_FIXTURE_INCOMPLETE,
} from "./fixtures";

export const CONTENT_0_GATE = {
  name: "CONTENT.0",
  allowsFakeContent: false,
  allowsProductionMutation: false,
  allowsPublish: false,
  handoffTo: "CONTENT.1",
  content1Requires: [
    "owner pack received",
    "validation completed",
    "blocking ambiguities resolved",
    "media rights resolved",
    "minimum launch pack ready",
    "dry-run ingest plan reviewed",
    "explicit ingest authorization received",
  ],
} as const;
