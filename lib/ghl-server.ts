import { readIntegrationConfig } from "@/lib/integration-config";

export type GhlBooking = {
  id: string;
  title: string;
  startAt: string;
  status: string;
  contactName: string;
  contactEmail: string;
};

type GhlResult = {
  bookings: GhlBooking[];
  error: string;
};

const INTEGRATION_TIMEOUT_MS = 8000;

function asText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toBooking(item: Record<string, unknown>): GhlBooking {
  const contact = (item.contact ?? {}) as Record<string, unknown>;
  const startAt =
    asText(item.startTime) ||
    asText(item.start_at) ||
    asText(item.startDateTime) ||
    asText(item.startDate) ||
    asText(item.dateAdded);

  return {
    id: asText(item.id, `booking-${Math.random().toString(16).slice(2)}`),
    title: asText(item.title) || asText(item.calendarName) || "Sessão",
    startAt,
    status: asText(item.appointmentStatus) || asText(item.status) || "scheduled",
    contactName: asText(contact.name) || asText(item.contactName) || "Sem nome",
    contactEmail: asText(contact.email) || asText(item.contactEmail),
  };
}

async function ghlRequest(path: string, options: RequestInit = {}) {
  const { config } = await readIntegrationConfig();
  const apiKey = config.GHL_API_KEY || "";
  const apiBaseUrl = config.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";

  if (!apiKey) {
    throw new Error("GHL_API_KEY não configurada.");
  }

  const url = `${apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const shouldManageSignal = !options.signal;
  const controller = shouldManageSignal ? new AbortController() : null;
  const timer = shouldManageSignal
    ? setTimeout(() => controller?.abort(), INTEGRATION_TIMEOUT_MS)
    : null;

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal ?? controller?.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchUpcomingBookings(limit = 20): Promise<GhlResult> {
  const { config } = await readIntegrationConfig();
  const locationId = config.GHL_LOCATION_ID || "";
  const calendarId = config.GHL_CALENDAR_ID || "";

  if (!locationId || !calendarId) {
    return {
      bookings: [],
      error: "Configure GHL_LOCATION_ID e GHL_CALENDAR_ID no ambiente.",
    };
  }

  try {
    const endpoint = `/calendars/events/appointments?locationId=${locationId}&calendarId=${calendarId}&limit=${limit}&startDate=${new Date().toISOString()}`;
    const response = await ghlRequest(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        bookings: [],
        error: `Falha ao consultar Go High Level: ${response.status} ${details}`,
      };
    }

    const body = (await response.json()) as Record<string, unknown>;
    const source =
      (Array.isArray(body.appointments) && body.appointments) ||
      (Array.isArray(body.events) && body.events) ||
      (Array.isArray(body.items) && body.items) ||
      (Array.isArray(body.data) && body.data) ||
      [];

    const bookings = (source as Record<string, unknown>[])
      .map(toBooking)
      .filter((item) => item.startAt)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    return { bookings, error: "" };
  } catch (error) {
    return {
      bookings: [],
      error: `Erro ao buscar agendamentos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

export async function upsertContact(contact: {
  name: string;
  email: string;
  phone: string;
  tags?: string[];
}) {
  const { config } = await readIntegrationConfig();
  const locationId = config.GHL_LOCATION_ID || "";

  if (!locationId) {
    throw new Error("GHL_LOCATION_ID não configurada.");
  }

  try {
    const response = await ghlRequest("/contacts/upsert", {
      method: "POST",
      body: JSON.stringify({
        firstName: contact.name.split(" ")[0],
        lastName: contact.name.split(" ").slice(1).join(" "),
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        locationId,
        tags: contact.tags
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        error: `Falha ao criar contato no GHL: ${response.status} ${details}`,
      };
    }

    const body = (await response.json()) as { contact?: { id: string } };
    return { id: body.contact?.id };
  } catch (error) {
    return {
      error: `Erro ao criar contato no GHL: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}
