"use client";

import { FormEvent, useEffect, useState } from "react";

type AuthType = "bearer" | "basic";
type ProviderType = "go-high-level" | "twilio";

type ProviderDraft = {
  baseUrl: string;
  notes: string;
  apiKey: string;
  locationId: string;
  calendarId: string;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumbers: string;
  enabled: boolean;
};

const defaultGhl: ProviderDraft = {
  baseUrl: "https://services.leadconnectorhq.com",
  notes: "Informe API Key e Location ID para sincronizar contatos e oportunidades.",
  apiKey: "",
  locationId: "",
  calendarId: "",
  accountSid: "",
  authToken: "",
  fromNumber: "",
  toNumbers: "",
  enabled: true,
};

const defaultTwilio: ProviderDraft = {
  baseUrl: "https://api.twilio.com/2010-04-01",
  notes: "Use Account SID e Auth Token para envio de SMS/WhatsApp.",
  apiKey: "",
  locationId: "",
  calendarId: "",
  accountSid: "",
  authToken: "",
  fromNumber: "",
  toNumbers: "",
  enabled: true,
};

export function AdminIntegrationsManager() {
  const [ghlDraft, setGhlDraft] = useState<ProviderDraft>(defaultGhl);
  const [twilioDraft, setTwilioDraft] = useState<ProviderDraft>(defaultTwilio);
  const [telegramDraft, setTelegramDraft] = useState({
    botToken: "",
    chatId: ""
  });
  const [supabaseDraft, setSupabaseDraft] = useState({
    url: "",
    serviceRoleKey: "",
    dbUrl: ""
  });
  const [googleDraft, setGoogleDraft] = useState({
    gtmId: "",
    ga4MeasurementId: ""
  });
  const [loaded, setLoaded] = useState(false);
  const [ghlMessage, setGhlMessage] = useState("");
  const [twilioMessage, setTwilioMessage] = useState("");
  const [supabaseMessage, setSupabaseMessage] = useState("");
  const [telegramMessage, setTelegramMessage] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/admin/config");
        if (response.ok) {
          const config = await response.json();

          setGhlDraft(current => ({
            ...current,
            apiKey: config.GHL_API_KEY || "",
            locationId: config.GHL_LOCATION_ID || "",
            calendarId: config.GHL_CALENDAR_ID || "",
            baseUrl: config.GHL_API_BASE_URL || current.baseUrl,
          }));

          setTwilioDraft(current => ({
            ...current,
            accountSid: config.TWILIO_ACCOUNT_SID || "",
            authToken: config.TWILIO_AUTH_TOKEN || "",
            fromNumber: config.TWILIO_FROM_NUMBER || "",
            toNumbers: config.TWILIO_TO_NUMBERS || "",
            enabled: config.TWILIO_ENABLED === "true",
          }));

          setSupabaseDraft({
            url: config.SUPABASE_URL || "",
            serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY || "",
            dbUrl: config.DATABASE_URL || ""
          });

          setTelegramDraft({
            botToken: config.TELEGRAM_BOT_TOKEN || "",
            chatId: config.TELEGRAM_CHAT_ID || ""
          });

          setGoogleDraft({
            gtmId: config.NEXT_PUBLIC_GTM_ID || "",
            ga4MeasurementId: config.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ""
          });
        }
      } catch (err) {
        console.error("Erro ao carregar configuracoes:", err);
      }
      setLoaded(true);
    }
    fetchConfig();
  }, []);

  const saveConfig = async (pairs: Record<string, string>) => {
    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pairs),
      });
      return response.ok;
    } catch (err) {
      return false;
    }
  };

  const submitGhl = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGhlMessage("Salvando...");

    const success = await saveConfig({
      GHL_API_KEY: ghlDraft.apiKey.trim(),
      GHL_LOCATION_ID: ghlDraft.locationId.trim(),
      GHL_CALENDAR_ID: ghlDraft.calendarId.trim(),
      GHL_API_BASE_URL: ghlDraft.baseUrl.trim(),
    });

    setGhlMessage(success ? "Go High Level salvo no Supabase." : "Erro ao salvar GHL.");
  };

  const submitTwilio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwilioMessage("Salvando...");

    const success = await saveConfig({
      TWILIO_ACCOUNT_SID: twilioDraft.accountSid.trim(),
      TWILIO_AUTH_TOKEN: twilioDraft.authToken.trim(),
      TWILIO_FROM_NUMBER: twilioDraft.fromNumber.trim(),
      TWILIO_TO_NUMBERS: twilioDraft.toNumbers.trim(),
      TWILIO_ENABLED: twilioDraft.enabled ? "true" : "false",
    });

    setTwilioMessage(success ? "Twilio salvo no Supabase." : "Erro ao salvar Twilio.");
  };

  const submitSupabase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupabaseMessage("Salvando...");

    const success = await saveConfig({
      SUPABASE_URL: supabaseDraft.url.trim(),
      SUPABASE_SERVICE_ROLE_KEY: supabaseDraft.serviceRoleKey.trim(),
      DATABASE_URL: supabaseDraft.dbUrl.trim()
    });

    setSupabaseMessage(success ? "Supabase salvo no Supabase." : "Erro ao salvar Supabase.");
  };

  const submitTelegram = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTelegramMessage("Salvando...");

    const success = await saveConfig({
      TELEGRAM_BOT_TOKEN: telegramDraft.botToken.trim(),
      TELEGRAM_CHAT_ID: telegramDraft.chatId.trim()
    });

    setTelegramMessage(success ? "Telegram salvo no Supabase." : "Erro ao salvar Telegram.");
  };

  const submitGoogle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGoogleMessage("Salvando...");

    const success = await saveConfig({
      NEXT_PUBLIC_GTM_ID: googleDraft.gtmId.trim(),
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: googleDraft.ga4MeasurementId.trim()
    });

    setGoogleMessage(
      success
        ? "Google Tag Manager salvo no Supabase."
        : "Erro ao salvar Google Tag Manager."
    );
  };

  if (!loaded) return <p>Carregando configurações...</p>;

  return (
    <div className="integrations-layout">
      <div className="provider-grid">
        <article className="admin-widget integration-card integration-card-ghl">
          <h2>Go High Level</h2>
          <p>Conecte CRM e automacoes do GHL.</p>
          <form className="integrations-form" onSubmit={submitGhl}>
            <label className="field">
              Base URL
              <input
                type="text"
                value={ghlDraft.baseUrl}
                onChange={(event) => setGhlDraft((current) => ({ ...current, baseUrl: event.target.value }))}
                placeholder="services.leadconnectorhq.com"
                required
              />
            </label>
            <label className="field">
              API Key
              <input
                type="password"
                value={ghlDraft.apiKey}
                onChange={(event) => setGhlDraft((current) => ({ ...current, apiKey: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              Location ID
              <input
                type="text"
                value={ghlDraft.locationId}
                onChange={(event) => setGhlDraft((current) => ({ ...current, locationId: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              Calendar ID
              <input
                type="text"
                value={ghlDraft.calendarId}
                onChange={(event) => setGhlDraft((current) => ({ ...current, calendarId: event.target.value }))}
              />
            </label>
            <div className="integration-actions integration-span-2">
              <button className="primary-button" type="submit">
                Salvar Go High Level
              </button>
            </div>
            {ghlMessage ? <p className="integration-span-2">{ghlMessage}</p> : null}
          </form>
        </article>

        <article className="admin-widget integration-card">
          <h2>Twilio</h2>
          <p>Conecte envio de SMS e WhatsApp.</p>
          <form className="integrations-form" onSubmit={submitTwilio}>
            <label className="field">
              Account SID
              <input
                type="text"
                value={twilioDraft.accountSid}
                onChange={(event) => setTwilioDraft((current) => ({ ...current, accountSid: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              Auth Token
              <input
                type="password"
                value={twilioDraft.authToken}
                onChange={(event) => setTwilioDraft((current) => ({ ...current, authToken: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              Remetente (From)
              <input
                type="text"
                value={twilioDraft.fromNumber}
                onChange={(event) => setTwilioDraft((current) => ({ ...current, fromNumber: event.target.value }))}
                placeholder="+1..."
                required
              />
            </label>
            <label className="field integration-span-2">
              Números Admin (To) - Separados por vírgula
              <input
                type="text"
                value={twilioDraft.toNumbers}
                onChange={(event) => setTwilioDraft((current) => ({ ...current, toNumbers: event.target.value }))}
                placeholder="+55..., +55..."
                required
              />
            </label>
            <label className="field" style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 2", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={twilioDraft.enabled}
                onChange={(event) => setTwilioDraft(prev => ({ ...prev, enabled: event.target.checked }))}
                style={{ width: "20px", height: "20px", margin: 0 }}
              />
              Integração Ativada
            </label>
            <div className="integration-actions integration-span-2">
              <button className="primary-button" type="submit">
                Salvar Twilio
              </button>
            </div>
            {twilioMessage ? <p className="integration-span-2">{twilioMessage}</p> : null}
          </form>
        </article>

        <article className="admin-widget integration-card integration-card-supabase">
          <h2>Supabase</h2>
          <p>Banco de dados e autenticação.</p>
          <form className="integrations-form" onSubmit={submitSupabase}>
            <label className="field integration-span-2">
              Project URL
              <input
                type="text"
                value={supabaseDraft.url}
                onChange={(event) => setSupabaseDraft(prev => ({ ...prev, url: event.target.value }))}
                placeholder="https://xxxx.supabase.co"
                required
              />
            </label>
            <label className="field integration-span-2">
              Service Role Key
              <input
                type="password"
                value={supabaseDraft.serviceRoleKey}
                onChange={(event) => setSupabaseDraft(prev => ({ ...prev, serviceRoleKey: event.target.value }))}
                required
              />
            </label>
            <label className="field integration-span-2">
              Database Connection Override (PostgreSQL String)
              <input
                type="text"
                value={supabaseDraft.dbUrl}
                onChange={(event) => setSupabaseDraft(prev => ({ ...prev, dbUrl: event.target.value }))}
                placeholder="postgresql://..."
              />
            </label>
            <div className="integration-actions integration-span-2">
              <button className="primary-button" type="submit">
                Salvar Supabase
              </button>
            </div>
            {supabaseMessage ? <p className="integration-span-2">{supabaseMessage}</p> : null}
          </form>
        </article>

        <article className="admin-widget integration-card">
          <h2>Telegram</h2>
          <p>Notificações instantâneas via Bot.</p>
          <form className="integrations-form" onSubmit={submitTelegram}>
            <label className="field integration-span-2">
              Bot Token
              <input
                type="password"
                value={telegramDraft.botToken}
                onChange={(event) => setTelegramDraft(prev => ({ ...prev, botToken: event.target.value }))}
                placeholder="000000000:AAAAA..."
                required
              />
            </label>
            <label className="field integration-span-2">
              Chat ID
              <input
                type="text"
                value={telegramDraft.chatId}
                onChange={(event) => setTelegramDraft(prev => ({ ...prev, chatId: event.target.value }))}
                placeholder="ID do grupo ou usuário"
                required
              />
            </label>
            <div className="integration-actions integration-span-2">
              <button className="primary-button" type="submit">
                Salvar Telegram
              </button>
            </div>
            {telegramMessage ? <p className="integration-span-2">{telegramMessage}</p> : null}
          </form>
        </article>

        <article className="admin-widget integration-card">
          <h2>Google Tag Manager</h2>
          <p>Instale o container do GTM no site e use o GA4 pelo Tag Manager.</p>
          <form className="integrations-form" onSubmit={submitGoogle}>
            <label className="field integration-span-2">
              GTM Container ID
              <input
                type="text"
                value={googleDraft.gtmId}
                onChange={(event) => setGoogleDraft((current) => ({ ...current, gtmId: event.target.value }))}
                placeholder="GTM-XXXXXXX"
                required
              />
            </label>
            <label className="field integration-span-2">
              GA4 Measurement ID
              <input
                type="text"
                value={googleDraft.ga4MeasurementId}
                onChange={(event) =>
                  setGoogleDraft((current) => ({ ...current, ga4MeasurementId: event.target.value }))
                }
                placeholder="G-XXXXXXXXXX"
              />
            </label>
            <div className="integration-actions integration-span-2">
              <button className="primary-button" type="submit">
                Salvar Google
              </button>
            </div>
            <p className="integration-span-2">
              Verificacao: abra o site publicado, visualize o codigo-fonte e procure por
              {" "}
              <strong>{googleDraft.gtmId || "GTM-XXXXXXX"}</strong>
              . O ID precisa aparecer em `gtm.js?id=` e em `ns.html?id=`.
            </p>
            <p className="integration-span-2">
              Validacao final: rode o Google Tag Assistant Preview e confirme que o container carrega em todas as paginas.
            </p>
            {googleMessage ? <p className="integration-span-2">{googleMessage}</p> : null}
          </form>
        </article>
      </div>
    </div>
  );
}
