import { storeConfig } from "@/config/stores/clothing.config";

/**
 * Canonical site origin, used for metadataBase, canonicals, sitemap and JSON-LD.
 * Falls back to localhost in dev so `new URL()` never throws.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = storeConfig.name;

/** Build an absolute URL from a root-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trim/normalise a string for use as a meta description. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}
