import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

export type LeadSource = "chat" | "survey";

export type ChatTranscriptItem = {
  role: "user" | "assistant";
  content: string;
};

export type LeadRecord = {
  id: string;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
  name?: string;
  email?: string;
  phone?: string;
  locale?: "pt" | "en" | "auto";
  location?: string;
  objective?: string[];
  objectiveOther?: string;
  level?: string;
  difficulty?: string;
  bestDay?: string[];
  transcript?: ChatTranscriptItem[];
  model?: string;
  completed?: boolean;
  answers?: Record<string, any>;
};

type SurveyLeadInput = {
  [key: string]: any;
};

type ChatLeadInput = {
  sessionId: string;
  transcript: ChatTranscriptItem[];
  model?: string;
  locale?: "pt" | "en" | "auto";
};

type LeadDbRow = {
  id: string;
  source: LeadSource;
  created_at: string;
  updated_at: string;
  session_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  locale?: "pt" | "en" | "auto" | null;
  location?: string | null;
  objective?: string[] | null;
  objective_other?: string | null;
  level?: string | null;
  difficulty?: string | null;
  best_day?: string[] | null;
  transcript?: ChatTranscriptItem[] | null;
  model?: string | null;
  completed?: boolean | null;
  answers?: Record<string, any> | null;
};

type LeadDbPayload = Partial<LeadDbRow>;

export type RemoveLeadByIdResult = {
  ok: boolean;
  removed: boolean;
};

const LEADS_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(LEADS_DIR, "leads.json");
const LEADS_TMP_FILE = path.join(LEADS_DIR, "leads.json.tmp");
const LEADS_TABLE = "leads";
const SUPABASE_TIMEOUT_MS = 5000;
const WRITE_RETRIES = 3;
const WRITE_RETRY_DELAY_MS = 100;

let writeQueue: Promise<void> = Promise.resolve();

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => normalizeText(item)).filter(Boolean) : [];
}

function normalizeDifficulty(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeList(value).join(", ");
  }
  return normalizeText(value);
}

function normalizeTranscript(value: unknown): ChatTranscriptItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const role = (item as { role?: unknown }).role;
      const content = normalizeText((item as { content?: unknown }).content);
      if ((role === "user" || role === "assistant") && content) {
        return { role, content } as ChatTranscriptItem;
      }
      return null;
    })
    .filter(Boolean) as ChatTranscriptItem[];
}

function sortLeadsByCreatedAt(leads: LeadRecord[]) {
  return [...leads].sort((a, b) => {
    const dateA = Date.parse(a.createdAt || "");
    const dateB = Date.parse(b.createdAt || "");
    return dateB - dateA;
  });
}

function mapDbRowToLead(row: LeadDbRow): LeadRecord {
  return {
    id: normalizeText(row.id),
    source: row.source,
    createdAt: normalizeText(row.created_at),
    updatedAt: normalizeText(row.updated_at),
    sessionId: normalizeText(row.session_id) || undefined,
    name: normalizeText(row.name) || undefined,
    email: normalizeText(row.email) || undefined,
    phone: normalizeText(row.phone) || undefined,
    locale: row.locale ?? undefined,
    location: normalizeText(row.location) || undefined,
    objective: row.objective ? normalizeList(row.objective) : undefined,
    objectiveOther: normalizeText(row.objective_other) || undefined,
    level: normalizeText(row.level) || undefined,
    difficulty: normalizeDifficulty(row.difficulty) || undefined,
    bestDay: row.best_day ? normalizeList(row.best_day) : undefined,
    transcript: row.transcript ? normalizeTranscript(row.transcript) : undefined,
    model: normalizeText(row.model) || undefined,
    completed: typeof row.completed === "boolean" ? row.completed : undefined,
    answers: row.answers ?? undefined
  };
}

function mapLeadToDbPayload(lead: Partial<LeadRecord>): LeadDbPayload {
  return {
    id: lead.id,
    source: lead.source,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
    session_id: lead.sessionId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    locale: lead.locale,
    location: lead.location,
    objective: lead.objective,
    objective_other: lead.objectiveOther,
    level: lead.level,
    difficulty: lead.difficulty,
    best_day: lead.bestDay,
    transcript: lead.transcript,
    model: lead.model,
    completed: lead.completed,
    answers: lead.answers
  };
}

function getSupabaseAdminConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return { supabaseUrl, serviceRoleKey };
}

function hasSupabaseAdminConfig() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  return Boolean(supabaseUrl && serviceRoleKey);
}

function buildSupabaseHeaders(serviceRoleKey: string, extras?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extras
  };
}

async function supabaseFetch(pathnameAndQuery: string, options: RequestInit = {}) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${pathnameAndQuery.replace(/^\//, "")}`;
  const shouldManageSignal = !options.signal;
  const controller = shouldManageSignal ? new AbortController() : null;
  const timer = shouldManageSignal ? setTimeout(() => controller?.abort(), SUPABASE_TIMEOUT_MS) : null;

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal ?? controller?.signal,
      headers: buildSupabaseHeaders(serviceRoleKey, options.headers as Record<string, string> | undefined),
      cache: options.cache ?? "no-store"
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function readLeadsFromDb() {
  const response = await supabaseFetch(`${LEADS_TABLE}?select=*&order=created_at.desc`);
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to read leads from Supabase: ${response.status} ${details}`);
  }

  const rows = (await response.json()) as LeadDbRow[];
  return rows.map(mapDbRowToLead);
}

async function findLeadBySourceSessionFromDb(source: LeadSource, sessionId: string) {
  const response = await supabaseFetch(
    `${LEADS_TABLE}?source=eq.${encodeURIComponent(source)}&session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to query lead from Supabase: ${response.status} ${details}`);
  }

  const rows = (await response.json()) as LeadDbRow[];
  if (!rows.length) return null;
  return mapDbRowToLead(rows[0]);
}

async function insertLeadToDb(payload: LeadDbPayload) {
  const response = await supabaseFetch(LEADS_TABLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([payload])
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to insert lead in Supabase: ${response.status} ${details}`);
  }

  const rows = (await response.json()) as LeadDbRow[];
  return rows[0] ? mapDbRowToLead(rows[0]) : null;
}

async function updateLeadByIdInDb(id: string, payload: LeadDbPayload) {
  const response = await supabaseFetch(`${LEADS_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to update lead in Supabase: ${response.status} ${details}`);
  }

  const rows = (await response.json()) as LeadDbRow[];
  return rows[0] ? mapDbRowToLead(rows[0]) : null;
}

async function removeLeadByIdFromDb(id: string): Promise<RemoveLeadByIdResult> {
  const response = await supabaseFetch(`${LEADS_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to delete lead in Supabase: ${response.status} ${details}`);
  }

  const rows = (await response.json()) as LeadDbRow[];
  return { ok: true, removed: rows.length > 0 };
}

async function readLeadsFile() {
  try {
    const raw = await readFile(LEADS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object") as LeadRecord[];
  } catch {
    return [];
  }
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeLeadsAtomically(payload: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < WRITE_RETRIES; attempt += 1) {
    try {
      await mkdir(LEADS_DIR, { recursive: true });
      await writeFile(LEADS_TMP_FILE, payload, "utf8");
      await rename(LEADS_TMP_FILE, LEADS_FILE);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < WRITE_RETRIES - 1) {
        await delay(WRITE_RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

async function mutateLeadsFile<T>(mutator: (leads: LeadRecord[]) => { leads: LeadRecord[]; result: T }) {
  let output!: T;
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const currentLeads = await readLeadsFile();
      const mutation = mutator(currentLeads);
      const payload = JSON.stringify(mutation.leads, null, 2);
      await writeLeadsAtomically(payload);
      output = mutation.result;
    });
  await writeQueue;
  return output;
}

function buildSurveyLead(input: SurveyLeadInput, now: string, id?: string): LeadRecord {
  return {
    id: id || randomUUID(),
    source: "survey",
    createdAt: now,
    updatedAt: now,
    sessionId: normalizeText(input.sessionId) || undefined,
    name: normalizeText(input.name),
    email: normalizeText(input.email),
    phone: normalizeText(input.phone),
    locale: input.locale,
    completed: Boolean(input.completed ?? true),
    location: normalizeText(input.location),
    objective: normalizeList(input.objective),
    objectiveOther: normalizeText(input.objectiveOther),
    level: normalizeText(input.level),
    difficulty: normalizeDifficulty(input.difficulty),
    bestDay: normalizeList(input.bestDay),
    answers: input
  };
}

export async function readLeads() {
  if (hasSupabaseAdminConfig()) {
    try {
      return await readLeadsFromDb();
    } catch (error) {
      console.error("readLeads: fallback to file storage due to Supabase error:", error);
    }
  }

  const leads = await readLeadsFile();
  return sortLeadsByCreatedAt(leads);
}

export async function appendSurveyLead(input: SurveyLeadInput) {
  const now = new Date().toISOString();
  const nextLead = buildSurveyLead(input, now);

  if (hasSupabaseAdminConfig()) {
    try {
      return (await insertLeadToDb(mapLeadToDbPayload(nextLead))) || nextLead;
    } catch (error) {
      console.error("appendSurveyLead: fallback to file storage due to Supabase error:", error);
    }
  }

  return mutateLeadsFile((leads) => {
    leads.push(nextLead);
    return { leads, result: nextLead };
  });
}

export async function upsertSurveyLead(input: SurveyLeadInput & { sessionId: string }) {
  const now = new Date().toISOString();
  const sessionId = normalizeText(input.sessionId);
  if (!sessionId) return null;

  const updatedData: Partial<LeadRecord> = {
    updatedAt: now,
    name: normalizeText(input.name) || undefined,
    email: normalizeText(input.email) || undefined,
    phone: normalizeText(input.phone) || undefined,
    locale: input.locale,
    location: normalizeText(input.location) || undefined,
    objective: input.objective ? normalizeList(input.objective) : undefined,
    objectiveOther: normalizeText(input.objectiveOther) || undefined,
    level: normalizeText(input.level) || undefined,
    difficulty: normalizeDifficulty(input.difficulty) || undefined,
    bestDay: input.bestDay ? normalizeList(input.bestDay) : undefined,
    answers: input,
    completed: input.completed ?? false
  };

  if (hasSupabaseAdminConfig()) {
    try {
      const existing = await findLeadBySourceSessionFromDb("survey", sessionId);
      if (existing) {
        if (existing.completed && !input.completed) {
          return existing;
        }

        const merged: LeadRecord = {
          ...existing,
          ...updatedData,
          name: updatedData.name || existing.name,
          email: updatedData.email || existing.email,
          phone: updatedData.phone || existing.phone
        };

        return (await updateLeadByIdInDb(existing.id, mapLeadToDbPayload(merged))) || merged;
      }

      const nextLead = buildSurveyLead({ ...input, sessionId }, now);
      return (await insertLeadToDb(mapLeadToDbPayload(nextLead))) || nextLead;
    } catch (error) {
      console.error("upsertSurveyLead: fallback to file storage due to Supabase error:", error);
    }
  }

  return mutateLeadsFile((leads) => {
    const currentIndex = leads.findIndex((lead) => lead.source === "survey" && lead.sessionId === sessionId);

    if (currentIndex >= 0) {
      if (leads[currentIndex].completed && !input.completed) {
        return { leads, result: leads[currentIndex] };
      }

      leads[currentIndex] = {
        ...leads[currentIndex],
        ...updatedData,
        name: updatedData.name || leads[currentIndex].name,
        email: updatedData.email || leads[currentIndex].email,
        phone: updatedData.phone || leads[currentIndex].phone
      };
      return { leads, result: leads[currentIndex] };
    }

    const nextLead = buildSurveyLead({ ...input, sessionId }, now);
    leads.push(nextLead);
    return { leads, result: nextLead };
  });
}

export async function upsertChatLead(input: ChatLeadInput) {
  const now = new Date().toISOString();
  const sessionId = normalizeText(input.sessionId);
  if (!sessionId) return null;

  const transcript = normalizeTranscript(input.transcript).slice(-40);
  const normalizedModel = normalizeText(input.model);

  if (hasSupabaseAdminConfig()) {
    try {
      const existing = await findLeadBySourceSessionFromDb("chat", sessionId);
      if (existing) {
        const merged: LeadRecord = {
          ...existing,
          updatedAt: now,
          transcript,
          model: normalizedModel || existing.model,
          locale: input.locale || existing.locale
        };

        return (await updateLeadByIdInDb(existing.id, mapLeadToDbPayload(merged))) || merged;
      }

      const nextLead: LeadRecord = {
        id: randomUUID(),
        source: "chat",
        createdAt: now,
        updatedAt: now,
        sessionId,
        transcript,
        model: normalizedModel,
        locale: input.locale
      };
      return (await insertLeadToDb(mapLeadToDbPayload(nextLead))) || nextLead;
    } catch (error) {
      console.error("upsertChatLead: fallback to file storage due to Supabase error:", error);
    }
  }

  return mutateLeadsFile((leads) => {
    const currentIndex = leads.findIndex((lead) => lead.source === "chat" && lead.sessionId === sessionId);

    if (currentIndex >= 0) {
      const current = leads[currentIndex];
      leads[currentIndex] = {
        ...current,
        updatedAt: now,
        transcript,
        model: normalizedModel || current.model,
        locale: input.locale || current.locale
      };
      return { leads, result: leads[currentIndex] };
    }

    const nextLead: LeadRecord = {
      id: randomUUID(),
      source: "chat",
      createdAt: now,
      updatedAt: now,
      sessionId,
      transcript,
      model: normalizedModel,
      locale: input.locale
    };

    leads.push(nextLead);
    return { leads, result: nextLead };
  });
}

export async function removeLeadById(id: string): Promise<RemoveLeadByIdResult> {
  const normalizedId = normalizeText(id);
  if (!normalizedId) {
    return { ok: false, removed: false as const };
  }

  if (hasSupabaseAdminConfig()) {
    try {
      return await removeLeadByIdFromDb(normalizedId);
    } catch (error) {
      console.error("removeLeadById: fallback to file storage due to Supabase error:", error);
    }
  }

  return mutateLeadsFile<RemoveLeadByIdResult>((leads) => {
    const nextLeads = leads.filter((lead) => lead.id !== normalizedId);
    if (nextLeads.length === leads.length) {
      return { leads, result: { ok: true, removed: false as const } };
    }
    return { leads: nextLeads, result: { ok: true, removed: true as const } };
  });
}
