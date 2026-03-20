type ConfigMap = Record<string, string>;

const CONFIG_TABLE = "app_config";
const CONFIG_FETCH_TIMEOUT_MS = 5000;

export const INTEGRATION_KEYS = [
  "GHL_API_KEY",
  "GHL_LOCATION_ID",
  "GHL_CALENDAR_ID",
  "GHL_API_BASE_URL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
  "TWILIO_TO_NUMBERS",
  "TWILIO_ENABLED",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
  "FACEBOOK_DATASET_ID",
  "FACEBOOK_ACCESS_TOKEN",
  "FACEBOOK_TEST_EVENT_CODE",
  "FACEBOOK_ENABLED",
  "EVENT_HERO_CTA_GA",
  "EVENT_HERO_CTA_FB",
  "EVENT_MODAL_OPEN_GA",
  "EVENT_MODAL_OPEN_FB",
  "EVENT_SURVEY_SUBMIT_GA",
  "EVENT_SURVEY_SUBMIT_FB",
  "EVENT_THANK_YOU_GA",
  "EVENT_THANK_YOU_FB",
  "SEO_TITLE",
  "SEO_DESCRIPTION",
  "SEO_KEYWORDS",
  "SEO_AUTHOR",
  "OG_SITE_NAME",
  "OG_TYPE",
  "OG_IMAGE_URL",
  "SEO_ROBOTS_INDEX",
  "SEO_ROBOTS_FOLLOW",
  "SEO_TWITTER_CARD",
  "SEO_TWITTER_SITE",
  "SEO_TWITTER_CREATOR",
  "SEO_GOOGLE_SITE_VERIFICATION",
  "FACEBOOK_APP_ID",
  "LP_HERO_KICKER_PT",
  "LP_HERO_TITLE_PT",
  "LP_HERO_COPY_PT",
  "LP_HERO_CTA_PT",
  "LP_HERO_KICKER_EN",
  "LP_HERO_TITLE_EN",
  "LP_HERO_COPY_EN",
  "LP_HERO_CTA_EN",
  "LP_ABOUT_TITLE_PT",
  "LP_ABOUT_QUOTE_PT",
  "LP_ABOUT_CTA_PT",
  "LP_ABOUT_TITLE_EN",
  "LP_ABOUT_QUOTE_EN",
  "LP_ABOUT_CTA_EN",
  "SITE_CONTENT_JSON"
] as const;

export const PUBLIC_CONFIG_KEYS = [
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
  "EVENT_HERO_CTA_GA",
  "EVENT_HERO_CTA_FB",
  "EVENT_MODAL_OPEN_GA",
  "EVENT_MODAL_OPEN_FB",
  "EVENT_SURVEY_SUBMIT_GA",
  "EVENT_SURVEY_SUBMIT_FB",
  "EVENT_THANK_YOU_GA",
  "EVENT_THANK_YOU_FB",
  "SEO_TITLE",
  "SEO_DESCRIPTION",
  "SEO_KEYWORDS",
  "SEO_AUTHOR",
  "OG_SITE_NAME",
  "OG_TYPE",
  "OG_IMAGE_URL",
  "SEO_ROBOTS_INDEX",
  "SEO_ROBOTS_FOLLOW",
  "SEO_TWITTER_CARD",
  "SEO_TWITTER_SITE",
  "SEO_TWITTER_CREATOR",
  "SEO_GOOGLE_SITE_VERIFICATION",
  "FACEBOOK_APP_ID",
  "LP_HERO_KICKER_PT",
  "LP_HERO_TITLE_PT",
  "LP_HERO_COPY_PT",
  "LP_HERO_CTA_PT",
  "LP_HERO_KICKER_EN",
  "LP_HERO_TITLE_EN",
  "LP_HERO_COPY_EN",
  "LP_HERO_CTA_EN",
  "LP_ABOUT_TITLE_PT",
  "LP_ABOUT_QUOTE_PT",
  "LP_ABOUT_CTA_PT",
  "LP_ABOUT_TITLE_EN",
  "LP_ABOUT_QUOTE_EN",
  "LP_ABOUT_CTA_EN",
  "SITE_CONTENT_JSON"
] as const;



function getFallbackEnvConfig(): ConfigMap {
  const values: ConfigMap = {};
  for (const key of INTEGRATION_KEYS) {
    values[key] = process.env[key] ?? "";
  }
  return values;
}

function getSupabaseAdminConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return { supabaseUrl, serviceRoleKey };
}

function buildHeaders(serviceRoleKey: string) {
  return {
    "Content-Type": "application/json",
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`
  };
}

export async function readIntegrationConfig(): Promise<{ config: ConfigMap; source: "db" | "env" }> {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  const fallback = getFallbackEnvConfig();

  if (!supabaseUrl || !serviceRoleKey) {
    return { config: fallback, source: "env" };
  }

  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${CONFIG_TABLE}?select=key,value`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG_FETCH_TIMEOUT_MS);
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(serviceRoleKey),
      cache: "no-store",
      signal: controller.signal
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      return { config: fallback, source: "env" };
    }

    const rows = (await response.json()) as Array<{ key?: string; value?: string | null }>;
    const fromDb: ConfigMap = {};
    for (const row of rows) {
      if (!row?.key) continue;
      fromDb[row.key] = String(row.value ?? "");
    }

    return {
      config: { ...fallback, ...fromDb },
      source: "db"
    };
  } catch {
    return { config: fallback, source: "env" };
  }
}

export async function writeIntegrationConfig(pairs: Record<string, string>) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      error:
        "Configuração do Supabase ausente no servidor. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente."
    };
  }

  const rows = Object.entries(pairs).map(([key, value]) => ({
    key,
    value: String(value ?? "")
  }));

  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${CONFIG_TABLE}?on_conflict=key`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG_FETCH_TIMEOUT_MS);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...buildHeaders(serviceRoleKey),
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(rows),
      signal: controller.signal
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      const details = await response.text();
      if (details.includes(`relation "${CONFIG_TABLE}" does not exist`)) {
        return {
          ok: false,
          error:
            `Tabela ${CONFIG_TABLE} não existe. Rode no Supabase: create table public.${CONFIG_TABLE} (key text primary key, value text not null default '', updated_at timestamptz not null default now());`
        };
      }

      return { ok: false, error: `Falha ao salvar no banco: ${response.status} ${details}` };
    }

    return { ok: true as const };
  } catch (error) {
    return {
      ok: false,
      error: `Falha ao salvar no banco: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
}
