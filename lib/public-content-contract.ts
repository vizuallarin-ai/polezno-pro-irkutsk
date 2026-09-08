import { allowDemoFallback } from "@/lib/demo-fallback";
import {
  isDemoPublicMarker,
  isPublishedCommercialCandidate,
  isPublicPublishedReady,
  classifyCommercialRecord,
  mayRenderPublicDetail,
  isSitemapEligible,
  commercialInputFromDoc,
  publicSurfacesForRecord,
  isSectionPagePublic,
  catalogReadiness,
  type ContentReadiness,
  type CommercialRecordInput,
  type PublicSurfaceDecision,
} from "@/lib/content-readiness";

export {
  isDemoPublicMarker,
  isPublishedCommercialCandidate,
  isPublicPublishedReady,
  classifyCommercialRecord,
  mayRenderPublicDetail,
  isSitemapEligible,
  commercialInputFromDoc,
  publicSurfacesForRecord,
  isSectionPagePublic,
  catalogReadiness,
};
export type { ContentReadiness, CommercialRecordInput, PublicSurfaceDecision };

export function shouldUseDemoFallback(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  return allowDemoFallback(env);
}

/**
 * Production must never silently run demo mode.
 * Missing DATABASE_URL in production → demo OFF (fail-closed surfaces / health).
 */
export function demoFallbackContractOk(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  if (env.NODE_ENV === "production") {
    if (env.ALLOW_DEMO_FALLBACK === "true") return false;
    return !shouldUseDemoFallback(env);
  }
  return allowDemoFallback(env) === shouldUseDemoFallback(env);
}
