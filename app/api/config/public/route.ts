import { NextResponse } from "next/server";
import { readIntegrationConfig, PUBLIC_CONFIG_KEYS } from "@/lib/integration-config";

export async function GET() {
    const { config } = await readIntegrationConfig();

    // Filter only public keys
    const publicConfig: Record<string, string> = {};
    for (const key of PUBLIC_CONFIG_KEYS) {
        publicConfig[key] = config[key] || "";
    }

    return NextResponse.json(publicConfig);
}
