"use client";

import { useEffect, useState } from "react";

interface ProviderConfig {
    loading: boolean;
    saving: boolean;
    status: "idle" | "ok" | "error";
    message: string;
}

export function AdminIntegrationsNew() {
    const [loaded, setLoaded] = useState(false);

    // GHL
    const [ghl, setGhl] = useState({ apiKey: "", locationId: "", calendarId: "", baseUrl: "https://services.leadconnectorhq.com" });
    const [ghlStatus, setGhlStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    // Twilio
    const [twilio, setTwilio] = useState({ accountSid: "", authToken: "", fromNumber: "", enabled: false });
    const [twilioNumbers, setTwilioNumbers] = useState<string[]>([]);
    const [newTwilioNumber, setNewTwilioNumber] = useState("");
    const [twilioStatus, setTwilioStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    // Telegram
    const [telegram, setTelegram] = useState({ botToken: "", enabled: false });
    const [telegramChats, setTelegramChats] = useState<string[]>([]);
    const [newTelegramChat, setNewTelegramChat] = useState("");
    const [telegramStatus, setTelegramStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    // Google
    const [google, setGoogle] = useState({ gtmId: "", ga4Id: "" });
    const [googleStatus, setGoogleStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    // Supabase
    const [supabase, setSupabase] = useState({ url: "", serviceRoleKey: "", dbUrl: "" });
    const [supabaseStatus, setSupabaseStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    // Facebook Dataset
    const [facebook, setFacebook] = useState({ datasetId: "", accessToken: "", testEventCode: "", enabled: false });
    const [facebookStatus, setFacebookStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    // Conversion Events
    const [events, setEvents] = useState({
        heroCtaGa: "select_promotion",
        heroCtaFb: "Contact",
        modalOpenGa: "view_item",
        modalOpenFb: "ViewContent",
        surveySubmitGa: "survey_submit",
        surveySubmitFb: "Lead",
        thankYouGa: "generate_lead",
        thankYouFb: "Schedule"
    });
    const [eventsStatus, setEventsStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch("/api/admin/config");
                if (response.ok) {
                    const config = await response.json();

                    setGhl({
                        apiKey: config.GHL_API_KEY || "",
                        locationId: config.GHL_LOCATION_ID || "",
                        calendarId: config.GHL_CALENDAR_ID || "",
                        baseUrl: config.GHL_API_BASE_URL || "https://services.leadconnectorhq.com"
                    });

                    setTwilio({
                        accountSid: config.TWILIO_ACCOUNT_SID || "",
                        authToken: config.TWILIO_AUTH_TOKEN || "",
                        fromNumber: config.TWILIO_FROM_NUMBER || "",
                        enabled: config.TWILIO_ENABLED === "true"
                    });
                    setTwilioNumbers((config.TWILIO_TO_NUMBERS || "").split(",").filter((n: string) => n.trim()));

                    setTelegram({
                        botToken: config.TELEGRAM_BOT_TOKEN || "",
                        enabled: config.TELEGRAM_ENABLED === "true" || !!config.TELEGRAM_BOT_TOKEN
                    });
                    setTelegramChats((config.TELEGRAM_CHAT_ID || "").split(",").filter((n: string) => n.trim()));

                    setGoogle({
                        gtmId: config.NEXT_PUBLIC_GTM_ID || "",
                        ga4Id: config.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ""
                    });

                    setSupabase({
                        url: config.SUPABASE_URL || "",
                        serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY || "",
                        dbUrl: config.DATABASE_URL || ""
                    });

                    setFacebook({
                        datasetId: config.FACEBOOK_DATASET_ID || "",
                        accessToken: config.FACEBOOK_ACCESS_TOKEN || "",
                        testEventCode: config.FACEBOOK_TEST_EVENT_CODE || "",
                        enabled: config.FACEBOOK_ENABLED === "true"
                    });

                    setEvents({
                        heroCtaGa: config.EVENT_HERO_CTA_GA || "select_promotion",
                        heroCtaFb: config.EVENT_HERO_CTA_FB || "Contact",
                        modalOpenGa: config.EVENT_MODAL_OPEN_GA || "view_item",
                        modalOpenFb: config.EVENT_MODAL_OPEN_FB || "ViewContent",
                        surveySubmitGa: config.EVENT_SURVEY_SUBMIT_GA || "survey_submit",
                        surveySubmitFb: config.EVENT_SURVEY_SUBMIT_FB || "Lead",
                        thankYouGa: config.EVENT_THANK_YOU_GA || "generate_lead",
                        thankYouFb: config.EVENT_THANK_YOU_FB || "Schedule"
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar configuracoes:", err);
            }
            setLoaded(true);
        }
        fetchConfig();
    }, []);

    const saveConfig = async (pairs: Record<string, string>, setStatus: any) => {
        setStatus((prev: any) => ({ ...prev, saving: true, status: "idle", message: "Salvando..." }));
        try {
            const response = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pairs),
            });
            if (response.ok) {
                setStatus({ saving: false, status: "ok", message: "Configurações salvas com sucesso!" });
                setTimeout(() => setStatus((p: any) => ({ ...p, status: "idle", message: "" })), 4000);
            } else {
                setStatus({ saving: false, status: "error", message: "Erro ao salvar no servidor." });
            }
        } catch (err) {
            setStatus({ saving: false, status: "error", message: "Falha na conexão." });
        }
    };

    const addTwilioNumber = () => {
        if (newTwilioNumber.trim()) {
            setTwilioNumbers([...twilioNumbers, newTwilioNumber.trim()]);
            setNewTwilioNumber("");
        }
    };

    const removeTwilioNumber = (index: number) => {
        setTwilioNumbers(twilioNumbers.filter((_, i) => i !== index));
    };

    const addTelegramChat = () => {
        if (newTelegramChat.trim()) {
            setTelegramChats([...telegramChats, newTelegramChat.trim()]);
            setNewTelegramChat("");
        }
    };

    const removeTelegramChat = (index: number) => {
        setTelegramChats(telegramChats.filter((_, i) => i !== index));
    };

    const testIntegration = async (type: "telegram" | "twilio" | "facebook", data: any, setStatus: any) => {
        setStatus((prev: any) => ({ ...prev, loading: true, status: "idle", message: "Iniciando teste..." }));
        try {
            const response = await fetch("/api/admin/test-integration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, data }),
            });
            const result = await response.json();
            if (response.ok) {
                setStatus({ loading: false, saving: false, status: "ok", message: result.message || "Teste concluído com sucesso!" });
                setTimeout(() => setStatus((p: any) => ({ ...p, status: "idle", message: "" })), 4000);
            } else {
                setStatus({ loading: false, saving: false, status: "error", message: result.error || "Erro no teste de integração." });
            }
        } catch (err) {
            setStatus({ loading: false, saving: false, status: "error", message: "Falha na conexão ao testar." });
        }
    };

    if (!loaded) return <div className="integrations-loading">Carregando configurações...</div>;

    return (
        <div className="new-integrations-container">
            <header className="integrations-header">
                <h1>Integrations</h1>
                <p>Connect your system with external services</p>
            </header>

            {/* TELEGRAM */}
            <div className="integration-card-v2">
                <div className="card-header-v2">
                    <div className="icon-box telegram">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                    </div>
                    <div className="header-info">
                        <h3>Telegram Alerts</h3>
                        <p>Get Telegram notifications for new chats and bookings</p>
                    </div>
                    <div className="header-toggle">
                        <button className={`switch-v2 ${telegram.enabled ? "on" : ""}`} onClick={() => setTelegram(p => ({ ...p, enabled: !p.enabled }))}>
                            <div className="dot" />
                        </button>
                    </div>
                </div>

                <div className="field-group-v2">
                    <label>Bot Token</label>
                    <input type="password" value={telegram.botToken} onChange={e => setTelegram(p => ({ ...p, botToken: e.target.value }))} placeholder="Bot Token do Telegram" />
                </div>

                <div className="field-group-v2">
                    <label>Chat IDs to receive notifications</label>
                    <div className="list-items-v2">
                        {telegramChats.map((id, i) => (
                            <div key={i} className="list-item">
                                <span>{id}</span>
                                <button onClick={() => removeTelegramChat(i)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
                            </div>
                        ))}
                    </div>
                    <div className="add-field-v2">
                        <input type="text" value={newTelegramChat} onChange={e => setNewTelegramChat(e.target.value)} placeholder="-1001234567890 or @channel_name" />
                        <button onClick={addTelegramChat}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg> Add</button>
                    </div>
                    <p className="help-text">Add numeric chat IDs (example: -1001234567890) or public channels (@channel_name)</p>
                </div>

                <div className="checkbox-row">
                    <input type="checkbox" checked={telegram.enabled} readOnly />
                    <span>Send Telegram message when a new chat conversation starts</span>
                </div>

                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        TELEGRAM_BOT_TOKEN: telegram.botToken,
                        TELEGRAM_CHAT_ID: telegramChats.join(","),
                        TELEGRAM_ENABLED: telegram.enabled ? "true" : "false"
                    }, setTelegramStatus)} disabled={telegramStatus.saving}>Save Settings</button>
                    <button
                        className="btn-test"
                        onClick={() => testIntegration("telegram", {
                            botToken: telegram.botToken,
                            chatId: telegramChats.join(",")
                        }, setTelegramStatus)}
                        disabled={telegramStatus.loading || !telegram.botToken || telegramChats.length === 0}
                    >
                        {telegramStatus.loading ? "Sending..." : "Send Test Message"}
                    </button>
                </div>

                <div className={`status-msg ${telegramStatus.status === "error" ? "error" : telegram.enabled ? "ok" : "disabled"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {telegramStatus.status === "error" || !telegram.enabled ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {telegramStatus.status === "error" ? "Erro na Integração" : telegram.enabled ? "Telegram ativado" : "Telegram desativado"}
                        </div>
                        <div className="status-desc">
                            {telegramStatus.message || (telegram.enabled ? "As notificações serão enviadas para os seus chats configurados" : "Ative para receber notificações de novos chats")}
                        </div>
                    </div>
                </div>
            </div>

            {/* TWILIO */}
            <div className="integration-card-v2">
                <div className="card-header-v2">
                    <div className="icon-box twilio">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                    </div>
                    <div className="header-info">
                        <h3>Twilio SMS</h3>
                        <p>Get SMS notifications for new chat conversations</p>
                    </div>
                    <div className="header-toggle">
                        <button className={`switch-v2 ${twilio.enabled ? "on" : ""}`} onClick={() => setTwilio(p => ({ ...p, enabled: !p.enabled }))}>
                            <div className="dot" />
                        </button>
                    </div>
                </div>

                <div className="grid-2-col">
                    <div className="field-group-v2">
                        <label>Account SID</label>
                        <input type="text" value={twilio.accountSid} onChange={e => setTwilio(p => ({ ...p, accountSid: e.target.value }))} />
                    </div>
                    <div className="field-group-v2">
                        <label>Auth Token</label>
                        <input type="password" value={twilio.authToken} onChange={e => setTwilio(p => ({ ...p, authToken: e.target.value }))} />
                    </div>
                </div>

                <div className="field-group-v2">
                    <label>From Phone Number</label>
                    <input type="text" value={twilio.fromNumber} onChange={e => setTwilio(p => ({ ...p, fromNumber: e.target.value }))} />
                    <p className="help-text">Your Twilio phone number (with country code)</p>
                </div>

                <div className="field-group-v2">
                    <label>Phone numbers to receive notifications</label>
                    <div className="list-items-v2">
                        {twilioNumbers.map((num, i) => (
                            <div key={i} className="list-item">
                                <span>{num}</span>
                                <button onClick={() => removeTwilioNumber(i)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
                            </div>
                        ))}
                    </div>
                    <div className="add-field-v2">
                        <input type="text" value={newTwilioNumber} onChange={e => setNewTwilioNumber(e.target.value)} placeholder="+1234567890" />
                        <button onClick={addTwilioNumber}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg> Add</button>
                    </div>
                    <p className="help-text">Add phone numbers in E.164 format (e.g., +15551234567)</p>
                </div>

                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        TWILIO_ACCOUNT_SID: twilio.accountSid,
                        TWILIO_AUTH_TOKEN: twilio.authToken,
                        TWILIO_FROM_NUMBER: twilio.fromNumber,
                        TWILIO_TO_NUMBERS: twilioNumbers.join(","),
                        TWILIO_ENABLED: twilio.enabled ? "true" : "false"
                    }, setTwilioStatus)} disabled={twilioStatus.saving}>Save Settings</button>
                    <button
                        className="btn-test"
                        onClick={() => testIntegration("twilio", {
                            accountSid: twilio.accountSid,
                            authToken: twilio.authToken,
                            fromNumber: twilio.fromNumber,
                            toNumbers: twilioNumbers.join(",")
                        }, setTwilioStatus)}
                        disabled={twilioStatus.loading || !twilio.accountSid || twilioNumbers.length === 0}
                    >
                        {twilioStatus.loading ? "Sending..." : "Send Test SMS"}
                    </button>
                </div>

                <div className={`status-msg ${twilioStatus.status === "error" ? "error" : twilio.enabled ? "ok" : "disabled"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {twilioStatus.status === "error" || !twilio.enabled ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {twilioStatus.status === "error" ? "Erro na Integração" : twilio.enabled ? "Twilio ativado" : "Twilio desativado"}
                        </div>
                        <div className="status-desc">
                            {twilioStatus.message || (twilio.enabled ? "Notificações SMS serão enviadas para os números configurados" : "Ative para receber alertas SMS de novos chats")}
                        </div>
                    </div>
                </div>
            </div>

            {/* GO HIGH LEVEL */}
            <div className="integration-card-v2">
                <div className="card-header-v2">
                    <div className="icon-box ghl">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                    </div>
                    <div className="header-info">
                        <h3>Go High Level</h3>
                        <p>Sync contacts and opportunities with GHL</p>
                    </div>
                </div>

                <div className="field-group-v2">
                    <label>API Key</label>
                    <input type="password" value={ghl.apiKey} onChange={e => setGhl(p => ({ ...p, apiKey: e.target.value }))} />
                </div>

                <div className="grid-2-col">
                    <div className="field-group-v2">
                        <label>Location ID</label>
                        <input type="text" value={ghl.locationId} onChange={e => setGhl(p => ({ ...p, locationId: e.target.value }))} />
                    </div>
                    <div className="field-group-v2">
                        <label>Calendar ID (Optional)</label>
                        <input type="text" value={ghl.calendarId} onChange={e => setGhl(p => ({ ...p, calendarId: e.target.value }))} />
                    </div>
                </div>

                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        GHL_API_KEY: ghl.apiKey,
                        GHL_LOCATION_ID: ghl.locationId,
                        GHL_CALENDAR_ID: ghl.calendarId,
                        GHL_API_BASE_URL: ghl.baseUrl
                    }, setGhlStatus)} disabled={ghlStatus.saving}>Save Settings</button>
                </div>

                <div className={`status-msg ${ghlStatus.status === "error" ? "error" : (ghl.apiKey && ghl.locationId) ? "ok" : "disabled"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {ghlStatus.status === "error" || !(ghl.apiKey && ghl.locationId) ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {ghlStatus.status === "error" ? "Erro na Integração" : (ghl.apiKey && ghl.locationId) ? "GHL Conectado" : "GHL desativado"}
                        </div>
                        <div className="status-desc">
                            {ghlStatus.message || ((ghl.apiKey && ghl.locationId) ? "Seus contatos e oportunidades estão sendo sincronizados" : "Insira a API Key e o Location ID para ativar")}
                        </div>
                    </div>
                </div>
            </div>

            {/* GOOGLE TAG MANAGER */}
            <div className="integration-card-v2">
                <div className="card-header-v2">
                    <div className="icon-box google">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18" /><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" /></svg>
                    </div>
                    <div className="header-info">
                        <h3>Analytics (GTM/GA4)</h3>
                        <p>Track user behavior and sessions</p>
                    </div>
                </div>

                <div className="grid-2-col">
                    <div className="field-group-v2">
                        <label>GTM Container ID</label>
                        <input type="text" value={google.gtmId} onChange={e => setGoogle(p => ({ ...p, gtmId: e.target.value }))} placeholder="GTM-XXXXXXX" />
                    </div>
                    <div className="field-group-v2">
                        <label>GA4 Measurement ID</label>
                        <input type="text" value={google.ga4Id} onChange={e => setGoogle(p => ({ ...p, ga4Id: e.target.value }))} placeholder="G-XXXXXXXXXX" />
                    </div>
                </div>

                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        NEXT_PUBLIC_GTM_ID: google.gtmId,
                        NEXT_PUBLIC_GA4_MEASUREMENT_ID: google.ga4Id
                    }, setGoogleStatus)} disabled={googleStatus.saving}>Save Settings</button>
                </div>

                <div className={`status-msg ${googleStatus.status === "error" ? "error" : (google.gtmId || google.ga4Id) ? "ok" : "disabled"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {googleStatus.status === "error" || !(google.gtmId || google.ga4Id) ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {googleStatus.status === "error" ? "Erro na Integração" : (google.gtmId || google.ga4Id) ? "Analytics Ativo" : "Analytics desativado"}
                        </div>
                        <div className="status-desc">
                            {googleStatus.message || ((google.gtmId || google.ga4Id) ? "O rastreamento de visitantes está funcionando corretamente" : "Configure o GTM ou GA4 para medir visitas")}
                        </div>
                    </div>
                </div>
            </div>

            {/* SUPABASE */}
            <div className="integration-card-v2" style={{ marginBottom: "2rem" }}>
                <div className="card-header-v2">
                    <div className="icon-box supabase">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M3 12h18" /><path d="M3 17h18" /></svg>
                    </div>
                    <div className="header-info">
                        <h3>Supabase</h3>
                        <p>Database and backend configuration</p>
                    </div>
                </div>

                <div className="field-group-v2">
                    <label>Project URL</label>
                    <input type="text" value={supabase.url} onChange={e => setSupabase(p => ({ ...p, url: e.target.value }))} placeholder="https://xxxx.supabase.co" />
                </div>

                <div className="field-group-v2">
                    <label>Service Role Key</label>
                    <input type="password" value={supabase.serviceRoleKey} onChange={e => setSupabase(p => ({ ...p, serviceRoleKey: e.target.value }))} />
                </div>

                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        SUPABASE_URL: supabase.url,
                        SUPABASE_SERVICE_ROLE_KEY: supabase.serviceRoleKey,
                        DATABASE_URL: supabase.dbUrl
                    }, setSupabaseStatus)} disabled={supabaseStatus.saving}>Save Settings</button>
                </div>

                <div className={`status-msg ${supabaseStatus.status === "error" ? "error" : (supabase.url && supabase.serviceRoleKey) ? "ok" : "disabled"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {supabaseStatus.status === "error" || !(supabase.url && supabase.serviceRoleKey) ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {supabaseStatus.status === "error" ? "Erro na Integração" : (supabase.url && supabase.serviceRoleKey) ? "Supabase Conectado" : "Supabase desativado"}
                        </div>
                        <div className="status-desc">
                            {supabaseStatus.message || ((supabase.url && supabase.serviceRoleKey) ? "Banco de dados e serviços backend operacionais" : "Configure a URL e Service Role Key")}
                        </div>
                    </div>
                </div>
            </div>

            {/* FACEBOOK DATASET */}
            <div className="integration-card-v2" style={{ marginBottom: "2rem" }}>
                <div className="card-header-v2">
                    <div className="icon-box facebook">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m3 11 18-5v12L3 14v-3z" />
                            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                        </svg>
                    </div>
                    <div className="header-info">
                        <h3>Facebook Dataset</h3>
                        <p>Send server-side conversion events to Meta.</p>
                    </div>
                    <div className="header-toggle">
                        <button className={`switch-v2 ${facebook.enabled ? "on" : ""}`} onClick={() => setFacebook(p => ({ ...p, enabled: !p.enabled }))}>
                            <div className="dot" />
                        </button>
                    </div>
                </div>

                <div className="field-group-v2">
                    <label>Dataset ID</label>
                    <input type="text" value={facebook.datasetId} onChange={e => setFacebook(p => ({ ...p, datasetId: e.target.value }))} placeholder="Enter dataset ID" />
                </div>
                <div className="field-group-v2">
                    <label>Access Token</label>
                    <input type="password" value={facebook.accessToken} onChange={e => setFacebook(p => ({ ...p, accessToken: e.target.value }))} placeholder="Enter access token" />
                </div>

                <div className="field-group-v2">
                    <label>Test Event Code (optional)</label>
                    <input type="text" value={facebook.testEventCode} onChange={e => setFacebook(p => ({ ...p, testEventCode: e.target.value }))} placeholder="Enter test event code" />
                </div>


                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        FACEBOOK_DATASET_ID: facebook.datasetId,
                        FACEBOOK_ACCESS_TOKEN: facebook.accessToken,
                        FACEBOOK_TEST_EVENT_CODE: facebook.testEventCode,
                        FACEBOOK_ENABLED: facebook.enabled ? "true" : "false"
                    }, setFacebookStatus)} disabled={facebookStatus.saving}>Save Integration</button>
                    <button
                        className="btn-test"
                        onClick={() => testIntegration("facebook", {
                            datasetId: facebook.datasetId,
                            accessToken: facebook.accessToken,
                            testEventCode: facebook.testEventCode
                        }, setFacebookStatus)}
                        disabled={facebookStatus.loading || !facebook.datasetId || !facebook.accessToken}
                    >
                        {facebookStatus.loading ? "Testing..." : "Test Connection"}
                    </button>
                </div>

                <div className={`status-msg ${facebookStatus.status === "error" ? "error" : facebook.enabled ? "ok" : "disabled"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {facebookStatus.status === "error" || !facebook.enabled ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {facebookStatus.status === "error" ? "Erro na Integração" : facebook.enabled ? "Facebook Dataset ativado" : "Facebook Dataset desativado"}
                        </div>
                        <div className="status-desc">
                            {facebookStatus.message || (facebook.enabled ? "Eventos estão sendo enviados para o seu dataset da Meta" : "Ative para enviar eventos de conversão via API")}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONVERSION EVENTS */}
            <div className="integration-card-v2" style={{ marginBottom: "2rem" }}>
                <div className="card-header-v2">
                    <div className="icon-box events">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="header-info">
                        <h3>Conversion Events</h3>
                        <p>Map website actions to Google & Facebook events.</p>
                    </div>
                </div>

                <div className="events-grid">
                    <div className="event-row header">
                        <div className="event-col">Website Action</div>
                        <div className="event-col">GA4 Event Name</div>
                        <div className="event-col">Facebook Event Name</div>
                    </div>

                    <div className="event-row">
                        <div className="event-col action-name">Hero CTA Click</div>
                        <div className="event-col">
                            <input type="text" value={events.heroCtaGa} onChange={e => setEvents(p => ({ ...p, heroCtaGa: e.target.value }))} />
                        </div>
                        <div className="event-col">
                            <input type="text" value={events.heroCtaFb} onChange={e => setEvents(p => ({ ...p, heroCtaFb: e.target.value }))} />
                        </div>
                    </div>

                    <div className="event-row">
                        <div className="event-col action-name">Booking Modal Open</div>
                        <div className="event-col">
                            <input type="text" value={events.modalOpenGa} onChange={e => setEvents(p => ({ ...p, modalOpenGa: e.target.value }))} />
                        </div>
                        <div className="event-col">
                            <input type="text" value={events.modalOpenFb} onChange={e => setEvents(p => ({ ...p, modalOpenFb: e.target.value }))} />
                        </div>
                    </div>

                    <div className="event-row">
                        <div className="event-col action-name">Survey Submitted</div>
                        <div className="event-col">
                            <input type="text" value={events.surveySubmitGa} onChange={e => setEvents(p => ({ ...p, surveySubmitGa: e.target.value }))} />
                        </div>
                        <div className="event-col">
                            <input type="text" value={events.surveySubmitFb} onChange={e => setEvents(p => ({ ...p, surveySubmitFb: e.target.value }))} />
                        </div>
                    </div>

                    <div className="event-row">
                        <div className="event-col action-name strong">Thank You Page (Lead)</div>
                        <div className="event-col">
                            <input type="text" value={events.thankYouGa} onChange={e => setEvents(p => ({ ...p, thankYouGa: e.target.value }))} />
                        </div>
                        <div className="event-col">
                            <input type="text" value={events.thankYouFb} onChange={e => setEvents(p => ({ ...p, thankYouFb: e.target.value }))} />
                        </div>
                    </div>
                </div>

                <div className="card-actions-v2">
                    <button className="btn-save" onClick={() => saveConfig({
                        EVENT_HERO_CTA_GA: events.heroCtaGa,
                        EVENT_HERO_CTA_FB: events.heroCtaFb,
                        EVENT_MODAL_OPEN_GA: events.modalOpenGa,
                        EVENT_MODAL_OPEN_FB: events.modalOpenFb,
                        EVENT_SURVEY_SUBMIT_GA: events.surveySubmitGa,
                        EVENT_SURVEY_SUBMIT_FB: events.surveySubmitFb,
                        EVENT_THANK_YOU_GA: events.thankYouGa,
                        EVENT_THANK_YOU_FB: events.thankYouFb
                    }, setEventsStatus)} disabled={eventsStatus.saving}>Save Events Mapping</button>
                </div>

                <div className={`status-msg ${eventsStatus.status === "error" ? "error" : "ok"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        {eventsStatus.status === "error" ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        ) : (
                            <path d="M20 6 9 17l-5-5" />
                        )}
                    </svg>
                    <div className="status-text">
                        <div className="status-title">
                            {eventsStatus.status === "error" ? "Erro no Mapeamento" : "Eventos Mapeados"}
                        </div>
                        <div className="status-desc">
                            {eventsStatus.message || "Suas ações de site estão configuradas para o rastreio"}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .new-integrations-container {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 3rem;
        }

        .integrations-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .integrations-header p {
          color: #6b7280;
          margin-top: 0.35rem;
        }

        .integration-card-v2 {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.75rem;
        }

        .card-header-v2 {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .icon-box {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .icon-box.telegram { background: #0088cc; }
        .icon-box.twilio { background: #f22f46; }
        .icon-box.ghl { background: #2563eb; }
        .icon-box.google { background: #4285f4; }
        .icon-box.supabase { background: #3ecf8e; }
        .icon-box.facebook { background: #0668E1; }
        .icon-box.events { background: #8b5cf6; }

        .header-info h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a202c;
        }

        .header-info p {
          margin: 0.15rem 0 0;
          font-size: 0.92rem;
          color: #64748b;
        }

        .header-toggle {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-toggle span {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .header-toggle .enabled { color: #1a202c; }
        .header-toggle .disabled { color: #94a3b8; }

        .switch-v2 {
          width: 48px;
          height: 26px;
          background: #e2e8f0;
          border-radius: 999px;
          border: none;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }

        .switch-v2.on {
          background: #2563eb;
        }

        .switch-v2 .dot {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .switch-v2.on .dot {
          transform: translateX(22px);
        }

        .field-group-v2 {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .field-group-v2 label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #334155;
        }

        .field-group-v2 input {
          padding: 0.75rem 0.9rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .list-items-v2 {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 0.9rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.92rem;
          color: #1e293b;
        }

        .list-item button {
          border: none;
          background: transparent;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          padding: 4px;
        }

        .add-field-v2 {
          display: flex;
          gap: 0.5rem;
        }

        .add-field-v2 input {
          flex: 1;
        }

        .add-field-v2 button {
          padding: 0 1rem;
          border: 1px solid #1e293b;
          background: #fff;
          border-radius: 8px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          font-size: 0.88rem;
        }

        .help-text {
          font-size: 0.82rem;
          color: #94a3b8;
          margin-top: 0.2rem;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin: 1rem 0 1.5rem;
        }

        .checkbox-row input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-row span {
          font-size: 0.9rem;
          color: #475569;
        }

        .card-actions-v2 {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px dotted #e2e8f0;
          margin-top: 1rem;
        }

        .btn-save {
          background: #1e40af;
          color: #fff;
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-save:hover { background: #1e3a8a; }
        .btn-save:disabled { opacity: 0.6; cursor: wait; }

        .btn-test {
          background: #fff;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-test:hover { background: #f8fafc; }

        .status-msg {
          margin-top: 1.25rem;
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .status-msg.ok {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .status-msg.error, .status-msg.disabled {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .status-msg .status-text {
            display: flex;
            flex-direction: column;
        }

        .status-msg .status-title {
            font-weight: 700;
            font-size: 1.05rem;
        }

        .status-msg .status-desc {
            font-weight: 500;
            opacity: 0.9;
            font-size: 0.95rem;
        }

        @media (max-width: 640px) {
          .grid-2-col { grid-template-columns: 1fr; }
          .add-field-v2 { flex-direction: column; }
          .card-header-v2 { flex-direction: column; align-items: flex-start; text-align: left; }
          .header-toggle { margin-left: 0; margin-top: 1rem; width: 100%; justify-content: space-between; }
        }

        .events-grid {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
            display: flex;
            flex-direction: column;
        }

        .event-row {
            display: flex;
            border-bottom: 1px solid #e2e8f0;
            background: #fff;
        }

        .event-row:last-child {
            border-bottom: none;
        }

        .event-row.header {
            background: #f1f5f9;
            font-weight: 700;
            font-size: 0.85rem;
            color: #475569;
        }

        .event-col {
            flex: 1;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
        }

        .event-col:not(:last-child) {
            border-right: 1px solid #e2e8f0;
        }

        .event-col input {
            width: 100%;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 0.4rem 0.6rem;
            font-size: 0.88rem;
            background: #f8fafc;
        }

        .event-col.action-name {
            font-size: 0.9rem;
            font-weight: 500;
            color: #334155;
            background: #f8fafc;
        }

        .event-col.action-name.strong {
            font-weight: 700;
            color: #1e40af;
        }
      `}</style>
        </div>
    );
}
