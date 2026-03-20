import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readIntegrationConfig, writeIntegrationConfig } from "@/lib/integration-config";

function isAdmin() {
    const auth = cookies().get("fluenverse_admin_auth")?.value;
    const role = cookies().get("fluenverse_user_role")?.value?.toLowerCase();
    return auth === "1" && role === "admin";
}

export async function GET() {
    if (!isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { config, source } = await readIntegrationConfig();
    return NextResponse.json({ ...config, _source: source });
}

export async function POST(request: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const newConfig = (await request.json()) as Record<string, string>;
        const result = await writeIntegrationConfig(newConfig);
        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({ success: true, source: "db" });
    } catch (error) {
        console.error("Erro ao salvar configuração:", error);
        return NextResponse.json({ error: "Falha ao salvar configuração no banco." }, { status: 500 });
    }
}
