type AnyObject = Record<string, unknown>;

export type SiteContentOverrides = {
  home?: Record<string, unknown>;
  about?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
  thankYou?: Record<string, unknown>;
};

function isObject(value: unknown): value is AnyObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: unknown, patch: unknown): unknown {
  if (Array.isArray(base)) {
    return Array.isArray(patch) ? patch : base;
  }

  if (!isObject(base)) {
    return patch === undefined ? base : patch;
  }

  if (!isObject(patch)) {
    return base;
  }

  const merged: AnyObject = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    merged[key] = key in merged ? deepMerge(merged[key], value) : value;
  }

  return merged;
}

export function parseSiteContentJson(raw: string): SiteContentOverrides {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return isObject(parsed) ? (parsed as SiteContentOverrides) : {};
  } catch {
    return {};
  }
}

export function mergeContentWithOverrides<T>(base: T, overrides: unknown): T {
  return deepMerge(base, overrides) as T;
}

export async function readLandingPageContent(): Promise<SiteContentOverrides> {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!supabaseUrl || !serviceRoleKey) return {};

  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/landing_page?key=eq.main&select=content`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      },
      cache: "no-store"
    });

    if (!response.ok) return {};
    const data = await response.json();
    return data[0]?.content || {};
  } catch (error) {
    console.error("Error reading landing page content:", error);
    return {};
  }
}

export async function writeLandingPageContent(content: SiteContentOverrides) {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!supabaseUrl || !serviceRoleKey) return { ok: false, error: "Missing Supabase config" };

  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/landing_page?on_conflict=key`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify({ key: "main", content, updated_at: new Date().toISOString() })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Supabase Save Error:", { status: response.status, details });
      return { ok: false, error: details };
    }

    return { ok: true };
  } catch (error) {
    console.error("Write Content Exception:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
