/**
 * Servico para envio de notificacoes pelo Telegram
 */
import { readIntegrationConfig } from "@/lib/integration-config";

const INTEGRATION_TIMEOUT_MS = 8000;

export async function sendTelegramNotification(message: string) {
    const { config } = await readIntegrationConfig();
    const token = config.TELEGRAM_BOT_TOKEN || "";
    const chatIdSetting = config.TELEGRAM_CHAT_ID || "";

    if (!token || !chatIdSetting || chatIdSetting === "insira_seu_chat_id_aqui") {
        console.warn("Telegram: Token ou Chat ID nao configurados.");
        return;
    }

    const chatIds = chatIdSetting.split(",").map(id => id.trim()).filter(Boolean);
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    for (const chatId of chatIds) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), INTEGRATION_TIMEOUT_MS);
            const response = await fetch(url, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "HTML",
                }),
            }).finally(() => clearTimeout(timer));

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Telegram: Erro ao enviar para ${chatId}:`, errorData);
            }
        } catch (err) {
            console.error(`Telegram: Erro de conexao para ${chatId}:`, err);
        }
    }
}
