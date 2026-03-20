import { readIntegrationConfig } from "@/lib/integration-config";

const INTEGRATION_TIMEOUT_MS = 8000;

export async function sendTwilioSms(
    to: string,
    body: string,
    config: { accountSid: string; authToken: string; from: string }
) {
    const accountSid = config.accountSid;
    const authToken = config.authToken;
    const from = config.from;

    if (!accountSid || !authToken || !from) {
        throw new Error("Configuração do Twilio incompleta no ambiente.");
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", from);
    params.append("Body", body);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), INTEGRATION_TIMEOUT_MS);
    const response = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Falha ao enviar SMS pelo Twilio: ${response.status} ${details}`);
    }

    return response.json();
}

export async function notifyAdmins(message: string) {
    const { config } = await readIntegrationConfig();
    const isEnabled = config.TWILIO_ENABLED === "true";
    if (!isEnabled) {
        console.log("Twilio desativado. Notificação via SMS pulada.");
        return;
    }

    const accountSid = config.TWILIO_ACCOUNT_SID || "";
    const authToken = config.TWILIO_AUTH_TOKEN || "";
    const from = config.TWILIO_FROM_NUMBER || "";
    const toNumbers = config.TWILIO_TO_NUMBERS || "";

    if (!accountSid || !authToken || !from) {
        console.warn("Twilio incompleto no banco. Notificação não enviada.");
        return;
    }

    if (!toNumbers) {
        console.warn("TWILIO_TO_NUMBERS não configurada. Notificação não enviada.");
        return;
    }

    const numbers = toNumbers.split(",").map(n => n.trim()).filter(Boolean);

    const results = await Promise.allSettled(
        numbers.map(number => sendTwilioSms(number, message, { accountSid, authToken, from }))
    );

    results.forEach((result, idx) => {
        if (result.status === "rejected") {
            console.error(`Erro ao notificar admin (${numbers[idx]}):`, result.reason);
        }
    });
}
