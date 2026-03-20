import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendTelegramNotification } from "@/lib/telegram-server";
import { sendTwilioSms } from "@/lib/twilio-server";
import { sendFacebookConversionEvent } from "@/lib/facebook-server";

function isAdmin() {
    const auth = cookies().get("fluenverse_admin_auth")?.value;
    const role = cookies().get("fluenverse_user_role")?.value?.toLowerCase();
    return auth === "1" && role === "admin";
}

export async function POST(request: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, data } = await request.json();

        if (type === "telegram") {
            const { botToken, chatId } = data;
            if (!botToken || !chatId) {
                return NextResponse.json({ error: "Bot Token and Chat ID are required" }, { status: 400 });
            }

            // We need to override the config temporarily or just use the fetch directly
            // Since sendTelegramNotification reads from config, we'll do a manual fetch here for testing
            const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const errors = [];

            for (const id of chatIds) {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: id,
                        text: "🔔 <b>Fluenverse Test Message</b>\n\nYour Telegram integration is working correctly!",
                        parse_mode: "HTML",
                    }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    errors.push(`ID ${id}: ${err.description || "Unknown error"}`);
                }
            }

            if (errors.length > 0) {
                return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
            }

            return NextResponse.json({ success: true, message: "Test message sent to all IDs!" });
        }

        if (type === "twilio") {
            const { accountSid, authToken, fromNumber, toNumbers } = data;
            if (!accountSid || !authToken || !fromNumber || !toNumbers) {
                return NextResponse.json({ error: "All Twilio fields are required" }, { status: 400 });
            }

            const numbers = toNumbers.split(",").map((n: string) => n.trim()).filter(Boolean);
            const errors = [];

            for (const num of numbers) {
                try {
                    await sendTwilioSms(num, "Fluenverse Test Message: Your Twilio integration is working!", {
                        accountSid,
                        authToken,
                        from: fromNumber
                    });
                } catch (err: any) {
                    errors.push(`${num}: ${err.message}`);
                }
            }

            if (errors.length > 0) {
                return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
            }

            return NextResponse.json({ success: true, message: "Test SMS sent to all numbers!" });
        }

        if (type === "facebook") {
            const { datasetId, accessToken, testEventCode } = data;
            if (!datasetId || !accessToken) {
                return NextResponse.json({ error: "Dataset ID and Access Token are required" }, { status: 400 });
            }

            // Temporarily use these values for testing
            // Since sendFacebookConversionEvent reads from config, we'll do a manual fetch here for testing
            const payload = {
                data: [
                    {
                        event_name: "TestEvent",
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: "website",
                        user_data: {
                            em: []
                        }
                    }
                ],
                ...(testEventCode ? { test_event_code: testEventCode } : {})
            };

            const response = await fetch(`https://graph.facebook.com/v17.0/${datasetId}/events?access_token=${accessToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                return NextResponse.json({ error: result.error?.message || "Facebook API Error" }, { status: 400 });
            }

            return NextResponse.json({ success: true, message: "Connection successful!", details: result });
        }

        return NextResponse.json({ error: "Invalid test type" }, { status: 400 });

    } catch (error: any) {
        console.error("Test integration error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
