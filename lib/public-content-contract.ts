import { allowDemoFallback } from "@/lib/demo-fallback";
import {
  isDemoPublicMarker,
  isPublishedCommercialCandidate,
  isPublicPublishedReady,
  classifyCommercialRecord,
  mayRenderPublicDetail,
  isSitemapEligible,
  type ContentReadiness,
  type CommercialRecordInput,
} from "@/lib/content-readiness";

export {
  isDemoPublicMarker,
  isPublishedCommercialCandidate,
  isPublicPublishedReady,
  classifyCommercialRecord,
  mayRenderPublicDetail,
  isSitemapEligible,
};
export type { ContentReadiness, CommercialRecordInput };

export function shouldUseDemoFallback(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  if (!env.DATABASE_URL) return true;
  return env.ALLOW_DEMO_FALLBACK === "true";
}

export function demoFallbackContractOk(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  if (env.NODE_ENV === "production" && env.DATABASE_URL) {
    return !shouldUseDemoFallback(env);
  }
  return allowDemoFallback() === shouldUseDemoFallback(env);
}
