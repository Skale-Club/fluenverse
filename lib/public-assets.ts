const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function getConfiguredAssetBaseUrl() {
  const explicitBaseUrl = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || "").trim();
  if (explicitBaseUrl) {
    return trimTrailingSlash(explicitBaseUrl);
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const bucket = (process.env.NEXT_PUBLIC_PUBLIC_ASSETS_BUCKET || "landing-page").trim();
  if (supabaseUrl && bucket) {
    return `${trimTrailingSlash(supabaseUrl)}/storage/v1/object/public/${bucket}`;
  }

  return "";
}

export function assetUrl(path: string) {
  if (!path) return path;
  if (ABSOLUTE_URL_PATTERN.test(path) || path.startsWith("data:")) {
    return path;
  }

  const normalizedPath = ensureLeadingSlash(path);
  const baseUrl = getConfiguredAssetBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export function absoluteAssetUrl(path: string, siteUrl?: string) {
  const resolved = assetUrl(path);
  if (ABSOLUTE_URL_PATTERN.test(resolved)) {
    return resolved;
  }

  const baseSiteUrl = trimTrailingSlash(
    (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "").trim()
  );
  return baseSiteUrl ? `${baseSiteUrl}${resolved}` : resolved;
}

export const PUBLIC_ASSETS = {
  logo: assetUrl("/logo.png"),
  logoAvatar: assetUrl("/logo-avatar.png"),
  heroPeople: assetUrl("/hero-people.png"),
  leila: assetUrl("/leila.jpg"),
  earthAtNight: assetUrl("/earth-at-night.png"),
  presentationIntro: assetUrl("/presentation-intro.png"),
  favicon: assetUrl("/favicon-f.png"),
  testimonial1: assetUrl("/testimonial-1.jpg"),
  testimonial2: assetUrl("/testimonial-2.jpg"),
  flags: {
    br: assetUrl("/flag-br.svg"),
    us: assetUrl("/flag-us.svg"),
    ca: assetUrl("/flag-ca.svg")
  }
} as const;

export function conversationAsset(index: number) {
  return assetUrl(`/convo-${index}.png`);
}
