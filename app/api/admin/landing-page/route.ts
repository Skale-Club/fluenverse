
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readLandingPageContent, writeLandingPageContent } from "@/lib/site-content";

function isAdmin() {
    const auth = cookies().get("fluenverse_admin_auth")?.value;
    const role = cookies().get("fluenverse_user_role")?.value?.toLowerCase();
    const isAd = auth === "1" && role === "admin";
    console.log("Auth Check:", { auth, role, isAd });
    return isAd;
}

export async function GET() {
    if (!isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const content = await readLandingPageContent();
    return NextResponse.json(content);
}

export async function POST(request: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
    }
    try {
        const content = await request.json();
        console.log("Saving landing page content:", JSON.stringify(content).slice(0, 100) + "...");
        const result = await writeLandingPageContent(content);
        if (!result.ok) {
            console.error("Write failed:", result.error);
            return NextResponse.json({ error: result.error || "Erro no banco de dados." }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving landing page API:", error);
        return NextResponse.json({ error: "Falha ao processar os dados." }, { status: 500 });
    }
}
