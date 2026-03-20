import { createHash } from "crypto";
import { readIntegrationConfig } from "./integration-config";

const INTEGRATION_TIMEOUT_MS = 8000;

function hashValue(value: string): string {
    if (!value) return "";
    return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

type FacebookEventData = {
    event_name: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    customData?: Record<string, any>;
};

export async function sendFacebookConversionEvent(event: FacebookEventData) {
    const { config } = await readIntegrationConfig();

    const enabled = config.FACEBOOK_ENABLED === "true";
    const pixelId = (config.FACEBOOK_DATASET_ID || "").trim();
    const accessToken = (config.FACEBOOK_ACCESS_TOKEN || "").trim();
    const testCode = (config.FACEBOOK_TEST_EVENT_CODE || "").trim();

    if (!enabled || !pixelId || !accessToken) {
        return { ok: false, message: "Facebook CAPI not configured or disabled" };
    }

    const eventTime = Math.floor(Date.now() / 1000);

    const payload = {
        data: [
            {
                event_name: event.event_name,
                event_time: eventTime,
                action_source: "website",
                user_data: {
                    em: event.email ? [hashValue(event.email)] : [],
                    ph: event.phone ? [hashValue(event.phone)] : [],
                    fn: event.firstName ? [hashValue(event.firstName)] : [],
                    ln: event.lastName ? [hashValue(event.lastName)] : []
                },
                custom_data: event.customData || {}
            }
        ],
        ...(testCode ? { test_event_code: testCode } : {})
    };

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), INTEGRATION_TIMEOUT_MS);
        const response = await fetch(`https://graph.facebook.com/v17.0/${pixelId}/events?access_token=${accessToken}`, {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).finally(() => clearTimeout(timer));

        const result = await response.json();

        if (!response.ok) {
            console.error("Facebook CAPI Error:", result);
            return { ok: false, error: result };
        }

        return { ok: true, result };
    } catch (error) {
        console.error("Facebook CAPI Connection Error:", error);
        return { ok: false, error };
    }
}
